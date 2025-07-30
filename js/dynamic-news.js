// Dynamic News Loading for Homepage
class DynamicNewsLoader {
    constructor() {
        this.db = null;
        this.initializeFirebase();
        this.loadNews();
    }

    // Initialize Firebase
    initializeFirebase() {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(CONFIG.FIREBASE);
            this.db = firebase.firestore();
        } else {
            console.error('Firebase not loaded');
            this.showError('Failed to load news system');
        }
    }

    // Load news from Firestore
    async loadNews() {
        try {
            if (!this.db) {
                this.showError('Database not available');
                return;
            }

            const snapshot = await this.db.collection('news')
                .orderBy('publishedAt', 'desc')
                .limit(6) // Show latest 6 news articles
                .get();

            const newsGrid = document.getElementById('news-cards-grid');
            if (!newsGrid) return;

            if (snapshot.empty) {
                this.showNoNews();
                return;
            }

            newsGrid.innerHTML = '';
            snapshot.forEach(doc => {
                const newsData = doc.data();
                const newsCard = this.createNewsCard(newsData, doc.id);
                newsGrid.appendChild(newsCard);
            });

        } catch (error) {
            console.error('Error loading news:', error);
            this.showError('Failed to load news articles');
        }
    }

    // Create news card element
    createNewsCard(newsData, docId) {
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
        excerpt.textContent = newsData.excerpt || this.truncateText(newsData.content, 150);

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
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Show loading state
    showLoading() {
        const newsGrid = document.getElementById('news-cards-grid');
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
    showError(message) {
        const newsGrid = document.getElementById('news-cards-grid');
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
    showNoNews() {
        const newsGrid = document.getElementById('news-cards-grid');
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

// Initialize dynamic news loader when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the homepage
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        new DynamicNewsLoader();
    }
}); 