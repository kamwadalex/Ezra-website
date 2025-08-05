// Dynamic News Loading for Homepage
document.addEventListener('DOMContentLoaded', function() {
    console.log('News loader: DOMContentLoaded fired');
    console.log('News loader: Current pathname:', window.location.pathname);
    
    // Check if we're on the homepage (including GitHub Pages subdirectory)
    const isHomepage = window.location.pathname === '/' || 
                      window.location.pathname.endsWith('index.html') ||
                      window.location.pathname.endsWith('/Ezra-website/') ||
                      window.location.pathname.endsWith('/Ezra-website/index.html');
    
    if (isHomepage) {
        console.log('News loader: On homepage, proceeding with news loading');
        const newsGrid = document.getElementById('news-cards-grid');
        console.log('News loader: Looking for news grid element:', newsGrid);
        
        if (!newsGrid) {
            console.error('News loader: News grid element not found');
            return;
        }
        
        console.log('News loader: News grid element found successfully');

        console.log('News loader: Starting initialization...');

        // Initialize Firebase using centralized function
        const db = initializeFirebase();
        
        if (!db) {
            console.error('News loader: Failed to initialize Firebase');
            showError('Failed to load news system');
            return;
        }

        console.log('News loader: Firebase initialized successfully');
        
        // Load news immediately like events loader
        loadNews();

        async function loadNews() {
            try {
                console.log('News loader: Starting to load news...');
                showLoading();
                
                const snapshot = await db.collection('news')
                    .orderBy('publishedAt', 'desc')
                    .limit(6) // Show latest 6 news articles
                    .get();

                console.log('News loader: Got snapshot, empty:', snapshot.empty);

                if (snapshot.empty) {
                    console.log('News loader: No news found, showing no news message');
                    showNoNews();
                    return;
                }

                console.log('News loader: Processing', snapshot.size, 'news articles');
                newsGrid.innerHTML = '';
                snapshot.forEach(doc => {
                    const newsData = doc.data();
                    const newsCard = createNewsCard(newsData, doc.id);
                    newsGrid.appendChild(newsCard);
                });

                console.log('News loader: Successfully loaded news');

            } catch (error) {
                console.error('News loader: Error loading news:', error);
                showError('Failed to load news articles: ' + error.message);
            }
        }

        // Create news card element
        function createNewsCard(newsData, docId) {
            const article = document.createElement('article');
            article.className = 'news-card';

            // Format date
            const publishDate = newsData.publishedAt ? 
                newsData.publishedAt.toDate().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'Recently';

            // Create image element
            const img = document.createElement('img');
            img.src = newsData.imageUrl || 'images/slide1.jpg';
            img.alt = newsData.title;
            img.className = 'news-card-img';
            img.onerror = function() {
                this.src = 'images/slide1.jpg';
            };

            // Create content div
            const content = document.createElement('div');
            content.className = 'news-card-content';

            // Create title
            const title = document.createElement('h3');
            title.textContent = newsData.title;

            // Create excerpt
            const excerpt = document.createElement('p');
            excerpt.className = 'news-card-excerpt';
            excerpt.textContent = newsData.excerpt || truncateText(newsData.content, 150);

            // Create date
            const date = document.createElement('p');
            date.className = 'news-date';
            date.textContent = publishDate;

            // Create read more button
            const readMoreBtn = document.createElement('a');
            readMoreBtn.href = `pages/news/news-details.html?id=${docId}`;
            readMoreBtn.className = 'news-card-btn';
            readMoreBtn.textContent = 'Read More';

            // Assemble the card
            content.appendChild(title);
            content.appendChild(date);
            content.appendChild(excerpt);
            content.appendChild(readMoreBtn);

            article.appendChild(img);
            article.appendChild(content);

            return article;
        }

        // Truncate text to specified length
        function truncateText(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }

        // Show loading state
        function showLoading() {
            if (newsGrid) {
                newsGrid.innerHTML = `
                    <div class="loading-news">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading latest news...</p>
                    </div>
                `;
            }
        }

        // Show error state
        function showError(message) {
            if (newsGrid) {
                newsGrid.innerHTML = `
                    <div class="error-news">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>${message}</p>
                        <button onclick="location.reload()" class="retry-btn">Retry</button>
                    </div>
                `;
            }
        }

        // Show no news state
        function showNoNews() {
            if (newsGrid) {
                newsGrid.innerHTML = `
                    <div class="no-news">
                        <i class="fas fa-newspaper"></i>
                        <p>No news articles available yet.</p>
                        <p>Check back soon for updates!</p>
                    </div>
                `;
            }
        }
    }
}); 