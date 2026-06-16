/*MovieManiac Local Storage Persistent State Management Framework */

export class StorageService {
    constructor() {
        this.PREFIX = 'movie_maniac_';
        this.KEYS = {
            WATCHLIST: `${this.PREFIX}watchlist`,       // Property 1: JSON Array Data
            THEME: `${this.PREFIX}theme`,               // Property 2: String Value
            LAST_QUERY: `${this.PREFIX}last_query`,     // Property 3: String Value
            GENRE_PREF: `${this.PREFIX}genre_pref`      // Property 4: String Value
        };
    }

    getWatchlist() {
        const data = localStorage.getItem(this.KEYS.WATCHLIST);
        return data ? JSON.parse(data) : [];
    }

    toggleWatchlist(movieObj) {
        const currentList = this.getWatchlist();
        const index = currentList.findIndex(item => item.id === movieObj.id);

        if (index > -1) {
            currentList.splice(index, 1);  
        } else {
            currentList.push(movieObj);    
        }
        localStorage.setItem(this.KEYS.WATCHLIST, JSON.stringify(currentList));
        return currentList;
    }

    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'dark';
    }

    setTheme(themeName) {
        localStorage.setItem(this.KEYS.THEME, themeName);
    }

    getLastQuery() {
        return localStorage.getItem(this.KEYS.LAST_QUERY) || '';
    }

    setLastQuery(query) {
        localStorage.setItem(this.KEYS.LAST_QUERY, query);
    }

    getGenrePreference() {
        return localStorage.getItem(this.KEYS.GENRE_PREF) || 'all';
    }

    setGenrePreference(genreId) {
        localStorage.setItem(this.KEYS.GENRE_PREF, genreId);
    }
}