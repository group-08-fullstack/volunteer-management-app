import {checkTokenTime} from "../helpers/authHelpers"

// Get user's profile
export async function getUserProfile(){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/profile/`, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    if (response.ok) {
        const parsed = await response.json();
        return parsed;
    } else if (response.status === 404) {
        return null; // No profile exists yet
    } else {
        throw new Error(`Failed to get profile: ${response.statusText}`);
    }
}

// Create a new profile
export async function createProfile(profileData){
    // First validate that user JWT token is still valid
    await checkTokenTime();

    const response = await fetch(`http://127.0.0.1:5000/api/profile/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(profileData)
    });

    const parsed = await response.json();

    if (!response.ok) {
        throw new Error(parsed.error || 'Failed to create profile');
    }

    return parsed;
}

// Update existing profile
export async function updateProfile(profileData){
    // First validate that user JWT token is still valid
    await checkTokenTime();

    const response = await fetch(`http://127.0.0.1:5000/api/profile/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(profileData)
    });

    const parsed = await response.json();

    if (!response.ok) {
        throw new Error(parsed.error || 'Failed to update profile');
    }

    return parsed;
}

// Delete user's profile
export async function deleteProfile() {
    // First validate that user JWT token is still valid
    await checkTokenTime();

    const response = await fetch(`http://127.0.0.1:5000/api/profile/`, {
        method: "DELETE",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        }
    });

    if (!response.ok) {
        const parsed = await response.json();
        throw new Error(parsed.error || 'Failed to delete profile');
    }

    return true;
}

// ✅ UPDATED: Get skills from backend API
export async function getSkillsOptions(){
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/profile/skills/`, {
            method: "GET"
            // No auth required for reference data
        });

        if (response.ok) {
            const parsed = await response.json();
            return parsed.skills;
        } else {
            console.error('Failed to load skills from API, using fallback');
            // Return fallback skills if API fails
            return [
            ];
        }
    } catch (error) {
        console.error('Network error loading skills, using fallback:', error);
        // Return fallback skills if network fails
        return [

        ];
    }
}

// ✅ UPDATED: Get states from backend API
export async function getStatesOptions(){
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/profile/states/`, {
            method: "GET"
            // No auth required for reference data
        });

        if (response.ok) {
            const parsed = await response.json();
            return parsed.states;
        } else {
            console.error('Failed to load states from API, using fallback');
            // Return fallback states if API fails
            return [
            ];
        }
    } catch (error) {
        console.error('Network error loading states, using fallback:', error);
        // Return fallback states if network fails
        return [
        ];
    }
}

