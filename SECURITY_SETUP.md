# Security Setup for Ezra Memorial Secondary School Website

## Firebase API Keys Security

This project uses Firebase for backend services. The Firebase configuration is now embedded in the main config file for deployment compatibility while maintaining security through Firebase Security Rules.

### 1. Current Setup

The Firebase configuration is embedded in `js/config.js` with fallback configuration for deployment. For local development, you can still use an external `js/firebase-config.js` file for additional security.

### 2. Files Structure

```
js/
├── config.js                    # Main configuration with embedded Firebase config
├── firebase-config.js          # Optional external config for local development
├── firebase-config.example.js  # Example template (safe to commit)
└── ...

.gitignore                      # Excludes firebase-config.js from tracking
```

### 3. Configuration Approach

**For Deployment (Current Setup):**
- Firebase configuration is embedded in `js/config.js`
- Works immediately on GitHub Pages and other static hosting
- API keys are protected by Firebase Security Rules

**For Local Development (Optional Enhanced Security):**
1. Copy the example file: `cp js/firebase-config.example.js js/firebase-config.js`
2. Edit `js/firebase-config.js` with your actual Firebase configuration
3. The external config will override the embedded config when available

### 4. Security Best Practices

1. **Firebase Security Rules** - Primary protection for your data
2. **API Key Restrictions** - Configure Firebase Console to restrict API key usage
3. **Regular monitoring** - Check Firebase usage for unusual activity
4. **HTTPS in production** - Always use HTTPS for data in transit

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

### 6. API Key Security

**In Firebase Console:**
1. Go to Project Settings > General
2. Under "Your apps", find your web app
3. Click "Show" next to the API key
4. Configure restrictions:
   - HTTP referrers (websites)
   - API restrictions (Firebase services only)

### 7. Deployment Considerations

**Static Hosting (GitHub Pages, Netlify, etc.):**
- Configuration is embedded and works immediately
- No additional setup required
- Firebase Security Rules provide protection

**Server-side Applications:**
- Consider using environment variables
- Inject configuration securely
- Use server-side authentication

### 8. Troubleshooting

If you see Firebase initialization errors:
1. Check browser console for detailed error messages
2. Verify Firebase SDK is loading correctly
3. Ensure Firebase Security Rules allow the operations
4. Check network connectivity to Firebase services

### 9. Emergency Response

If API keys are compromised:
1. **Immediately rotate the keys** in Firebase Console
2. **Update the configuration** in `js/config.js`
3. **Check for unauthorized usage** in Firebase Console
4. **Review access logs** for suspicious activity
5. **Update Security Rules** if necessary

---

**Note**: This setup prioritizes deployment compatibility while maintaining security through Firebase Security Rules. The API keys are visible in the client-side code but are protected by server-side security rules that control access to your data. 