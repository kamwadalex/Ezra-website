# Gallery Upload Setup Guide

This guide will help you set up the client-side image upload functionality for the Ezra Memorial Secondary School website gallery.

## Prerequisites

- Netlify account (for hosting)
- Cloudinary account (for image storage)
- Firebase account (for database)

## Setup Instructions

### 1. Cloudinary Setup

1. **Create a Cloudinary account** at [cloudinary.com](https://cloudinary.com)
2. **Get your Cloud Name** from your dashboard
3. **Create an Upload Preset**:
   - Go to Settings > Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set preset name to `ezra-gallery`
   - Set "Signing Mode" to "Unsigned"
   - Save the preset

### 2. Firebase Setup

1. **Create a Firebase project** at [firebase.google.com](https://firebase.google.com)
2. **Enable Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location close to your users
3. **Get Firebase configuration**:
   - Go to Project Settings
   - Scroll to "Your apps"
   - Click the web icon (</>)
   - Register your app
   - Copy the configuration object

### 3. Update Configuration

1. **Edit `js/config.js`**:
   ```javascript
   const CONFIG = {
       CLOUDINARY: {
           CLOUD_NAME: 'your-actual-cloud-name', // Replace with your Cloudinary cloud name
           UPLOAD_PRESET: 'ezra-gallery', // Your upload preset name
           API_URL: 'https://api.cloudinary.com/v1_1/your-actual-cloud-name/image/upload'
       },
       
       FIREBASE: {
           apiKey: "your-actual-api-key",
           authDomain: "your-actual-project.firebaseapp.com",
           projectId: "your-actual-project-id",
           storageBucket: "your-actual-project.appspot.com",
           messagingSenderId: "your-actual-sender-id",
           appId: "your-actual-app-id"
       },
       
       GALLERY: {
           MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
           ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
           MAX_FILES_PER_UPLOAD: 5
       }
   };
   ```

### 4. Security Rules (Firebase)

Set up Firestore security rules in your Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gallery/{document} {
      allow read: if true;  // Anyone can read gallery images
      allow write: if true; // Anyone can upload (for demo - consider adding authentication)
    }
  }
}
```

### 5. Netlify Deployment

1. **Connect your repository** to Netlify
2. **Set build settings**:
   - Build command: (leave empty for static site)
   - Publish directory: `/` (root directory)
3. **Deploy your site**

## Features

### Upload Functionality
- **Multiple file selection** (up to 5 images)
- **File validation** (type and size)
- **Image preview** before upload
- **Progress tracking** during upload
- **Category selection** for organization
- **Optional descriptions** for images

### Gallery Display
- **Dynamic loading** from Firestore
- **Responsive grid layout**
- **Image modal** for full-size viewing
- **Delete functionality** (hover to reveal)
- **Category-based organization**

### User Experience
- **Modern UI** with smooth animations
- **Mobile responsive** design
- **Real-time notifications**
- **Error handling** and validation
- **Loading states** and progress indicators

## File Structure

```
school-website/
├── js/
│   ├── config.js          # Configuration settings
│   ├── gallery-upload.js  # Upload functionality
│   └── main.js           # General site functionality
├── css/
│   └── style.css         # Styles including upload UI
├── pages/
│   └── gallery/
│       └── index.html    # Gallery page with upload form
└── GALLERY_SETUP.md      # This setup guide
```

## Usage

1. **Upload Images**:
   - Click "Upload Images" button
   - Select up to 5 images
   - Choose a category
   - Add optional description
   - Click "Upload Images"

2. **View Gallery**:
   - Images load automatically from database
   - Click any image to view full-size
   - Hover over images to see delete button

3. **Delete Images**:
   - Hover over an image
   - Click the trash icon
   - Confirm deletion

## Troubleshooting

### Common Issues

1. **Images not uploading**:
   - Check Cloudinary configuration
   - Verify upload preset is set to "unsigned"
   - Check browser console for errors

2. **Gallery not loading**:
   - Verify Firebase configuration
   - Check Firestore security rules
   - Ensure Firebase SDK is loaded

3. **Upload modal not opening**:
   - Check if all script files are loaded
   - Verify element IDs match in HTML and JS

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Considerations

For production use, consider:

1. **Authentication**: Add user login before allowing uploads
2. **File validation**: Server-side validation in addition to client-side
3. **Rate limiting**: Prevent abuse with upload limits
4. **Content moderation**: Review uploaded images before public display
5. **Backup strategy**: Regular backups of your Firestore database

## Support

For technical support, contact the development team at apexdeveloper3@gmail.com

---

**Note**: This implementation uses client-side uploads for simplicity. For production environments with high security requirements, consider implementing server-side upload handling with proper authentication and validation. 