import { ApiService } from './api.js';
import { StorageService } from './storage.js';
import { UiController } from './ui.js';

/*Layer Application Setup Block */
class MovieManiacApp {
    constructor() {
        this.api = new ApiService();
        this.storage = new StorageService();
        this.ui = new UiController('movieGrid', 'movieModal', 'modalContent');

        this.currentView = 'trending'; 
        this.activeMoviesBuffer = [];   
    }

    /*Start the application lifecycle and hook up event listeners*/
    async init() {
        this.setupEventHub();
        this.applyTheme(this.storage.getTheme());
        this.updateWatchlistCounter();

        // Re-hydrate view based on existing search or fallback preference
        const persistedSearch = this.storage.getLastQuery();
        const persistedGenre = this.storage.getGenrePreference();

        document.getElementById('genreFilter').value = persistedGenre;

        if (persistedSearch) {
            document.getElementById('searchInput').value = persistedSearch;
            await this.executeSearch(persistedSearch);
        } else {
            await this.loadTrendingView();
        }
    }

    /*Bind Unique Operational Framework Interaction Events */
    setupEventHub() {
        // Event 1: Dom Submit Form Processing Execution
        document.getElementById('searchForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const queryText = document.getElementById('searchInput').value.trim();
            if (queryText) {
                this.storage.setLastQuery(queryText);
                await this.executeSearch(queryText);
            }
        });

        // Event 2: Value Modification Dynamic Change Filter Listener
        document.getElementById('genreFilter').addEventListener('change', (e) => {
            this.storage.setGenrePreference(e.target.value);
            this.applyLocalRenderFilters();
        });

        // Event 3: Handles modal popup details and watchlist updates
        document.getElementById('movieGrid').addEventListener('click', async (e) => {
            const targetButton = e.target.closest('.action-watchlist-btn');
            const targetCard = e.target.closest('.flip-card-inner');

            if (targetButton) {
                const movieId = parseInt(targetButton.dataset.id, 10);
                const movieSource = this.currentView === 'watchlist'
                    ? this.storage.getWatchlist()
                    : this.activeMoviesBuffer;
                const targetedMovie = movieSource.find(m => m.id === movieId);
                if (targetedMovie) {
                    this.storage.toggleWatchlist(targetedMovie);
                    this.updateWatchlistCounter();
                    this.applyLocalRenderFilters();
                }
                return;
            }

            if (targetCard) {
                const id = targetCard.dataset.id;
                this.ui.showLoader();
                const deepDetailsObj = await this.api.fetchMovieDetails(id);
                if (deepDetailsObj) {
                    this.ui.renderModal(deepDetailsObj);
                } else {
                    this.applyLocalRenderFilters();
                }
            }
        });

        // Event 4: Dashboard Tab Control View Toggles
        document.getElementById('showTrendingBtn').addEventListener('click', () => this.switchViewMode('trending'));
        document.getElementById('showWatchlistBtn').addEventListener('click', () => this.switchViewMode('watchlist'));

        // Theme Click Activations 
        const toggleThemeLogic = () => {
            const targetedNextMode = this.storage.getTheme() === 'dark' ? 'light' : 'dark';
            this.applyTheme(targetedNextMode);
        };
        document.getElementById('themeToggle').addEventListener('click', toggleThemeLogic);
        document.getElementById('desktopThemeToggle').addEventListener('click', toggleThemeLogic);

        // Modal Control Closing Handlers
        document.getElementById('closeModalBtn').addEventListener('click', () => this.ui.closeModal());

        // Event 5: Keyboard escape handling configuration
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.ui.closeModal();
        });
    }

    async loadTrendingView() {
        this.currentView = 'trending';
        this.ui.showLoader();
        this.activeMoviesBuffer = await this.api.fetchTrendingMovies();
        this.applyLocalRenderFilters();
    }

    async executeSearch(queryStr) {
        this.currentView = 'search';
        document.getElementById('showTrendingBtn').classList.remove('is-active');
        document.getElementById('sectionTitle').textContent = `Results for: "${queryStr}"`;

        this.ui.showLoader();
        this.activeMoviesBuffer = await this.api.searchMovies(queryStr);
        this.applyLocalRenderFilters();
    }

    switchViewMode(targetMode) {
        const trendBtn = document.getElementById('showTrendingBtn');
        const watchBtn = document.getElementById('showWatchlistBtn');

        if (targetMode === 'trending') {
            trendBtn.classList.add('is-active');
            watchBtn.classList.remove('is-active');
            document.getElementById('searchInput').value = '';
            this.storage.setLastQuery('');
            this.loadTrendingView();
        } else {
            watchBtn.classList.add('is-active');
            trendBtn.classList.remove('is-active');
            this.currentView = 'watchlist';
            this.applyLocalRenderFilters();
        }
    }

    applyLocalRenderFilters() {
        const selectedGenre = this.storage.getGenrePreference();
        const watchlistData = this.storage.getWatchlist();
        const favIds = watchlistData.map(m => m.id);

        let processingCollection = this.currentView === 'watchlist' ? watchlistData : this.activeMoviesBuffer;

        // Handle text labels context
        if (this.currentView === 'trending') {
            document.getElementById('sectionTitle').textContent = 'Trending Movies This Week';
        } else if (this.currentView === 'watchlist') {
            document.getElementById('sectionTitle').textContent = 'My Personal Watchlist';
        }

        // Apply programmatic genre extraction tracking filters
        if (selectedGenre !== 'all') {
            const targetGenreInt = parseInt(selectedGenre, 10);
            processingCollection = processingCollection.filter(movie =>
                movie.genreIds && movie.genreIds.includes(targetGenreInt)
            );
        }

        this.ui.renderGrid(processingCollection, favIds);
    }

    applyTheme(theme) {
        this.storage.setTheme(theme);
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }

    updateWatchlistCounter() {
        const count = this.storage.getWatchlist().length;
        document.getElementById('watchlistCount').textContent = count;
    }
}

// initialize the app once the document has fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MovieManiacApp();
    app.init();
});
