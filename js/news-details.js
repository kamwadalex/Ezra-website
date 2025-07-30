// News Details Page Functionality
class NewsDetailsLoader {
    constructor() {
        this.db = null;
        this.newsId = this.getNewsIdFromUrl();
        this.initializeFirebase();
        this.loadNewsDetails();
    }

    // Get news ID from URL parameter
    getNewsIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
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

    // Load news details from Firestore
    async loadNewsDetails() {
        try {
            if (!this.newsId) {
                this.showError('No news article specified');
                return;
            }

            if (!this.db) {
                this.showError('Database not available');
                return;
            }

            const doc = await this.db.collection('news').doc(this.newsId).get();

            if (!doc.exists) {
                this.showError('Article not found');
                return;
            }

            const newsData = doc.data();
            this.displayNewsDetails(newsData);

        } catch (error) {
            console.error('Error loading news details:', error);
            this.showError('Failed to load article');
        }
    }

    // Display news details
    displayNewsDetails(newsData) {
        // Hide loading state
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        // Show news content
        const newsContent = document.getElementById('news-content');
        if (newsContent) {
            newsContent.style.display = 'block';
        }

        // Update page title
        document.title = `${newsData.title} | Ezra Memorial Secondary School`;

        // Set news image
        const newsImage = document.getElementById('news-image');
        if (newsImage) {
            newsImage.src = newsData.imageUrl || '../../images/slide1.jpg';
            newsImage.alt = newsData.title;
            newsImage.onerror = function() {
                this.src = '../../images/slide1.jpg';
            };
        }

        // Set news title
        const newsTitle = document.getElementById('news-title');
        if (newsTitle) {
            newsTitle.textContent = newsData.title;
        }

        // Set publish date
        const newsDate = document.getElementById('news-date');
        if (newsDate) {
            const publishDate = newsData.publishedAt ? 
                newsData.publishedAt.toDate().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'Recently';
            newsDate.textContent = publishDate;
        }

        // Set news body content
        const newsBody = document.getElementById('news-body');
        if (newsBody) {
            // Convert content to paragraphs
            const paragraphs = newsData.content.split('\n').filter(para => para.trim() !== '');
            
            newsBody.innerHTML = '';
            paragraphs.forEach(paragraph => {
                if (paragraph.trim()) {
                    const p = document.createElement('p');
                    p.textContent = paragraph;
                    newsBody.appendChild(p);
                }
            });

            // Add author info if available
            if (newsData.publishedBy) {
                const authorDiv = document.createElement('div');
                authorDiv.className = 'news-author';
                authorDiv.innerHTML = `
                    <p><strong>Published by:</strong> ${newsData.publishedBy}</p>
                `;
                newsBody.appendChild(authorDiv);
            }
        }
    }

    // Show error state
    showError(message) {
        // Hide loading state
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        // Show error state
        const errorState = document.getElementById('error-state');
        if (errorState) {
            errorState.style.display = 'block';
            
            // Update error message
            const errorMessage = errorState.querySelector('p');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
    }
}

// Initialize news details loader when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the news details page
    if (window.location.pathname.includes('news-details.html')) {
        new NewsDetailsLoader();
    }
}); 