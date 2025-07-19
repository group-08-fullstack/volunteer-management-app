import {checkTokenTime} from "./authHelpers"

// Get admin dashboard overview data
export async function getAdminDashboard(){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/admin/dashboard/`, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    if (response.ok) {
        const parsed = await response.json();
        return parsed;
    } else {
        throw new Error(`Failed to get admin dashboard: ${response.statusText}`);
    }
}

// Get all volunteers with sorting and filtering
export async function getVolunteers(options = {}){
    // First validate that user JWT token is still valid
    await checkTokenTime();

    // Build query parameters
    const params = new URLSearchParams();
    if (options.sortBy) params.append('sort_by', options.sortBy);
    if (options.order) params.append('order', options.order);
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit);

    const queryString = params.toString();
    const url = `http://127.0.0.1:5000/api/admin/volunteers/${queryString ? '?' + queryString : ''}`;
   
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
        throw new Error(`Failed to get volunteers: ${response.statusText}`);
    }
}

// Get all events with filtering
export async function getEvents(options = {}){
    // First validate that user JWT token is still valid
    await checkTokenTime();

    // Build query parameters
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit);

    const queryString = params.toString();
    const url = `http://127.0.0.1:5000/api/admin/events/${queryString ? '?' + queryString : ''}`;
   
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
        throw new Error(`Failed to get events: ${response.statusText}`);
    }
}

// Get detailed statistics
export async function getAdminStatistics(){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/admin/statistics/`, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    if (response.ok) {
        const parsed = await response.json();
        return parsed;
    } else {
        throw new Error(`Failed to get statistics: ${response.statusText}`);
    }
}

// Get detailed volunteer information
export async function getVolunteerDetail(volunteerId){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/admin/volunteers/${volunteerId}/`, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    if (response.ok) {
        const parsed = await response.json();
        return parsed;
    } else if (response.status === 404) {
        throw new Error('Volunteer not found');
    } else {
        throw new Error(`Failed to get volunteer details: ${response.statusText}`);
    }
}

// Get detailed event information
export async function getEventDetail(eventId){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/admin/events/${eventId}/`, {
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

// Helper function to get top volunteers with specific sorting
export async function getTopVolunteers(sortBy = 'events', limit = 3){
    try {
        const options = {
            sortBy: sortBy,
            order: 'desc',
            limit: limit
        };
        const result = await getVolunteers(options);
        return result.volunteers;
    } catch (error) {
        console.error('Error getting top volunteers:', error);
        // Return fallback data if API fails
        return [
        ];
    }
}

// Helper function to get upcoming events
export async function getUpcomingEvents(limit = 3){
    try {
        const options = {
            status: 'upcoming',
            limit: limit
        };
        const result = await getEvents(options);
        return result.events;
    } catch (error) {
        console.error('Error getting upcoming events:', error);
        // Return fallback data if API fails
        return [
        ];
    }
}