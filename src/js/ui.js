/* MovieManiac Interface Document Modification Engine*/

export class UiController {
    constructor(gridContainerId, modalId, modalContentId) {
        this.grid = document.getElementById(gridContainerId);
        this.modal = document.getElementById(modalId);
        this.modalContent = document.getElementById(modalContentId);
    }

    showLoader() {
        this.grid.innerHTML = '';
        const loaderWrapper = document.createElement('div');
        loaderWrapper.className = 'grid-status';

        const spinner = document.createElement('span');
        spinner.className = 'loader';

        loaderWrapper.appendChild(spinner);
        this.grid.appendChild(loaderWrapper);
    }

    /* movie cards layout */
    renderGrid(moviesList, watchlistIds = []) {
        this.grid.innerHTML = '';
        if (moviesList.length === 0) {
            const noDataMsg = document.createElement('p');
            noDataMsg.className = 'grid-empty';
            noDataMsg.textContent = 'No records matched your specific filter targets.';
            this.grid.appendChild(noDataMsg);
            return;
        }

        moviesList.forEach((movie, index) => {
            const isFav = watchlistIds.includes(movie.id);

            // 3D Flip Card Frame Base Context Structure
            const cardFrame = document.createElement('article');
            cardFrame.className = 'flip-card card-entrance';
            cardFrame.style.animationDelay = `${index * 0.05}s`;  

            const cardInner = document.createElement('div');
            cardInner.className = 'flip-card-inner';
            cardInner.dataset.id = movie.id;  

            // Front Card Representation
            const frontFace = document.createElement('div');
            frontFace.className = 'flip-card-front';

            const posterImg = document.createElement('img');
            posterImg.src = movie.poster;
            posterImg.alt = `${movie.title} Poster Graphic`;
            posterImg.loading = 'lazy';
            posterImg.className = 'movie-poster';

            const infoBanner = document.createElement('div');
            infoBanner.className = 'movie-card-info';

            const titleText = document.createElement('h3');
            titleText.className = 'movie-card-title';
            titleText.textContent = movie.title;

            const subMeta = document.createElement('p');
            subMeta.className = 'movie-card-meta';
            subMeta.textContent = `Released: ${movie.releaseDate.split('-')[0]}`;

            infoBanner.appendChild(titleText);
            infoBanner.appendChild(subMeta);
            frontFace.appendChild(posterImg);
            frontFace.appendChild(infoBanner);

            // Back Card Representation
            const backFace = document.createElement('div');
            backFace.className = 'flip-card-back';

            const backTitle = document.createElement('h3');
            backTitle.className = 'movie-back-title';
            backTitle.textContent = movie.title;

            const summaryBlock = document.createElement('p');
            summaryBlock.className = 'movie-summary';
            summaryBlock.textContent = movie.overview;

            const attributeList = document.createElement('dl');
            attributeList.className = 'movie-attribute-list';

            const attributeData = [
                { label: 'Language', value: movie.originalLanguage || 'N/A' },
                { label: 'Votes', value: Number(movie.voteCount || 0).toLocaleString() },
                { label: 'Popularity', value: Math.round(Number(movie.popularity || 0)).toLocaleString() }
            ];

            attributeData.forEach(item => {
                const row = document.createElement('div');
                row.className = 'movie-attribute-row';

                const term = document.createElement('dt');
                term.textContent = item.label;

                const description = document.createElement('dd');
                description.textContent = item.value;

                row.appendChild(term);
                row.appendChild(description);
                attributeList.appendChild(row);
            });

            const bottomBar = document.createElement('div');
            bottomBar.className = 'movie-card-actions';

            const scoreBadge = document.createElement('span');
            scoreBadge.className = 'score-badge';
            scoreBadge.textContent = `★ ${movie.rating || 'N/A'}`;

            const actionBtn = document.createElement('button');
            actionBtn.className = `action-watchlist-btn watchlist-button ${isFav ? 'is-saved' : ''}`;
            actionBtn.textContent = isFav ? 'Remove' : '+ Watchlist';
            actionBtn.dataset.id = movie.id;
            bottomBar.appendChild(scoreBadge);
            bottomBar.appendChild(actionBtn);
            backFace.appendChild(backTitle);
            backFace.appendChild(summaryBlock);
            backFace.appendChild(attributeList);
            backFace.appendChild(bottomBar);

            cardInner.appendChild(frontFace);
            cardInner.appendChild(backFace);
            cardFrame.appendChild(cardInner);
            this.grid.appendChild(cardFrame);
        });
    }

    /* show overlay details panel  Unique Attributes shown */
    renderModal(details) {
        this.modalContent.innerHTML = '';

        const layoutGrid = document.createElement('div');
        layoutGrid.className = 'modal-layout';

        // Left Frame Column
        const imgCol = document.createElement('div');
        const modalImg = document.createElement('img');
        modalImg.src = details.poster;
        modalImg.alt = details.title;
        modalImg.className = 'modal-poster';
        imgCol.appendChild(modalImg);

        // Right Content Frame Column
        const contentCol = document.createElement('div');
        contentCol.className = 'modal-detail-column';

        const headGroup = document.createElement('div');
        const mTitle = document.createElement('h2');
        mTitle.id = 'modalTitle';
        mTitle.className = 'modal-title';
        mTitle.textContent = details.title;

        // Display Genre Badges
        const genreRow = document.createElement('div');
        genreRow.className = 'genre-row';
        details.genres.forEach(genreName => {
            const b = document.createElement('span');
            b.className = 'genre-badge';
            b.textContent = genreName;
            genreRow.appendChild(b);
        });

        const pPlot = document.createElement('p');
        pPlot.className = 'modal-overview';
        pPlot.textContent = details.overview;

        headGroup.appendChild(mTitle);
        headGroup.appendChild(genreRow);
        headGroup.appendChild(pPlot);

        // Metrics Table Mapping Deep Hybrid API Core Attributes
        const metricsGrid = document.createElement('div');
        metricsGrid.className = 'metrics-grid';

        const metricsData = [
            { label: 'Released', value: details.releaseDate },
            { label: 'Runtime', value: details.runtime },
            { label: 'IMDb Rating', value: `★ ${details.imdbRating} / 10` },
            { label: 'Box Office', value: details.boxOffice },
            { label: 'Awards Won', value: details.awards }
        ];

        metricsData.forEach(item => {
            const lbl = document.createElement('span');
            lbl.className = 'metric-label';
            lbl.textContent = item.label;

            const val = document.createElement('span');
            val.className = 'metric-value';
            val.textContent = item.value;

            metricsGrid.appendChild(lbl);
            metricsGrid.appendChild(val);
        });

        contentCol.appendChild(headGroup);
        contentCol.appendChild(metricsGrid);

        layoutGrid.appendChild(imgCol);
        layoutGrid.appendChild(contentCol);
        this.modalContent.appendChild(layoutGrid);

        // Animate Modal Open View State
        this.modal.classList.remove('is-hidden');
        setTimeout(() => {
            this.modal.classList.add('is-visible');
            this.modal.firstElementChild.classList.remove('is-scaled');
        }, 10);
    }

    closeModal() {
        this.modal.classList.remove('is-visible');
        this.modal.firstElementChild.classList.add('is-scaled');
        setTimeout(() => {
            this.modal.classList.add('is-hidden');
        }, 300);
    }
}
