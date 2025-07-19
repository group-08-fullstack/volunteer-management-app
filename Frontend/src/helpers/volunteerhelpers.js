import {checkTokenTime} from "../helpers/authHelpers"

// Get volunteer dashboard overview data
export async function getVolunteerDashboard(){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/volunteer/dashboard/`, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    if (response.ok) {
        const parsed = await response.json();
        return parsed;
    } else {
        throw new Error(`Failed to get volunteer dashboard: ${response.statusText}`);
    }
}

// Get volunteer history with optional filtering
export async function getVolunteerHistory(options = {}){
    // First validate that user JWT token is still valid
    await checkTokenTime();

    // Build query parameters
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.status) params.append('status', options.status);

    const queryString = params.toString();
    const url = `http://127.0.0.1:5000/api/volunteer/history/${queryString ? '?' + queryString : ''}`;
   
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    if (response.ok) {
        const parsed = await response.json();
        return parsed;
    } else {
        throw new Error(`Failed to get volunteer history: ${response.statusText}`);
    }
}

// Get upcoming events with filtering
export async function getUpcomingVolunteerEvents(options = {}){
    // First validate that user JWT token is still valid
    await checkTokenTime();

    // Build query parameters
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.status) params.append('status', options.status);

    const queryString = params.toString();
    const url = `http://127.0.0.1:5000/api/volunteer/events/${queryString ? '?' + queryString : ''}`;
   
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    if (response.ok) {
        const parsed = await response.json();
        return parsed;
    } else {
        throw new Error(`Failed to get upcoming events: ${response.statusText}`);
    }
}

// Get detailed volunteer profile
export async function getVolunteerProfile(){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/volunteer/profile/`, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    if (response.ok) {
        const parsed = await response.json();
        return parsed;
    } else {
        throw new Error(`Failed to get volunteer profile: ${response.statusText}`);
    }
}

// Get detailed event information
export async function getVolunteerEventDetail(eventId){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/volunteer/events/${eventId}/`, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    if (response.ok) {
        const parsed = await response.json();
        return parsed;
    } else if (response.status === 404) {
        throw new Error('Event not found');
    } else {
        throw new Error(`Failed to get event details: ${response.statusText}`);
    }
}

// Register for an event
export async function registerForEvent(eventId){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/volunteer/events/${eventId}/register/`, {
        method: "POST",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    const parsed = await response.json();

    if (!response.ok) {
        throw new Error(parsed.error || 'Failed to register for event');
    }

    return parsed;
}

// Unregister from an event
export async function unregisterFromEvent(eventId){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/volunteer/events/${eventId}/register/`, {
        method: "DELETE",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    const parsed = await response.json();

    if (!response.ok) {
        throw new Error(parsed.error || 'Failed to unregister from event');
    }

    return parsed;
}

// Helper function to get recent volunteer history (last 3 events)
export async function getRecentVolunteerHistory(){
    try {
        const result = await getVolunteerHistory({ limit: 3, status: 'completed' });
        return result.history;
    } catch (error) {
        console.error('Error getting recent volunteer history:', error);
        return [

        ];
    }
}

// Helper function to get next upcoming events (next 3 events)
export async function getNextUpcomingEvents(){
    try {
        const result = await getUpcomingVolunteerEvents({ limit: 3 });
        return result.events;
    } catch (error) {
        console.error('Error getting upcoming events:', error);
        return [
        ];
    }
}

// Helper function to format date for display
export function formatEventDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Helper function to format time for display
export function formatEventTime(startTime, endTime) {
    const formatTime = (timeString) => {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };
    
    if (endTime) {
        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    } else {
        return formatTime(startTime);
    }
}