// Admin Dashboard Functionality
class AdminDashboard {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.selectedImages = new Set();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
        this.sessionTimer = null;
        this.activityTimer = null;
        this.initializeFirebase();
        this.bindEvents();
        this.checkAuthStatus();
        this.initializeSessionManagement();
    }

    // Initialize Firebase
    initializeFirebase() {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(CONFIG.FIREBASE);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
        } else {
            console.error('Firebase not loaded');
        }
    }

    // Initialize session management
    initializeSessionManagement() {
        // Set up activity monitoring
        this.setupActivityMonitoring();
        
        // Check for existing session on page load
        this.checkExistingSession();
        
        // Set up page visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSessionTimer();
            } else {
                this.resumeSessionTimer();
            }
        });
    }

    // Set up activity monitoring
    setupActivityMonitoring() {
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.resetSessionTimer();
            }, { passive: true });
        });
    }

    // Check for existing session
    checkExistingSession() {
        const sessionStart = sessionStorage.getItem('adminSessionStart');
        if (sessionStart) {
            const sessionAge = Date.now() - parseInt(sessionStart);
            if (sessionAge > this.sessionTimeout) {
                // Session expired, clear it
                this.clearSession();
                this.showNotification('Session expired due to inactivity', 'info');
            } else {
                // Session still valid, restart timer
                this.startSessionTimer();
            }
        }
    }

    // Start session timer
    startSessionTimer() {
        this.clearSessionTimer();
        
        // Set warning timer (5 minutes before timeout)
        const warningTime = this.sessionTimeout - (5 * 60 * 1000); // 5 minutes before timeout
        setTimeout(() => {
            if (this.isAuthenticated) {
                this.showSessionWarning();
            }
        }, warningTime);
        
        // Set main session timer
        this.sessionTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.sessionTimeout);
        
        // Store session start time
        sessionStorage.setItem('adminSessionStart', Date.now().toString());
        
        // Update session status display (no countdown timer)
        this.updateSessionStatus();
    }

    // Update session status display (no countdown timer)
    updateSessionStatus() {
        if (!this.isAuthenticated) return;
        
        const sessionTimeElement = document.getElementById('session-time');
        const sessionStatusElement = document.getElementById('session-status');
        
        if (sessionTimeElement) {
            sessionTimeElement.textContent = 'Session active';
        }
        
        if (sessionStatusElement) {
            sessionStatusElement.className = 'session-status';
        }
    }

    // Update date and time display
    updateDateTime() {
        const now = new Date();
        
        // Update date
        const dateDisplay = document.getElementById('date-display');
        if (dateDisplay) {
            const dateOptions = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            dateDisplay.textContent = now.toLocaleDateString('en-US', dateOptions);
        }
        
        // Update time
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            const timeOptions = { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            };
            timeDisplay.textContent = now.toLocaleTimeString('en-US', timeOptions);
        }
    }

    // Start date/time updates
    startDateTimeUpdates() {
        // Update immediately
        this.updateDateTime();
        
        // Update every second
        this.dateTimeInterval = setInterval(() => {
            this.updateDateTime();
        }, 1000);
    }

    // Stop date/time updates
    stopDateTimeUpdates() {
        if (this.dateTimeInterval) {
            clearInterval(this.dateTimeInterval);
            this.dateTimeInterval = null;
        }
    }

    // Show session warning
    showSessionWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'session-warning';
        warningDiv.innerHTML = `
            <div class="session-warning-content">
                <i class="fas fa-clock"></i>
                <span>You have been inactive for a while. Your session will expire soon. Click anywhere to stay logged in.</span>
                <button onclick="this.parentElement.parentElement.remove()" class="session-warning-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(warningDiv);
        
        // Auto-remove warning after 4 minutes
        setTimeout(() => {
            if (warningDiv.parentElement) {
                warningDiv.remove();
            }
        }, 4 * 60 * 1000);
    }

    // Reset session timer
    resetSessionTimer() {
        if (this.isAuthenticated) {
            this.startSessionTimer();
        }
    }

    // Clear session timer
    clearSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    // Pause session timer (when page is hidden)
    pauseSessionTimer() {
        this.clearSessionTimer();
    }

    // Resume session timer (when page becomes visible)
    resumeSessionTimer() {
        if (this.isAuthenticated) {
            this.startSessionTimer();
        }
    }

    // Handle session timeout
    handleSessionTimeout() {
        this.showNotification('Session expired due to inactivity. Please log in again.', 'info');
        this.clearSession();
        this.handleLogout();
    }

    // Clear session data
    clearSession() {
        sessionStorage.removeItem('adminSessionStart');
        this.clearSessionTimer();
        this.stopDateTimeUpdates();
        
        // Reset session status display
        const sessionTimeElement = document.getElementById('session-time');
        const sessionStatusElement = document.getElementById('session-status');
        
        if (sessionTimeElement) {
            sessionTimeElement.textContent = 'Session active';
        }
        
        if (sessionStatusElement) {
            sessionStatusElement.className = 'session-status';
        }
        
        this.isAuthenticated = false;
        this.currentUser = null;
    }

    // Bind event listeners
    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Mobile logout button
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Quick action buttons
        const uploadBtn = document.getElementById('upload-images-btn');
        const addNewsBtn = document.getElementById('add-news-btn');
        const manageGalleryBtn = document.getElementById('manage-gallery-btn');
        const viewMessagesBtn = document.getElementById('view-messages-btn');

        if (uploadBtn) uploadBtn.addEventListener('click', () => this.openUploadModal());
        if (addNewsBtn) addNewsBtn.addEventListener('click', () => this.openAddNewsModal());
        if (manageGalleryBtn) manageGalleryBtn.addEventListener('click', () => this.loadAdminGallery());
        if (viewMessagesBtn) viewMessagesBtn.addEventListener('click', () => this.scrollToMessagesSection());

        // Gallery management
        const refreshBtn = document.getElementById('refresh-gallery-btn');
        const deleteSelectedBtn = document.getElementById('delete-selected-btn');

        if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadAdminGallery());
        if (deleteSelectedBtn) deleteSelectedBtn.addEventListener('click', () => this.deleteSelectedImages());

        // Modal close buttons
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Upload form
        const uploadForm = document.getElementById('admin-upload-form');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleAdminUpload(e));
        }

        // Add news form
        const addNewsForm = document.getElementById('add-news-form');
        if (addNewsForm) {
            addNewsForm.addEventListener('submit', (e) => this.handleAddNews(e));
        }

        // File input preview
        const fileInput = document.getElementById('admin-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        }

        // Close modals when clicking outside
        const modals = document.querySelectorAll('.admin-modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        const addNewsArticleBtn = document.getElementById('add-news-article-btn');
        if (addNewsArticleBtn) {
            addNewsArticleBtn.addEventListener('click', () => this.openAddNewsModal());
        }

        // --- MESSAGES MANAGEMENT ---
        const refreshMessagesBtn = document.getElementById('refresh-messages-btn');
        if (refreshMessagesBtn) {
            refreshMessagesBtn.addEventListener('click', () => this.loadMessages());
        }

        // --- NEWS MANAGEMENT ---
        
        // --- EVENTS MANAGEMENT ---
        const manageEventsBtn = document.getElementById('manage-events-btn');
        const addEventBtn = document.getElementById('add-event-btn');
        
        if (manageEventsBtn) manageEventsBtn.addEventListener('click', () => this.scrollToEventsSection());
        if (addEventBtn) addEventBtn.addEventListener('click', () => this.openAddEventModal());
        
        // Add event form
        const addEventForm = document.getElementById('add-event-form');
        if (addEventForm) {
            addEventForm.addEventListener('submit', (e) => this.handleAddEvent(e));
        }

        // Edit event form
        const editEventForm = document.getElementById('edit-event-form');
        if (editEventForm) {
            editEventForm.addEventListener('submit', (e) => this.handleEditEvent(e));
        }
        const refreshNewsBtn = document.getElementById('refresh-news-btn');
        if (refreshNewsBtn) {
            refreshNewsBtn.addEventListener('click', () => this.loadNewsArticles());
        }
    }

    // Check authentication status
    checkAuthStatus() {
        if (this.auth) {
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    this.isAuthenticated = true;
                    this.currentUser = user;
                    this.startSessionTimer(); // Start session timer on successful auth
                    this.showDashboard();
                    this.loadDashboardStats();
                } else {
                    this.isAuthenticated = false;
                    this.currentUser = null;
                    this.clearSession(); // Clear session on logout
                    this.showLogin();
                }
            });
        }
    }

    // Handle login with Firebase Auth
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';

        try {
            await this.auth.signInWithEmailAndPassword(email, password);
            // Auth state change will trigger dashboard display
        } catch (error) {
            console.error('Login error:', error);
            let message = 'Login failed. Please try again.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = 'Invalid email or password.';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Too many failed attempts. Please try again later.';
            }
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    // Handle logout
    async handleLogout() {
        try {
            if (this.auth) {
                await this.auth.signOut();
            }
            this.clearSession(); // Clear session data
            this.isAuthenticated = false;
            this.currentUser = null;
            this.showLogin();
            this.showNotification('Logged out successfully', 'info');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Show login form
    showLogin() {
        const loginSection = document.getElementById('login-section');
        const dashboard = document.getElementById('admin-dashboard');
        
        if (loginSection) loginSection.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }

    // Show dashboard
    showDashboard() {
        const loginSection = document.getElementById('login-section');
        const dashboard = document.getElementById('admin-dashboard');
        const adminName = document.getElementById('admin-name');
        
        if (loginSection) loginSection.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        if (adminName && this.currentUser) {
            adminName.textContent = this.currentUser.displayName || this.currentUser.email || 'Administrator';
        }
        this.loadNewsArticles();
        this.loadMessages();
        this.startDateTimeUpdates();
    }

    // Load dashboard statistics
    async loadDashboardStats() {
        try {
            if (!this.db) return;

            // Get gallery count
            const gallerySnapshot = await this.db.collection('gallery').get();
            const galleryCount = gallerySnapshot.size;

            // Get news count
            const newsSnapshot = await this.db.collection('news').get();
            const newsCount = newsSnapshot.size;

            // Get events count
            const eventsSnapshot = await this.db.collection('events').get();
            const eventsCount = eventsSnapshot.size;

            // Update stats
            const galleryCountEl = document.getElementById('gallery-count');
            const eventsCountEl = document.getElementById('events-count');
            const newsCountEl = document.getElementById('news-count');

            if (galleryCountEl) galleryCountEl.textContent = galleryCount;
            if (eventsCountEl) eventsCountEl.textContent = eventsCount;
            if (newsCountEl) newsCountEl.textContent = newsCount;

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    // Open upload modal
    openUploadModal() {
        const modal = document.getElementById('admin-upload-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Open add news modal
    openAddNewsModal() {
        const modal = document.getElementById('add-news-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Close all modals
    closeAllModals() {
        const modals = document.querySelectorAll('.admin-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
        this.resetForms();
    }

    // Reset forms
    resetForms() {
        const forms = document.querySelectorAll('.admin-modal form');
        forms.forEach(form => form.reset());
        
        const previews = document.querySelectorAll('.file-preview');
        previews.forEach(preview => preview.innerHTML = '');
    }

    // Handle file selection for admin upload
    handleFileSelection(event) {
        const files = Array.from(event.target.files);
        const previewContainer = document.getElementById('admin-file-preview');
        
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }

        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            this.showNotification('Please select valid image files (JPEG, PNG, GIF, WebP) under 5MB', 'error');
            return;
        }

        validFiles.forEach(file => {
            const preview = this.createFilePreview(file);
            if (previewContainer) {
                previewContainer.appendChild(preview);
            }
        });
    }

    // Validate file
    validateFile(file) {
        if (!CONFIG.GALLERY.ALLOWED_TYPES.includes(file.type)) {
            this.showNotification(`${file.name} is not a supported image type`, 'error');
            return false;
        }

        if (file.size > CONFIG.GALLERY.MAX_FILE_SIZE) {
            this.showNotification(`${file.name} is too large (max 5MB)`, 'error');
            return false;
        }

        return true;
    }

    // Create file preview
    createFilePreview(file) {
        const preview = document.createElement('div');
        preview.className = 'file-preview-item';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        
        const name = document.createElement('p');
        name.textContent = file.name;
        name.className = 'file-name';
        
        const size = document.createElement('p');
        size.textContent = this.formatFileSize(file.size);
        size.className = 'file-size';
        
        preview.appendChild(img);
        preview.appendChild(name);
        preview.appendChild(size);
        
        return preview;
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Handle admin upload
    async handleAdminUpload(event) {
        event.preventDefault();
        
        const fileInput = document.getElementById('admin-file-input');
        const files = Array.from(fileInput.files);
        const categorySelect = document.getElementById('admin-image-category');
        const descriptionInput = document.getElementById('admin-image-description');
        
        if (files.length === 0) {
            this.showNotification('Please select at least one image', 'error');
            return;
        }

        const category = categorySelect ? categorySelect.value : 'General';
        const description = descriptionInput ? descriptionInput.value : '';

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Upload to Cloudinary
                const cloudinaryUrl = await this.uploadToCloudinary(file);
                
                // Save to Firestore
                await this.saveToFirestore({
                    url: cloudinaryUrl,
                    filename: file.name,
                    category: category,
                    description: description,
                    uploadedAt: new Date(),
                    fileSize: file.size,
                    fileType: file.type,
                    uploadedBy: this.currentUser?.displayName || 'Admin'
                });
            }

            this.showNotification('Images uploaded successfully!', 'success');
            this.closeAllModals();
            this.loadAdminGallery();
            this.loadDashboardStats();

        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Upload failed. Please try again.', 'error');
        }
    }

    // Upload to Cloudinary
    async uploadToCloudinary(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CONFIG.CLOUDINARY.UPLOAD_PRESET);
        formData.append('cloud_name', CONFIG.CLOUDINARY.CLOUD_NAME);

        const response = await fetch(CONFIG.CLOUDINARY.API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Cloudinary upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    }

    // Save to Firestore
    async saveToFirestore(imageData) {
        if (!this.db) {
            throw new Error('Firebase not initialized');
        }

        await this.db.collection('gallery').add(imageData);
    }

    // Load admin gallery
    async loadAdminGallery() {
        if (!this.db) {
            console.error('Firebase not initialized');
            return;
        }

        try {
            const snapshot = await this.db.collection('gallery')
                .orderBy('uploadedAt', 'desc')
                .get();

            const galleryGrid = document.getElementById('admin-gallery-grid');
            if (!galleryGrid) return;

            galleryGrid.innerHTML = '';

            if (snapshot.empty) {
                galleryGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">No images found</p>';
                return;
            }

            snapshot.forEach(doc => {
                const imageData = doc.data();
                const imageElement = this.createAdminImageElement(imageData, doc.id);
                galleryGrid.appendChild(imageElement);
            });

        } catch (error) {
            console.error('Error loading gallery:', error);
            this.showNotification('Failed to load gallery images', 'error');
        }
    }

    // Create admin image element
    createAdminImageElement(imageData, docId) {
        const item = document.createElement('div');
        item.className = 'admin-gallery-item';
        item.setAttribute('data-id', docId);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'select-checkbox';
        checkbox.addEventListener('change', (e) => this.handleImageSelection(docId, e.target.checked));

        const img = document.createElement('img');
        img.src = imageData.url;
        img.alt = imageData.description || imageData.filename;

        const info = document.createElement('div');
        info.className = 'item-info';

        const title = document.createElement('h4');
        title.textContent = imageData.category;

        const description = document.createElement('p');
        description.textContent = imageData.description || 'No description';

        info.appendChild(title);
        info.appendChild(description);

        item.appendChild(checkbox);
        item.appendChild(img);
        item.appendChild(info);

        return item;
    }

    // Handle image selection
    handleImageSelection(docId, isSelected) {
        const deleteBtn = document.getElementById('delete-selected-btn');
        
        if (isSelected) {
            this.selectedImages.add(docId);
        } else {
            this.selectedImages.delete(docId);
        }

        if (deleteBtn) {
            deleteBtn.disabled = this.selectedImages.size === 0;
        }

        // Update visual selection
        const item = document.querySelector(`[data-id="${docId}"]`);
        if (item) {
            if (isSelected) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        }
    }

    // Delete selected images
    async deleteSelectedImages() {
        if (this.selectedImages.size === 0) return;

        if (!confirm(`Are you sure you want to delete ${this.selectedImages.size} image(s)?`)) {
            return;
        }

        try {
            for (const docId of this.selectedImages) {
                await this.db.collection('gallery').doc(docId).delete();
                
                // Remove from DOM
                const item = document.querySelector(`[data-id="${docId}"]`);
                if (item) {
                    item.remove();
                }
            }

            this.selectedImages.clear();
            const deleteBtn = document.getElementById('delete-selected-btn');
            if (deleteBtn) {
                deleteBtn.disabled = true;
            }

            this.showNotification(`${this.selectedImages.size} image(s) deleted successfully`, 'success');
            this.loadDashboardStats();

        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Failed to delete images', 'error');
        }
    }

    // Handle add news
    async handleAddNews(event) {
        event.preventDefault();
        
        const title = document.getElementById('news-title').value;
        const excerpt = document.getElementById('news-excerpt').value;
        const content = document.getElementById('news-content').value;
        const imageFile = document.getElementById('news-image').files[0];

        try {
            let imageUrl = '';
            if (imageFile) {
                imageUrl = await this.uploadToCloudinary(imageFile);
            }

            // Save news to Firestore
            await this.db.collection('news').add({
                title: title,
                excerpt: excerpt,
                content: content,
                imageUrl: imageUrl,
                publishedAt: new Date(),
                publishedBy: this.currentUser?.displayName || this.currentUser?.email || 'Admin'
            });

            this.showNotification('News article published successfully!', 'success');
            this.closeAllModals();
            this.loadDashboardStats();

        } catch (error) {
            console.error('News publish error:', error);
            this.showNotification('Failed to publish news article', 'error');
        }
    }

    // Show analytics (placeholder)
    scrollToMessagesSection() {
        const messagesSection = document.getElementById('messages-management');
        if (messagesSection) {
            messagesSection.scrollIntoView({ behavior: 'smooth' });
            // Also load messages to ensure they're up to date
            this.loadMessages();
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async loadMessages() {
        if (!this.db) return;
        const messagesList = document.getElementById('messages-list');
        if (!messagesList) return;
        messagesList.innerHTML = '<div class="loading-news"><i class="fas fa-spinner fa-spin"></i> Loading messages...</div>';
        try {
            const snapshot = await this.db.collection('messages').orderBy('createdAt', 'desc').get();
            if (snapshot.empty) {
                messagesList.innerHTML = '<div class="no-news"><i class="fas fa-envelope-open-text"></i> No messages yet.</div>';
                return;
            }
            messagesList.innerHTML = '';
            snapshot.forEach(doc => {
                const msg = doc.data();
                const card = this.createMessageCard(msg, doc.id);
                messagesList.appendChild(card);
            });
        } catch (error) {
            messagesList.innerHTML = '<div class="error-news"><i class="fas fa-exclamation-triangle"></i> Failed to load messages.</div>';
        }
    }

    createMessageCard(msg, docId) {
        const card = document.createElement('div');
        card.className = 'message-card' + (msg.read ? '' : ' unread');
        // Header
        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = `<span class="message-sender">${msg.name}</span> <span class="message-email">${msg.email}</span>`;
        // Subject
        const subject = document.createElement('div');
        subject.className = 'message-subject';
        subject.textContent = msg.subject;
        // Snippet
        const snippet = document.createElement('div');
        snippet.className = 'message-snippet';
        snippet.textContent = msg.message.length > 120 ? msg.message.substring(0, 120) + '...' : msg.message;
        // Meta
        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.textContent = msg.createdAt && msg.createdAt.toDate ? msg.createdAt.toDate().toLocaleString() : '';
        // Actions
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        // Mark as read/unread
        const markBtn = document.createElement('button');
        markBtn.className = 'message-action-btn ' + (msg.read ? 'unread' : 'read');
        markBtn.innerHTML = msg.read ? '<i class="fas fa-envelope"></i> Mark Unread' : '<i class="fas fa-envelope-open"></i> Mark Read';
        markBtn.onclick = () => this.toggleReadMessage(docId, !msg.read);
        // Delete
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'message-action-btn delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.onclick = () => this.deleteMessage(docId, card);
        // Reply
        const replyBtn = document.createElement('button');
        replyBtn.className = 'message-action-btn reply';
        replyBtn.innerHTML = '<i class="fas fa-reply"></i> Reply';
        replyBtn.onclick = () => this.replyToMessage(msg.email, msg.subject);
        // Append actions
        actions.appendChild(markBtn);
        actions.appendChild(replyBtn);
        actions.appendChild(deleteBtn);
        // Assemble card
        card.appendChild(header);
        card.appendChild(subject);
        card.appendChild(snippet);
        card.appendChild(meta);
        card.appendChild(actions);
        return card;
    }

    async toggleReadMessage(docId, read) {
        if (!this.db) return;
        try {
            await this.db.collection('messages').doc(docId).update({ read });
            this.loadMessages();
        } catch (error) {
            this.showNotification('Failed to update message status', 'error');
        }
    }

    async deleteMessage(docId, card) {
        if (!this.db) return;
        if (!confirm('Delete this message? This cannot be undone.')) return;
        try {
            await this.db.collection('messages').doc(docId).delete();
            if (card) card.remove();
            this.showNotification('Message deleted', 'success');
        } catch (error) {
            this.showNotification('Failed to delete message', 'error');
        }
    }

    replyToMessage(email, subject) {
        const body = prompt('Type your reply below. This will open your email client.');
        if (body !== null) {
            const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Re: ' + subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailto;
        }
    }

    // --- NEWS MANAGEMENT ---
    async loadNewsArticles() {
        if (!this.db) return;
        const newsList = document.getElementById('news-list');
        if (!newsList) return;
        newsList.innerHTML = '<div class="loading-news"><i class="fas fa-spinner fa-spin"></i> Loading news...</div>';
        try {
            const snapshot = await this.db.collection('news').orderBy('publishedAt', 'desc').get();
            if (snapshot.empty) {
                newsList.innerHTML = '<div class="no-news"><i class="fas fa-newspaper"></i> No news articles yet.</div>';
                return;
            }
            newsList.innerHTML = '';
            snapshot.forEach(doc => {
                const news = doc.data();
                const card = this.createNewsArticleCard(news, doc.id);
                newsList.appendChild(card);
            });
        } catch (error) {
            newsList.innerHTML = '<div class="error-news"><i class="fas fa-exclamation-triangle"></i> Failed to load news articles.</div>';
        }
    }

    createNewsArticleCard(news, docId) {
        const card = document.createElement('div');
        card.className = 'news-article-card';
        // Title
        const title = document.createElement('div');
        title.className = 'news-article-title';
        title.textContent = news.title;
        // Excerpt
        const excerpt = document.createElement('div');
        excerpt.className = 'news-article-excerpt';
        excerpt.textContent = news.excerpt || (news.content ? news.content.substring(0, 120) + '...' : '');
        // Meta
        const meta = document.createElement('div');
        meta.className = 'news-article-meta';
        meta.textContent = news.publishedAt && news.publishedAt.toDate ? news.publishedAt.toDate().toLocaleString() : '';
        // Actions
        const actions = document.createElement('div');
        actions.className = 'news-article-actions';
        // Delete
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'news-article-delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.onclick = () => this.deleteNewsArticle(docId, card);
        actions.appendChild(deleteBtn);
        // Assemble card
        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(excerpt);
        card.appendChild(actions);
        return card;
    }

    async deleteNewsArticle(docId, card) {
        if (!this.db) return;
        if (!confirm('Delete this news article? This cannot be undone.')) return;
        try {
            await this.db.collection('news').doc(docId).delete();
            if (card) card.remove();
            this.showNotification('News article deleted', 'success');
        } catch (error) {
            this.showNotification('Failed to delete news article', 'error');
        }
    }

    // --- EVENTS MANAGEMENT METHODS ---
    
    scrollToEventsSection() {
        const eventsSection = document.getElementById('events-management');
        if (eventsSection) {
            eventsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            // Load events when scrolling to the section
            this.loadEvents();
        }
    }
    
    openAddEventModal() {
        const modal = document.getElementById('add-event-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Set default date to current date and time
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            document.getElementById('event-date').value = localDateTime;
        }
    }

    async handleAddEvent(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const eventData = {
            title: formData.get('title'),
            description: formData.get('description'),
            date: new Date(formData.get('date')),
            location: formData.get('location') || '',
            category: formData.get('category'),
            createdAt: new Date()
        };

        try {
            await this.db.collection('events').add(eventData);
            this.showNotification('Event added successfully', 'success');
            this.closeAllModals();
            this.resetForms();
            this.loadEvents(); // Refresh the events list
        } catch (error) {
            console.error('Error adding event:', error);
            this.showNotification('Failed to add event', 'error');
        }
    }

    async loadEvents() {
        const eventsList = document.getElementById('events-list');
        if (!eventsList) return;

        try {
            eventsList.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Loading events...</div>';
            
            const eventsSnapshot = await this.db.collection('events')
                .orderBy('date', 'desc')
                .get();

            if (eventsSnapshot.empty) {
                eventsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">No events found</div>';
                return;
            }

            eventsList.innerHTML = '';
            eventsSnapshot.forEach(doc => {
                const eventData = doc.data();
                const eventCard = this.createEventCard(eventData, doc.id);
                eventsList.appendChild(eventCard);
            });

        } catch (error) {
            console.error('Error loading events:', error);
            eventsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #dc3545;">Failed to load events</div>';
        }
    }

    createEventCard(event, docId) {
        const card = document.createElement('div');
        card.className = 'event-item';
        
        // Format date
        const eventDate = event.date.toDate();
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const formattedTime = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Get category icon
        const categoryIcon = this.getCategoryIcon(event.category);

        card.innerHTML = `
            <h3>
                <i class="${categoryIcon}"></i>
                ${event.title}
            </h3>
            <p>${event.description}</p>
            <div class="event-meta">
                <span>Created: ${event.createdAt.toDate().toLocaleDateString()}</span>
                ${event.updatedAt ? `<span>Updated: ${event.updatedAt.toDate().toLocaleDateString()}</span>` : ''}
                <span class="event-category">${event.category}</span>
            </div>
            <div class="event-details">
                <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                <span><i class="fas fa-clock"></i> ${formattedTime}</span>
                ${event.location ? `<span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>` : ''}
            </div>
            <div class="event-actions">
                <button class="edit-btn" onclick="adminDashboard.editEvent('${docId}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="adminDashboard.deleteEvent('${docId}', this.closest('.event-item'))">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        return card;
    }

    getCategoryIcon(category) {
        const iconMap = {
            'Academic': 'fas fa-graduation-cap',
            'Sports': 'fas fa-futbol',
            'Cultural': 'fas fa-music',
            'Meeting': 'fas fa-users',
            'Examination': 'fas fa-file-alt',
            'Holiday': 'fas fa-calendar-day',
            'Other': 'fas fa-calendar-alt'
        };
        
        return iconMap[category] || 'fas fa-calendar-alt';
    }

    async editEvent(docId) {
        try {
            // Fetch event data from Firestore
            const eventDoc = await this.db.collection('events').doc(docId).get();
            
            if (!eventDoc.exists) {
                this.showNotification('Event not found', 'error');
                return;
            }

            const eventData = eventDoc.data();
            
            // Open edit modal
            const modal = document.getElementById('edit-event-modal');
            if (modal) {
                modal.style.display = 'flex';
                
                // Set the event ID in hidden field
                document.getElementById('edit-event-id').value = docId;
                
                // Pre-populate form fields
                document.getElementById('edit-event-title').value = eventData.title;
                document.getElementById('edit-event-description').value = eventData.description;
                
                // Format date for datetime-local input
                const eventDate = eventData.date.toDate();
                const localDateTime = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                document.getElementById('edit-event-date').value = localDateTime;
                
                document.getElementById('edit-event-location').value = eventData.location || '';
                document.getElementById('edit-event-category').value = eventData.category;
            }
        } catch (error) {
            console.error('Error loading event for edit:', error);
            this.showNotification('Failed to load event for editing', 'error');
        }
    }

    async handleEditEvent(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const eventId = formData.get('eventId');
        
        const eventData = {
            title: formData.get('title'),
            description: formData.get('description'),
            date: new Date(formData.get('date')),
            location: formData.get('location') || '',
            category: formData.get('category'),
            updatedAt: new Date()
        };

        try {
            await this.db.collection('events').doc(eventId).update(eventData);
            this.showNotification('Event updated successfully', 'success');
            this.closeAllModals();
            this.resetForms();
            this.loadEvents(); // Refresh the events list
        } catch (error) {
            console.error('Error updating event:', error);
            this.showNotification('Failed to update event', 'error');
        }
    }

    async deleteEvent(docId, card) {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                await this.db.collection('events').doc(docId).delete();
                card.remove();
                this.showNotification('Event deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting event:', error);
                this.showNotification('Failed to delete event', 'error');
            }
        }
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the admin page
    if (window.location.pathname.includes('admin')) {
        window.adminDashboard = new AdminDashboard();
    }
}); 