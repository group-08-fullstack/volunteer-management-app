import {checkTokenTime} from "../helpers/authHelpers"

// Get user's profile
export async function getUserProfile(){
    // First validate that user JWT token is still valid
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/profile/`, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${sessionStorage.getItem("access_token")}`
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
            "Authorization" : `Bearer ${sessionStorage.getItem("access_token")}`
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
            "Authorization" : `Bearer ${sessionStorage.getItem("access_token")}`
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
            "Authorization" : `Bearer ${sessionStorage.getItem("access_token")}`
        }
    });

    if (!response.ok) {
        const parsed = await response.json();
        throw new Error(parsed.error || 'Failed to delete profile');
    }

    return true;
}

// ✅ SIMPLIFIED: Get skills from backend API
export const getSkillsOptions = async () => {
  try {
    console.log('🔄 Fetching skills from API...');
    await checkTokenTime();
    
    const token = sessionStorage.getItem("access_token");
    const response = await fetch(`http://127.0.0.1:5000/api/profile/skills/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Skills API response status:', response.status);

    if (!response.ok) {
      throw new Error(`Skills API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Skills data received:', data);
    
    return data.skills || [];
  } catch (error) {
    console.error('❌ Error fetching skills:', error);
    throw error;
  }
};

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

