document.addEventListener('DOMContentLoaded', () => {
    // Search form elements
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchQueryElement = document.getElementById('search-query');
    const resultsCountElement = document.getElementById('results-count');
    const searchResultsList = document.getElementById('search-results-list');

    // URL form elements
    const urlForm = document.getElementById('url-form');
    const urlInput = document.getElementById('url-input');
    const loadingElement = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const contentDisplay = document.getElementById('content-display');
    const originalUrlElement = document.getElementById('original-url');
    const pageTitleElement = document.getElementById('page-title');

    // Search form handler
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const query = searchInput.value.trim();

        if (!query) {
            showError('Please enter a search query');
            return;
        }

        // Show loading indicator
        loadingElement.classList.remove('hidden');
        searchResultsContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        errorMessage.classList.add('hidden');

        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Search failed');
            }

            // Display search results
            displaySearchResults(data.query, data.results);
        } catch (error) {
            showError(error.message);
        } finally {
            loadingElement.classList.add('hidden');
        }
    });

    // Display search results
    function displaySearchResults(query, results) {
        searchQueryElement.textContent = query;
        resultsCountElement.textContent = results.length;

        // Clear previous results
        searchResultsList.innerHTML = '';

        // Create result items
        results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';

            resultItem.innerHTML = `
                <div class="result-rank">#${index + 1}</div>
                <div class="result-content">
                    <h3 class="result-title">
                        <a href="${result.url}" target="_blank" rel="noopener noreferrer">${result.title}</a>
                    </h3>
                    <p class="result-description">${result.description}</p>
                    <div class="result-meta">
                        <span class="result-source">${result.source}</span>
                        <span class="result-score">Relevance: ${(result.score * 100).toFixed(0)}%</span>
                        <span class="result-url">${result.url}</span>
                    </div>
                </div>
            `;

            searchResultsList.appendChild(resultItem);
        });

        // Show results container
        searchResultsContainer.classList.remove('hidden');
    }

    // URL form handler
    urlForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Please enter a valid URL');
            return;
        }
        
        // Show loading indicator
        loadingElement.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        searchResultsContainer.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        try {
            const response = await fetch('/fetch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch content');
            }
            
            // Update the info bar
            originalUrlElement.textContent = url;
            originalUrlElement.href = url;
            pageTitleElement.textContent = data.title || 'No title';
            
            // Create a sandboxed iframe to display the content
            const iframe = document.createElement('iframe');
            iframe.sandbox = 'allow-same-origin allow-scripts';
            contentDisplay.innerHTML = '';
            contentDisplay.appendChild(iframe);
            
            // Write the modified HTML to the iframe
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            iframeDocument.open();
            iframeDocument.write(data.content);
            iframeDocument.close();
            
            // Adjust iframe height to match content
            iframe.onload = function() {
                iframe.style.height = iframeDocument.body.scrollHeight + 'px';
                
                // Make sure links open in a new tab
                const links = iframeDocument.querySelectorAll('a');
                links.forEach(link => {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                });
            };
            
            // Show result container
            resultContainer.classList.remove('hidden');
        } catch (error) {
            showError(error.message);
        } finally {
            // Hide loading indicator
            loadingElement.classList.add('hidden');
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
});
