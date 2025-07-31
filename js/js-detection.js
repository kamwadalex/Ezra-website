// JavaScript Detection Utility
(function() {
    'use strict';
    
    // Function to show JavaScript warning
    function showJavaScriptWarning(pageType = 'general') {
        const warnings = {
            general: {
                title: 'JavaScript is Required',
                description: 'This website requires JavaScript to function properly. Many features including:',
                features: [
                    'Dynamic content loading (news, events, gallery)',
                    'Interactive slideshow and navigation',
                    'Contact forms and admin dashboard',
                    'Real-time updates and notifications'
                ],
                message: 'Please enable JavaScript in your browser to use this website.'
            },
            admin: {
                title: 'JavaScript is Required',
                description: 'The admin dashboard requires JavaScript to function. Without JavaScript, you cannot:',
                features: [
                    'Log in to the admin panel',
                    'Upload or manage gallery images',
                    'Add or edit news articles',
                    'Manage events and messages',
                    'Access any admin functionality'
                ],
                message: 'Please enable JavaScript in your browser to access the admin dashboard.'
            },
            contact: {
                title: 'JavaScript is Required',
                description: 'This page requires JavaScript for full functionality. Without JavaScript, you cannot:',
                features: [
                    'Submit the contact form',
                    'Receive form validation feedback',
                    'Get real-time form status updates',
                    'Access dynamic content features'
                ],
                message: 'Please enable JavaScript in your browser to use the contact form.'
            },
            gallery: {
                title: 'JavaScript is Required',
                description: 'This gallery page requires JavaScript to function properly. Without JavaScript, you cannot:',
                features: [
                    'View gallery images (they load dynamically)',
                    'Upload new images to the gallery',
                    'Use the image modal for detailed viewing',
                    'Access interactive gallery features'
                ],
                message: 'Please enable JavaScript in your browser to view the gallery.'
            }
        };
        
        const warning = warnings[pageType] || warnings.general;
        
        const warningHTML = `
            <div class="js-warning">
                <div class="js-warning-content">
                    <h2><i class="fas fa-exclamation-triangle"></i> ${warning.title}</h2>
                    <p>${warning.description}</p>
                    <ul>
                        ${warning.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                    <p><strong>${warning.message}</strong></p>
                    <div class="js-enable-instructions">
                        <h3>How to enable JavaScript:</h3>
                        <div class="browser-instructions">
                            <div class="browser">
                                <h4>Chrome/Edge</h4>
                                <p>Settings → Privacy and security → Site Settings → JavaScript → Allowed</p>
                            </div>
                            <div class="browser">
                                <h4>Firefox</h4>
                                <p>Settings → Privacy & Security → Permissions → JavaScript → Enable</p>
                            </div>
                            <div class="browser">
                                <h4>Safari</h4>
                                <p>Preferences → Security → Enable JavaScript</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', warningHTML);
    }
    
    // Function to hide JavaScript warning (called when JS is enabled)
    function hideJavaScriptWarning() {
        const noscriptWarnings = document.querySelectorAll('.js-warning');
        noscriptWarnings.forEach(warning => warning.remove());
    }
    
    // Auto-hide warning when JavaScript is running
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideJavaScriptWarning);
    } else {
        hideJavaScriptWarning();
    }
    
    // Expose functions globally for manual use
    window.JSDetection = {
        showWarning: showJavaScriptWarning,
        hideWarning: hideJavaScriptWarning
    };
    
})(); 