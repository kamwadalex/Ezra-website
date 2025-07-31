// Gallery Upload Functionality
class GalleryUploader {
    constructor() {
        this.uploadQueue = [];
        this.isUploading = false;
        this.imagesPerPage = 9; // Limit to 9 images initially
        this.lastVisible = null; // For pagination
        this.hasMoreImages = true; // Track if more images exist
        this.totalImagesLoaded = 0; // Track total images loaded
        this.initializeFirebase();
        this.bindEvents();
    }

    // Initialize Firebase
    initializeFirebase() {
        // Firebase will be loaded from CDN
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(CONFIG.FIREBASE);
            this.db = firebase.firestore();
        } else {
            console.error('Firebase not loaded');
        }
    }

    // Bind event listeners
    bindEvents() {
        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('file-input');
        const uploadModal = document.getElementById('upload-modal');
        const closeModal = document.getElementById('close-modal');
        const uploadForm = document.getElementById('upload-form');

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.openUploadModal());
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeUploadModal());
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        }

        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        }

        // Close modal when clicking outside
        if (uploadModal) {
            uploadModal.addEventListener('click', (e) => {
                if (e.target === uploadModal) {
                    this.closeUploadModal();
                }
            });
        }

        // Image modal functionality
        const imageModal = document.getElementById('image-modal');
        const closeImageModal = document.getElementById('close-image-modal');
        const toggleInfoBtn = document.getElementById('toggle-info-btn');

        if (closeImageModal) {
            closeImageModal.addEventListener('click', () => this.closeImageModal());
        }

        if (toggleInfoBtn) {
            toggleInfoBtn.addEventListener('click', () => this.toggleImageInfo());
        }

        if (imageModal) {
            imageModal.addEventListener('click', (e) => {
                if (e.target === imageModal) {
                    this.closeImageModal();
                }
            });
        }

        // Add tap functionality to modal image for mobile
        const modalImg = document.getElementById('modal-image');
        if (modalImg) {
            modalImg.addEventListener('click', (e) => {
                // Only handle tap on mobile devices
                if (window.innerWidth <= 768) {
                    e.stopPropagation(); // Prevent modal close
                    this.toggleImageInfo();
                }
            });
        }

        // Handle orientation changes on mobile
        window.addEventListener('resize', () => {
            const toggleBtn = document.getElementById('toggle-info-btn');
            if (toggleBtn) {
                if (window.innerWidth <= 768) {
                    toggleBtn.style.display = 'none';
                } else {
                    // Show button on desktop if there's info to show
                    const modalInfo = document.querySelector('.image-modal-info');
                    if (modalInfo && modalInfo.style.display !== 'none') {
                        toggleBtn.style.display = 'block';
                    }
                }
            }
        });
    }

    // Open upload modal
    openUploadModal() {
        const modal = document.getElementById('upload-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Close upload modal
    closeUploadModal() {
        const modal = document.getElementById('upload-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.resetForm();
        }
    }

    // Handle file selection
    handleFileSelection(event) {
        const files = Array.from(event.target.files);
        const previewContainer = document.getElementById('file-preview');
        const uploadBtn = document.getElementById('submit-upload');
        
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }

        // Validate files
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            this.showNotification('Please select valid image files (JPEG, PNG, GIF, WebP) under 5MB', 'error');
            return;
        }

        // Create previews
        validFiles.forEach(file => {
            const preview = this.createFilePreview(file);
            if (previewContainer) {
                previewContainer.appendChild(preview);
            }
        });

        if (uploadBtn) {
            uploadBtn.disabled = false;
        }
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

    // Handle upload form submission
    async handleUpload(event) {
        event.preventDefault();
        
        const fileInput = document.getElementById('file-input');
        const files = Array.from(fileInput.files);
        const categorySelect = document.getElementById('image-category');
        const descriptionInput = document.getElementById('image-description');
        
        if (files.length === 0) {
            this.showNotification('Please select at least one image', 'error');
            return;
        }

        const category = categorySelect ? categorySelect.value : 'General';
        const description = descriptionInput ? descriptionInput.value : '';

        this.startUpload(files, category, description);
    }

    // Start upload process
    async startUpload(files, category, description) {
        const uploadBtn = document.getElementById('submit-upload');
        const progressBar = document.getElementById('upload-progress');
        const progressText = document.getElementById('progress-text');
        
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Uploading...';
        }

        if (progressBar) {
            progressBar.style.display = 'block';
        }

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                if (progressText) {
                    progressText.textContent = `Uploading ${i + 1} of ${files.length}: ${file.name}`;
                }

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
                    fileType: file.type
                });

                // Update progress
                const progress = ((i + 1) / files.length) * 100;
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                }
            }

            this.showNotification('Images uploaded successfully!', 'success');
            this.closeUploadModal();
            this.loadGalleryImages(); // Refresh gallery

        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Upload failed. Please try again.', 'error');
        } finally {
            if (uploadBtn) {
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload Images';
            }
            if (progressBar) {
                progressBar.style.display = 'none';
            }
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

    // Load gallery images from Firestore
    async loadGalleryImages(loadMore = false) {
        if (!this.db) {
            console.error('Firebase not initialized');
            return;
        }

        try {
            const galleryGrid = document.querySelector('.gallery-grid');
            if (!galleryGrid) return;

            // Clear existing content only on initial load
            if (!loadMore) {
                galleryGrid.innerHTML = '';
                this.lastVisible = null;
                this.hasMoreImages = true;
                this.totalImagesLoaded = 0;
            }

            // Build query
            let query = this.db.collection('gallery').orderBy('uploadedAt', 'desc').limit(this.imagesPerPage);
            
            // Add pagination if loading more
            if (loadMore && this.lastVisible) {
                query = query.startAfter(this.lastVisible);
            }

            const snapshot = await query.get();

            if (snapshot.empty && !loadMore) {
                // Show placeholder if no images on initial load
                this.showPlaceholderItems(galleryGrid);
                return;
            }

            // Update pagination state
            this.hasMoreImages = snapshot.docs.length === this.imagesPerPage;
            if (snapshot.docs.length > 0) {
                this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
            }

            // Add images to grid
            snapshot.forEach(doc => {
                const imageData = doc.data();
                const imageElement = this.createImageElement(imageData, doc.id);
                galleryGrid.appendChild(imageElement);
                this.totalImagesLoaded++;
            });

            // Update image counter
            this.updateImageCounter();

            // Add or update load more button
            this.updateLoadMoreButton(galleryGrid);

        } catch (error) {
            console.error('Error loading gallery:', error);
            this.showNotification('Failed to load gallery images', 'error');
        }
    }

    // Create image element
    createImageElement(imageData, docId) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-id', docId);

        const img = document.createElement('img');
        img.src = imageData.url;
        img.alt = imageData.description || imageData.filename;
        img.loading = 'lazy';

        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';

        const title = document.createElement('h3');
        title.textContent = imageData.category;

        const description = document.createElement('p');
        description.textContent = imageData.description || '';

        overlay.appendChild(title);
        overlay.appendChild(description);

        item.appendChild(img);
        item.appendChild(overlay);

        // Add click to view larger
        item.addEventListener('click', () => this.showImageModal(imageData));

        return item;
    }

    // Show placeholder items
    showPlaceholderItems(container) {
        const categories = ['School Events', 'Academic Activities', 'Sports & Athletics', 'Campus Life', 'Student Achievements', 'Cultural Events'];
        
        categories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            const placeholder = document.createElement('div');
            placeholder.className = 'gallery-placeholder';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-image';
            
            const text = document.createElement('p');
            text.textContent = category;
            
            placeholder.appendChild(icon);
            placeholder.appendChild(text);
            item.appendChild(placeholder);
            container.appendChild(item);
        });
    }

    // Update image counter
    updateImageCounter() {
        const counterElement = document.getElementById('images-count');
        if (counterElement) {
            counterElement.textContent = this.totalImagesLoaded;
        }
    }

    // Update load more button
    updateLoadMoreButton(container) {
        // Remove existing load more button
        const existingButton = container.querySelector('.load-more-btn');
        if (existingButton) {
            existingButton.remove();
        }

        // Add load more button if there are more images
        if (this.hasMoreImages) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Images';
            loadMoreBtn.addEventListener('click', async () => {
                loadMoreBtn.disabled = true;
                loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                await this.loadGalleryImages(true);
                loadMoreBtn.disabled = false;
                loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Images';
            });
            container.appendChild(loadMoreBtn);
        }
    }

    // Delete image
    async deleteImage(docId, element) {
        if (!confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            await this.db.collection('gallery').doc(docId).delete();
            element.remove();
            this.showNotification('Image deleted successfully', 'success');
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Failed to delete image', 'error');
        }
    }

    // Show image modal
    showImageModal(imageData) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-description');
        const modalInfo = document.querySelector('.image-modal-info');
        const toggleBtn = document.getElementById('toggle-info-btn');

        if (modal && modalImg) {
            modalImg.src = imageData.url;
            modalImg.alt = imageData.description || imageData.filename;
            
            if (modalTitle) {
                modalTitle.textContent = imageData.category;
            }
            
            if (modalDesc) {
                modalDesc.textContent = imageData.description || '';
            }

            // Handle info overlay visibility
            if (modalInfo && toggleBtn) {
                const hasDescription = imageData.description && imageData.description.trim() !== '';
                const isGenericCategory = imageData.category === 'General' || imageData.category === '';
                
                if (!hasDescription && isGenericCategory) {
                    modalInfo.style.display = 'none';
                    toggleBtn.style.display = 'none'; // Hide toggle button if no info to show
                    // Add tappable class for mobile hint
                    if (window.innerWidth <= 768) {
                        modalImg.classList.add('tappable');
                        // Remove hint after 3 seconds
                        setTimeout(() => {
                            modalImg.classList.remove('tappable');
                        }, 3000);
                    }
                } else {
                    modalInfo.style.display = 'block';
                    toggleBtn.style.display = 'block';
                    toggleBtn.classList.remove('hidden');
                    modalImg.classList.remove('tappable');
                }
            }

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Close image modal
    closeImageModal() {
        const modal = document.getElementById('image-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Toggle image info overlay
    toggleImageInfo() {
        const modalInfo = document.querySelector('.image-modal-info');
        const toggleBtn = document.getElementById('toggle-info-btn');
        const modalImg = document.getElementById('modal-image');
        
        if (modalInfo && toggleBtn) {
            const isVisible = modalInfo.style.display !== 'none';
            modalInfo.style.display = isVisible ? 'none' : 'block';
            toggleBtn.classList.toggle('hidden', !isVisible);
            
            // Handle mobile tappable hint
            if (window.innerWidth <= 768 && modalImg) {
                if (isVisible) {
                    // Overlay is being hidden, show hint
                    modalImg.classList.add('tappable');
                    setTimeout(() => {
                        modalImg.classList.remove('tappable');
                    }, 2000);
                } else {
                    // Overlay is being shown, remove hint
                    modalImg.classList.remove('tappable');
                }
            }
        }
    }

    // Reset form
    resetForm() {
        const fileInput = document.getElementById('file-input');
        const previewContainer = document.getElementById('file-preview');
        const uploadBtn = document.getElementById('submit-upload');
        const progressBar = document.getElementById('upload-progress');
        const form = document.getElementById('upload-form');

        if (fileInput) fileInput.value = '';
        if (previewContainer) previewContainer.innerHTML = '';
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Upload Images';
        }
        if (progressBar) {
            progressBar.style.display = 'none';
            progressBar.style.width = '0%';
        }
        if (form) form.reset();
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize gallery uploader when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the gallery page
    if (window.location.pathname.includes('gallery')) {
        const uploader = new GalleryUploader();
        // Load existing gallery images
        setTimeout(() => {
            uploader.loadGalleryImages();
        }, 1000); // Small delay to ensure Firebase is initialized
    }
}); 