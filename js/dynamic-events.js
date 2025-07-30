// Dynamic Events Loading from Firestore
document.addEventListener('DOMContentLoaded', function() {
    const eventsGrid = document.getElementById('events-grid');
    
    if (!eventsGrid) {
        console.error('Events grid element not found');
        return;
    }

    // Initialize Firebase if not already initialized
    if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded');
        showError('Firebase not available');
        return;
    }

    // Get Firestore instance
    const db = firebase.firestore();
    
    // Load upcoming events
    loadUpcomingEvents();

    async function loadUpcomingEvents() {
        try {
            showLoading();
            
            // Get current date
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            // Query events that are today or in the future, ordered by date
            const eventsSnapshot = await db.collection('events')
                .where('date', '>=', today)
                .orderBy('date', 'asc')
                .limit(6) // Limit to 6 upcoming events
                .get();

            if (eventsSnapshot.empty) {
                showNoEvents();
                return;
            }

            const events = [];
            eventsSnapshot.forEach(doc => {
                const eventData = doc.data();
                events.push({
                    id: doc.id,
                    ...eventData,
                    date: eventData.date.toDate() // Convert Firestore timestamp to Date
                });
            });

            displayEvents(events);

        } catch (error) {
            console.error('Error loading events:', error);
            showError('Failed to load upcoming events');
        }
    }

    function displayEvents(events) {
        eventsGrid.innerHTML = '';
        
        events.forEach(event => {
            const eventCard = createEventCard(event);
            eventsGrid.appendChild(eventCard);
        });
    }

    function createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        
        // Format date
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Format time
        const formattedTime = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Get appropriate icon based on category
        const categoryIcon = getCategoryIcon(event.category);

        card.innerHTML = `
            <div class="event-header">
                <div class="event-date">${formattedDate}</div>
                <div class="event-time">${formattedTime}</div>
            </div>
            <div class="event-content">
                <h3 class="event-title">
                    <i class="${categoryIcon}"></i>
                    ${event.title}
                </h3>
                <p class="event-description">${event.description}</p>
                ${event.location ? `<div class="event-location">
                    ${event.location}
                </div>` : ''}
                <span class="event-category">${event.category}</span>
            </div>
        `;

        return card;
    }

    function getCategoryIcon(category) {
        const iconMap = {
            'Academic': 'fas fa-graduation-cap',
            'Sports': 'fas fa-futbol',
            'Cultural': 'fas fa-music',
            'Meeting': 'fas fa-users',
            'Examination': 'fas fa-file-alt',
            'Holiday': 'fas fa-calendar-day',
            'Other': 'fas fa-calendar-alt'
        };
        
        return iconMap[category] || 'fas fa-calendar-alt';
    }

    function showLoading() {
        eventsGrid.innerHTML = `
            <div class="loading-events">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading upcoming events...</p>
            </div>
        `;
    }

    function showError(message) {
        eventsGrid.innerHTML = `
            <div class="error-events">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="retry-btn" onclick="location.reload()">Retry</button>
            </div>
        `;
    }

    function showNoEvents() {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-times"></i>
                <p>No upcoming events at the moment</p>
                <p>Check back later for new events!</p>
            </div>
        `;
    }
}); 