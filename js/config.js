// Configuration for external services
const CONFIG = {
    // Cloudinary Configuration
    CLOUDINARY: {
        CLOUD_NAME: 'dl8db2rpk',
        UPLOAD_PRESET: 'ezra-gallery',
        API_URL: 'https://api.cloudinary.com/v1_1/dl8db2rpk/image/upload'
    },
    
    // Gallery Configuration
    GALLERY: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        MAX_FILES_PER_UPLOAD: 5
    }
};

// Centralized Firebase initialization
let firebaseInitialized = false;
let firestoreDB = null;

function initializeFirebase() {
    console.log('Firebase init: Starting initialization...');
    
    if (firebaseInitialized) {
        console.log('Firebase init: Already initialized, returning existing instance');
        return firestoreDB;
    }
    
    if (typeof firebase === 'undefined') {
        console.error('Firebase init: Firebase SDK not loaded');
        return null;
    }
    
    // Get Firebase config from external file
    const firebaseConfig = window.FIREBASE_CONFIG;
    if (!firebaseConfig) {
        console.error('Firebase init: Firebase configuration not found. Make sure firebase-config.js is loaded.');
        return null;
    }
    
    try {
        console.log('Firebase init: Firebase SDK available, checking apps...');
        console.log('Firebase init: Current apps:', firebase.apps.length);
        
        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            console.log('Firebase init: No apps found, initializing new app...');
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase init: App initialized successfully');
        } else {
            console.log('Firebase init: App already exists, using existing app');
        }
        
        console.log('Firebase init: Getting Firestore instance...');
        firestoreDB = firebase.firestore();
        firebaseInitialized = true;
        console.log('Firebase init: Firebase initialized successfully');
        return firestoreDB;
    } catch (error) {
        console.error('Firebase init: Error initializing Firebase:', error);
        return null;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 