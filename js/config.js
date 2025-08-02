// Configuration for external services
const CONFIG = {
    // Cloudinary Configuration
    CLOUDINARY: {
        CLOUD_NAME: 'dl8db2rpk',
        UPLOAD_PRESET: 'ezra-gallery',
        API_URL: 'https://api.cloudinary.com/v1_1/dl8db2rpk/image/upload'
    },
    
    // Firebase Configuration
      FIREBASE: {
        apiKey: "AIzaSyAoZq8e2v8Y5tnHon6R1Rr8Im8x92sLRek",
        authDomain: "ezra-project-33417.firebaseapp.com",
        projectId: "ezra-project-33417",
        storageBucket: "ezra-project-33417.firebasestorage.app",
        messagingSenderId: "546827792030",
        appId: "1:546827792030:web:d05d360536c7234ef0958f",
        measurementId: "G-7J9KZMGKM2"
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
    if (firebaseInitialized) {
        return firestoreDB;
    }
    
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return null;
    }
    
    try {
        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(CONFIG.FIREBASE);
        }
        
        firestoreDB = firebase.firestore();
        firebaseInitialized = true;
        console.log('Firebase initialized successfully');
        return firestoreDB;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return null;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 