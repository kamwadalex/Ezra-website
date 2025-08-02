# Security Setup for Ezra Memorial Secondary School Website

## Firebase API Keys Security

This project uses Firebase for backend services. To protect your API keys from being exposed in version control, follow these steps:

### 1. Current Setup

The sensitive Firebase configuration has been moved to a separate file `js/firebase-config.js` which is excluded from Git tracking via `.gitignore`.

### 2. Files Structure

```
js/
├── config.js              # Main configuration (no sensitive data)
├── firebase-config.js     # Firebase API keys (excluded from Git)
└── ...

.gitignore                 # Excludes firebase-config.js from tracking
```

### 3. Setting Up Firebase Configuration

**For Development:**
1. Create the file `js/firebase-config.js` with your Firebase configuration:

```javascript
// Firebase Configuration - This file contains sensitive API keys
// DO NOT commit this file to version control
// This file is excluded in .gitignore

const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Export for use in config.js
if (typeof window !== 'undefined') {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
}
```

2. Replace the placeholder values with your actual Firebase configuration from the Firebase Console.

**For Production:**
- Consider using environment variables or a secure configuration management system
- Ensure the `firebase-config.js` file is not accessible via direct URL
- Use Firebase Security Rules to restrict access to your database

### 4. Security Best Practices

1. **Never commit API keys to version control**
2. **Use Firebase Security Rules** to restrict database access
3. **Regularly rotate API keys** if compromised
4. **Monitor Firebase usage** for unusual activity
5. **Use HTTPS** in production to encrypt data in transit

### 5. Firebase Security Rules

Ensure your `firestore.rules` file has appropriate security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to news and events
    match /news/{document} {
      allow read: if true;
      allow write: if false; // Only allow admin writes
    }
    
    match /events/{document} {
      allow read: if true;
      allow write: if false; // Only allow admin writes
    }
    
    // Gallery images
    match /gallery/{document} {
      allow read: if true;
      allow write: if false; // Only allow admin writes
    }
    
    // Contact messages
    match /messages/{document} {
      allow read, write: if false; // Only allow admin access
    }
  }
}
```

### 6. Deployment Considerations

When deploying to a hosting service:

1. **Local Development**: Use the `firebase-config.js` file locally
2. **Production**: Consider using environment variables or secure configuration injection
3. **CDN/Static Hosting**: Ensure the config file is not publicly accessible
4. **Server-side**: If using server-side rendering, inject configuration securely

### 7. Troubleshooting

If you see "Firebase configuration not found" errors:
1. Ensure `js/firebase-config.js` exists
2. Check that the file is being loaded before `js/config.js`
3. Verify the `FIREBASE_CONFIG` object is properly defined
4. Check browser console for any JavaScript errors

### 8. Emergency Response

If API keys are accidentally exposed:
1. **Immediately rotate the keys** in Firebase Console
2. **Update the configuration** in `firebase-config.js`
3. **Check for unauthorized usage** in Firebase Console
4. **Review access logs** for suspicious activity

---

**Note**: This setup provides basic security for a static website. For more sensitive applications, consider implementing additional security measures such as server-side authentication and API key rotation. 