const API_BASE = 'http://localhost:5000/api';

export const api = {
    // Get all aircraft from backend
    getAircraft: async () => {
        try {
            const response = await fetch(`${API_BASE}/aircraft`);
            const data = await response.json();
            console.log('Fetched aircraft from backend:', data.length);
            return data;
        } catch (error) {
            console.error('Error fetching aircraft:', error);
            return [];
        }
    },
    
    // Get conflicts from backend
    getConflicts: async () => {
        try {
            const response = await fetch(`${API_BASE}/conflicts`);
            return response.json();
        } catch (error) {
            console.error('Error fetching conflicts:', error);
            return [];
        }
    },
    
    // Get stats
    getStats: async () => {
        try {
            const response = await fetch(`${API_BASE}/stats/dashboard`);
            return response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {};
        }
    }
};