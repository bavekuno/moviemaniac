/**
 * MovieManiac API Data Orchestration Layer Engine
 * Connects seamlessly to both TMDb and OMDb REST APIs.
 */
export class ApiService {
    constructor() {
        // Replace with your real API keys
        this.tmdbKey = '1a85fd28c4c398e4ece5840bcfc183e1';
        this.omdbKey = '963d9b4f';
        this.tmdbBaseUrl = 'https://api.themoviedb.org/3';
        this.omdbBaseUrl = 'https://www.omdbapi.com/';
    }

    /**
     * Fetch trending weekly movies from TMDb API (Endpoint 1)
     */
    async fetchTrendingMovies() {
        try {
            const response = await fetch(`${this.tmdbBaseUrl}/trending/movie/week?api_key=${this.tmdbKey}`);
            if (!response.ok) throw new Error('Failed to download trending collection analytics profiles.');
            const data = await response.json();
            return this._hydrateMovies(data.results);
        } catch (error) {
            console.error('Error in fetchTrendingMovies:', error);
            return [];
        }
    }

    /**
     * Query specialized matching targets via text queries on TMDb (Endpoint 2)
     */
    async searchMovies(query) {
        try {
            const response = await fetch(`${this.tmdbBaseUrl}/search/movie?api_key=${this.tmdbKey}&query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search request failed.');
            const data = await response.json();
            return this._hydrateMovies(data.results);
        } catch (error) {
            console.error('Error in searchMovies:', error);
            return [];
        }
    }

    /**
     * Pull absolute ID records from unique resource pathways (Endpoint 3)
     */
    async fetchMovieDetails(tmdbId) {
        try {
            const detailRes = await fetch(`${this.tmdbBaseUrl}/movie/${tmdbId}?api_key=${this.tmdbKey}`);
            if (!detailRes.ok) throw new Error('TMDb metadata hydration pipeline mismatch.');
            const tmdbData = await detailRes.json();

            // Bridge endpoint call using returned parameter to query secondary OMDb system (Endpoint 4)
            let omdbData = {};
            if (tmdbData.imdb_id) {
                const omdbRes = await fetch(`${this.omdbBaseUrl}?apikey=${this.omdbKey}&i=${tmdbData.imdb_id}`);
                if (omdbRes.ok) omdbData = await omdbRes.json();
            }

            // Normalizes final unified object capturing exactly 8+ unique properties
            return {
                id: tmdbData.id,
                title: tmdbData.title,
                poster: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : 'https://placehold.co/500x750?text=No+Poster',
                backdrop: tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}` : '',
                overview: tmdbData.overview || 'Synopsis content not currently localized.',
                releaseDate: tmdbData.release_date || 'Unknown',
                genres: tmdbData.genres ? tmdbData.genres.map(g => g.name) : [],
                genreIds: tmdbData.genres ? tmdbData.genres.map(g => g.id) : [],
                runtime: tmdbData.runtime ? `${tmdbData.runtime} mins` : 'N/A',
                imdbRating: omdbData.imdbRating || tmdbData.vote_average?.toFixed(1) || 'N/A',
                boxOffice: omdbData.BoxOffice || 'N/A',
                awards: omdbData.Awards || 'None listed.'
            };
        } catch (error) {
            console.error('Error fetching deep details:', error);
            return null;
        }
    }

    /**
     * Map bulk query lists into unified array sets
     */
    async _hydrateMovies(resultsList) {
        // Enforce parsing constraints to ensure stability
        return resultsList.map(movie => ({
            id: movie.id,
            title: movie.title,
            originalTitle: movie.original_title || movie.title,
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750?text=No+Poster',
            backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : '',
            overview: movie.overview || 'No synopsis data recorded.',
            releaseDate: movie.release_date || 'Unknown Date',
            genreIds: movie.genre_ids || [],
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
            voteCount: movie.vote_count || 0,
            popularity: movie.popularity || 0,
            originalLanguage: movie.original_language ? movie.original_language.toUpperCase() : 'N/A',
            adult: Boolean(movie.adult)
        }));
    }
}
