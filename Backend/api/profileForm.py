import re
from flask_restful import Resource
from datetime import datetime
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

# Sample profile data for demonstration
profiles = [
    {
        "id": 1,
        "userId": "user123",
        "fullName": "John Smith",
        "address1": "123 Main Street",
        "address2": "Apt 2B",
        "city": "Springfield",
        "state": "CA",
        "zip": "90210",
        "skills": [
            {"value": "bilingual", "label": "Bilingual"},
            {"value": "first_aid", "label": "First Aid Certified"}
        ],
        "preferences": "Prefer weekend events and working with children",
        "availability": ["2025-07-15", "2025-07-20", "2025-07-25"],
        "createdAt": "2025-07-10T10:00:00Z",
        "updatedAt": "2025-07-10T10:00:00Z"
    },
    {
        "id": 2,
        "userId": "user456",
        "fullName": "Jane Doe",
        "address1": "456 Oak Avenue",
        "address2": "",
        "city": "Rivertown",
        "state": "NY",
        "zip": "10001",
        "skills": [
            {"value": "animal_handling", "label": "Animal Handling"},
            {"value": "tutoring", "label": "Tutoring/Teaching"}
        ],
        "preferences": "Available for long-term commitments",
        "availability": ["2025-07-18", "2025-07-22", "2025-07-30"],
        "createdAt": "2025-07-11T14:30:00Z",
        "updatedAt": "2025-07-11T14:30:00Z"
    }
]

# Valid skill options (should match frontend)
VALID_SKILLS = [
    {"value": "bilingual", "label": "Bilingual"},
    {"value": "animal_handling", "label": "Animal Handling"},
    {"value": "food_handling", "label": "Food Handling"},
    {"value": "first_aid", "label": "First Aid Certified"},
    {"value": "tutoring", "label": "Tutoring/Teaching"},
    {"value": "cashier", "label": "Cash Handling"}
]

# Valid state options (should match frontend)
VALID_STATES = [
    {"value": "CA", "label": "California"},
    {"value": "FL", "label": "Florida"},
    {"value": "NY", "label": "New York"},
    {"value": "TX", "label": "Texas"}
]

class Profile(Resource):
    @jwt_required()
    def get(self):
        """Get user's profile"""
        current_user_id = get_jwt_identity()
        
        # Find user's profile
        user_profile = next((p for p in profiles if p["userId"] == current_user_id), None)
        
        if not user_profile:
            return {"error": "Profile not found"}, 404
            
        return user_profile, 200
    
    @jwt_required()
    def post(self):
        """Create a new profile"""
        current_user_id = get_jwt_identity()
        profile_data = request.get_json()
        
        # Check if user already has a profile
        existing_profile = next((p for p in profiles if p["userId"] == current_user_id), None)
        if existing_profile:
            return {"error": "Profile already exists. Use PUT to update."}, 400
        
        # Validate the profile data
        validation_result = self._validate_profile_data(profile_data)
        if validation_result:
            return validation_result, 400
        
        # Create new profile
        new_profile = {
            "id": len(profiles) + 1,
            "userId": current_user_id,
            "fullName": profile_data["fullName"],
            "address1": profile_data["address1"],
            "address2": profile_data.get("address2", ""),
            "city": profile_data["city"],
            "state": profile_data["state"],
            "zip": profile_data["zip"],
            "skills": profile_data["skills"],
            "preferences": profile_data.get("preferences", ""),
            "availability": profile_data["availability"],
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z"
        }
        
        profiles.append(new_profile)
        return {"message": "Profile created successfully", "profile": new_profile}, 201
    
    @jwt_required()
    def put(self):
        """Update existing profile"""
        current_user_id = get_jwt_identity()
        profile_data = request.get_json()
        
        # Find user's profile
        user_profile = next((p for p in profiles if p["userId"] == current_user_id), None)
        if not user_profile:
            return {"error": "Profile not found"}, 404
        
        # Validate the profile data
        validation_result = self._validate_profile_data(profile_data)
        if validation_result:
            return validation_result, 400
        
        # Update profile
        user_profile.update({
            "fullName": profile_data["fullName"],
            "address1": profile_data["address1"],
            "address2": profile_data.get("address2", ""),
            "city": profile_data["city"],
            "state": profile_data["state"],
            "zip": profile_data["zip"],
            "skills": profile_data["skills"],
            "preferences": profile_data.get("preferences", ""),
            "availability": profile_data["availability"],
            "updatedAt": datetime.utcnow().isoformat() + "Z"
        })
        
        return {"message": "Profile updated successfully", "profile": user_profile}, 200
    
    @jwt_required()
    def delete(self):
        """Delete user's profile"""
        current_user_id = get_jwt_identity()
        
        # Find and remove user's profile
        global profiles
        original_length = len(profiles)
        profiles = [p for p in profiles if p["userId"] != current_user_id]
        
        if len(profiles) == original_length:
            return {"error": "Profile not found"}, 404
        
        return {"message": "Profile deleted successfully"}, 200
    
    def _validate_profile_data(self, data):
        """Validate profile data and return error if invalid"""
        if not data:
            return {"error": "Missing JSON body"}
        
        # Required fields
        required_fields = ["fullName", "address1", "city", "state", "zip", "skills", "availability"]
        for field in required_fields:
            if field not in data:
                return {"error": f"Missing required field: {field}"}
        
        # Validate fullName
        if not isinstance(data["fullName"], str) or not data["fullName"].strip():
            return {"error": "Full name must be a non-empty string"}
        if len(data["fullName"]) > 50:
            return {"error": "Full name must be 50 characters or less"}
        
        # Validate address1
        if not isinstance(data["address1"], str) or not data["address1"].strip():
            return {"error": "Address 1 must be a non-empty string"}
        if len(data["address1"]) > 100:
            return {"error": "Address 1 must be 100 characters or less"}
        
        # Validate address2 (optional)
        if "address2" in data and data["address2"]:
            if not isinstance(data["address2"], str):
                return {"error": "Address 2 must be a string"}
            if len(data["address2"]) > 100:
                return {"error": "Address 2 must be 100 characters or less"}
        
        # Validate city
        if not isinstance(data["city"], str) or not data["city"].strip():
            return {"error": "City must be a non-empty string"}
        if len(data["city"]) > 100:
            return {"error": "City must be 100 characters or less"}
        
        # Validate state
        if not isinstance(data["state"], str) or not data["state"].strip():
            return {"error": "State must be a non-empty string"}
        valid_state_values = [state["value"] for state in VALID_STATES]
        if data["state"] not in valid_state_values:
            return {"error": f"Invalid state. Must be one of: {', '.join(valid_state_values)}"}
        
        # Validate zip code
        if not isinstance(data["zip"], str) or not data["zip"].strip():
            return {"error": "Zip code must be a non-empty string"}
        zip_pattern = r'^\d{5}(-\d{4})?$'
        if not re.match(zip_pattern, data["zip"]):
            return {"error": "Zip code must be in format 12345 or 12345-6789"}
        
        # Validate skills
        if not isinstance(data["skills"], list):
            return {"error": "Skills must be an array"}
        if len(data["skills"]) == 0:
            return {"error": "At least one skill must be selected"}
        
        valid_skill_values = [skill["value"] for skill in VALID_SKILLS]
        for skill in data["skills"]:
            if not isinstance(skill, dict) or "value" not in skill or "label" not in skill:
                return {"error": "Each skill must be an object with 'value' and 'label' properties"}
            if skill["value"] not in valid_skill_values:
                return {"error": f"Invalid skill value: {skill['value']}"}
        
        # Validate preferences (optional)
        if "preferences" in data and data["preferences"]:
            if not isinstance(data["preferences"], str):
                return {"error": "Preferences must be a string"}
        
        # Validate availability
        if not isinstance(data["availability"], list):
            return {"error": "Availability must be an array"}
        if len(data["availability"]) == 0:
            return {"error": "At least one availability date must be provided"}
        
        for date_str in data["availability"]:
            if not isinstance(date_str, str):
                return {"error": "Each availability date must be a string"}
            try:
                datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                return {"error": f"Invalid date format: {date_str}. Must be YYYY-MM-DD"}
        
        return None  # No validation errors

# Add these classes to the END of your profile.py file

class ProfileSkills(Resource):
    def get(self):
        """Get available skill options"""
        return {"skills": VALID_SKILLS}, 200


class ProfileStates(Resource):
    def get(self):
        """Get available state options"""
        return {"states": VALID_STATES}, 200

class ProfileList(Resource):
    @jwt_required()
    def get(self):
        """Get all profiles (admin only - you might want to add role checking)"""
        # This endpoint might be useful for admin dashboard
        return {"profiles": profiles, "total": len(profiles)}, 200