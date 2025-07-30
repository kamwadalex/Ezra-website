// Contact Form Submission to Firestore
class ContactFormHandler {
    constructor() {
        this.db = null;
        this.initializeFirebase();
        this.bindEvents();
    }

    // Initialize Firebase
    initializeFirebase() {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(CONFIG.FIREBASE);
            this.db = firebase.firestore();
        } else {
            this.showNotification('Failed to connect to server. Please try again later.', true);
        }
    }

    // Bind form submit event
    bindEvents() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    // Handle form submission
    async handleSubmit(event) {
        event.preventDefault();
        let name = document.getElementById('contact-name').value.trim();
        let email = document.getElementById('contact-email').value.trim();
        let subject = document.getElementById('contact-subject').value.trim();
        let message = document.getElementById('contact-message').value.trim();
        const notification = document.getElementById('contact-form-notification');

        // Sanitize: strip HTML tags and limit length
        name = this.sanitizeInput(name, 50);
        email = this.sanitizeInput(email, 100);
        subject = this.sanitizeInput(subject, 100);
        message = this.sanitizeInput(message, 1000);

        // Strict validation for all fields
        if (!name || !email || !subject || !message) {
            this.showNotification('All fields are required. Please fill in every field.', true);
            return;
        }
        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address.', true);
            return;
        }
        if (name.length > 50 || email.length > 100 || subject.length > 100 || message.length > 1000) {
            this.showNotification('One or more fields exceed the allowed length.', true);
            return;
        }

        // Save to Firestore
        try {
            await this.db.collection('messages').add({
                name,
                email,
                subject,
                message,
                read: false,
                createdAt: new Date()
            });
            this.showNotification('Message sent successfully! We will get back to you soon.', false);
            event.target.reset();
        } catch (error) {
            console.error('Contact form error:', error);
            this.showNotification('Failed to send message. Please try again later.', true);
        }
    }

    // Show notification
    showNotification(msg, isError) {
        const notification = document.getElementById('contact-form-notification');
        if (notification) {
            notification.textContent = msg;
            notification.className = 'contact-form-notification' + (isError ? ' error' : '');
        }
    }

    // Email validation
    validateEmail(email) {
        // Simple regex for email validation
        return /^\S+@\S+\.\S+$/.test(email);
    }

    // Sanitize input: remove HTML tags and limit length
    sanitizeInput(str, maxLength) {
        if (!str) return '';
        // Remove HTML tags
        str = str.replace(/<[^>]*>?/gm, '');
        // Limit length
        if (str.length > maxLength) {
            str = str.substring(0, maxLength);
        }
        return str;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('contact-form')) {
        new ContactFormHandler();
    }
}); 