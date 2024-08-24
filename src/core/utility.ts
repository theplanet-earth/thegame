// Function to get coordinates from URL
export function getCoordinates(): { lat: number; lng: number } | null {
    const path = window.location.pathname;
    const parts = path.split('@')[1]; // assuming URL format is /@lat,lng
    if (parts) {
        const coords = parts.split(',');
        if (coords.length === 2) {
            const lat = parseFloat(coords[0]);
            const lng = parseFloat(coords[1]);
            return { lat, lng };
        }
    }
    return null;
}

// Wait for the DOM to be fully loaded
export function setupAppEventHandlers(): void {
    document.addEventListener('appReady', (event: Event) => {
        // Cast the event as CustomEvent with a specific detail type
        const customEvent = event as CustomEvent<{ app: any }>;        
        const app = customEvent.detail.app; // Now you have access to the app instance
        const coordinates = getCoordinates();
        if (app && coordinates) {
            app.fire('initialize:coordinates', coordinates);
        }
    });
}
