// Dynamic News Loading for Homepage
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the homepage
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        const newsGrid = document.getElementById('news-cards-grid');
        
        if (!newsGrid) {
            console.error('News grid element not found');
            return;
        }

        // Initialize Firebase using centralized function
        const db = initializeFirebase();
        
        if (!db) {
            console.error('Failed to initialize Firebase');
            showError('Failed to load news system');
            return;
        }
        
        // Load news
        loadNews();

        async function loadNews() {
            try {
                showLoading();
                
                const snapshot = await db.collection('news')
                    .orderBy('publishedAt', 'desc')
                    .limit(6) // Show latest 6 news articles
                    .get();

                if (snapshot.empty) {
                    showNoNews();
                    return;
                }

                newsGrid.innerHTML = '';
                snapshot.forEach(doc => {
                    const newsData = doc.data();
                    const newsCard = createNewsCard(newsData, doc.id);
                    newsGrid.appendChild(newsCard);
                });

            } catch (error) {
                console.error('Error loading news:', error);
                showError('Failed to load news articles');
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