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

// ✅ FIXED: Return hardcoded skills instead of API call
export async function getSkillsOptions(){
    // Return hardcoded skills since /api/profile/skills/ doesn't exist
    return [
        { value: 'bilingual', label: 'Bilingual' },
        { value: 'animal_handling', label: 'Animal Handling' },
        { value: 'food_handling', label: 'Food Handling' },
        { value: 'first_aid', label: 'First Aid Certified' },
        { value: 'tutoring', label: 'Tutoring/Teaching' },
    ];
}

// ✅ FIXED: Return hardcoded states instead of API call
export async function getStatesOptions(){
    // Return hardcoded states since /api/profile/states/ doesn't exist
    return [
        { value: 'CA', label: 'California' },
        { value: 'NY', label: 'New York' },
        { value: 'TX', label: 'Texas' },
    ];
}

// ✅ REMOVED: These functions call non-existent endpoints
// Remove these from your ProfileForm.jsx if you're using them:
// - searchProfiles()
// - getAllProfiles()