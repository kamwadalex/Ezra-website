// Gallery Settings Handler
class GallerySettingsHandler {
    constructor() {
        this.db = null;
        this.uploadEnabled = true; // Default to enabled
        this.initializeFirebase();
        this.checkUploadSetting();
    }

    // Initialize Firebase
    initializeFirebase() {
        // Use the centralized Firebase initialization
        this.db = initializeFirebase();
        if (!this.db) {
            console.error('Failed to initialize Firebase for gallery settings');
        }
    }

    // Check upload setting from Firestore
    async checkUploadSetting() {
        if (!this.db) return;

        try {
            const settingsDoc = await this.db.collection('settings').doc('gallery').get();
            
            if (settingsDoc.exists) {
                const settings = settingsDoc.data();
                this.uploadEnabled = settings.uploadEnabled !== false; // Default to true if not set
            } else {
                // Default to enabled if no settings exist
                this.uploadEnabled = true;
            }

            this.updateUploadSectionVisibility();
        } catch (error) {
            console.error('Error checking gallery upload setting:', error);
            // Default to enabled on error
            this.uploadEnabled = true;
            this.updateUploadSectionVisibility();
        }
    }

    // Update upload section visibility based on setting
    updateUploadSectionVisibility() {
        const uploadSection = document.querySelector('.upload-section');
        const uploadBtn = document.getElementById('upload-btn');
        const uploadModal = document.getElementById('upload-modal');

        if (this.uploadEnabled) {
            // Show upload functionality
            if (uploadSection) {
                uploadSection.classList.remove('hidden');
            }
            if (uploadBtn) {
                uploadBtn.style.display = 'inline-flex';
            }
        } else {
            // Hide upload functionality
            if (uploadSection) {
                uploadSection.classList.add('hidden');
            }
            if (uploadBtn) {
                uploadBtn.style.display = 'none';
            }
            // Close upload modal if it's open
            if (uploadModal && uploadModal.style.display === 'flex') {
                uploadModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    }

    // Public method to check if upload is enabled
    isUploadEnabled() {
        return this.uploadEnabled;
    }
}

// Initialize gallery settings handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the gallery page
    if (window.location.pathname.includes('gallery')) {
        window.gallerySettings = new GallerySettingsHandler();
    }
}); 