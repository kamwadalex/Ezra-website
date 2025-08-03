// Contact Information Management
class ContactInfoManager {
    constructor() {
        this.db = null;
        this.initializeFirebase();
        this.loadContactInformation();
    }

    // Initialize Firebase
    initializeFirebase() {
        // Use the centralized Firebase initialization
        this.db = initializeFirebase();
        if (!this.db) {
            console.error('Failed to initialize Firebase for contact info');
        }
    }

    // Load contact information from Firestore
    async loadContactInformation() {
        if (!this.db) return;

        try {
            const contactDoc = await this.db.collection('settings').doc('contact').get();
            
            if (contactDoc.exists) {
                const contactData = contactDoc.data();
                this.updateContactDisplay(contactData);
            } else {
                // Use default values if no contact info exists
                this.updateContactDisplay({
                    phone1: '+256 758 991782',
                    phone2: '+256 772 692685',
                    email: '',
                    address: 'Ezra Memorial SS\nTirinyi, Kibuku District\nP.O. Box 1948, Mbale.',
                    mapLink: 'https://maps.app.goo.gl/5UtyyCNAeNcFmEZB9'
                });
            }
        } catch (error) {
            console.error('Error loading contact information:', error);
            // Use default values on error
            this.updateContactDisplay({
                phone1: '+256 758 991782',
                phone2: '+256 772 692685',
                email: '',
                address: 'Ezra Memorial SS\nTirinyi, Kibuku District\nP.O. Box 1948, Mbale.',
                mapLink: 'https://maps.app.goo.gl/5UtyyCNAeNcFmEZB9'
            });
        }
    }

    // Update the contact information display
    updateContactDisplay(contactData) {
        // Update phone numbers
        const phoneContainer = document.querySelector('.info-item:has(i.fas.fa-phone-alt) div');
        if (phoneContainer) {
            let phoneHtml = '<strong>Phone:</strong><br>';
            
            if (contactData.phone1) {
                phoneHtml += `<a href="tel:${contactData.phone1.replace(/\s+/g, '')}">${contactData.phone1}</a><br>`;
            }
            
            if (contactData.phone2) {
                phoneHtml += `<a href="tel:${contactData.phone2.replace(/\s+/g, '')}">${contactData.phone2}</a>`;
            }
            
            phoneContainer.innerHTML = phoneHtml;
        }

        // Update address
        const addressContainer = document.querySelector('.info-item:has(i.fas.fa-map-marker-alt) div');
        if (addressContainer) {
            let addressHtml = '<strong>Address:</strong><br>';
            addressHtml += contactData.address.replace(/\n/g, '<br>');
            
            if (contactData.mapLink) {
                addressHtml += `<br><a href="${contactData.mapLink}" target="_blank" rel="noopener">View on Google Maps</a>`;
            }
            
            addressContainer.innerHTML = addressHtml;
        }

        // Add email section if email exists
        if (contactData.email) {
            this.addEmailSection(contactData.email);
        }
    }

    // Add email section to the contact info
    addEmailSection(email) {
        const contactInfoBox = document.querySelector('.contact-info-box');
        if (!contactInfoBox) return;

        // Check if email section already exists
        const existingEmailSection = contactInfoBox.querySelector('#email-section');
        if (existingEmailSection) {
            // Update existing email section
            const emailDiv = existingEmailSection.querySelector('div');
            if (emailDiv) {
                emailDiv.innerHTML = `<strong>Email:</strong><br><a href="mailto:${email}">${email}</a>`;
            }
            // Show the email section
            existingEmailSection.style.display = 'block';
        } else {
            // Create new email section
            const emailSection = document.createElement('div');
            emailSection.className = 'info-item';
            emailSection.id = 'email-section';
            emailSection.innerHTML = `
                <i class="fas fa-envelope"></i>
                <div>
                    <strong>Email:</strong><br>
                    <a href="mailto:${email}">${email}</a>
                </div>
            `;
            
            // Insert after phone section
            const phoneSection = contactInfoBox.querySelector('.info-item:has(i.fas.fa-phone-alt)');
            if (phoneSection) {
                phoneSection.parentNode.insertBefore(emailSection, phoneSection.nextSibling);
            } else {
                // If no phone section, add to the end
                contactInfoBox.appendChild(emailSection);
            }
        }
    }
}

// Initialize contact info manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the contact page
    if (window.location.pathname.includes('contact')) {
        window.contactInfoManager = new ContactInfoManager();
    }
}); 