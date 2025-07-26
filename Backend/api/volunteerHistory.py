from flask_restful import Resource
from datetime import datetime
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity


# Define needed inputs

data = [
    {
        "eventName": "Community Park Cleanup",
        "eventDescription": "Join us for a day of cleaning and beautifying the neighborhood park. Volunteers will help with trash pickup, light landscaping, and painting benches.",
        "location": "Greenwood Community Park, 123 Elm St, Springfield",
        "requiredSkills": ["Gardening", "Teamwork", "Painting"],
        "urgency": {"text": "High", "numeric": 2},
        "eventDate": "2025-07-10",
        "participationStatus": {"text": "Registered", "numeric": 1}
    }
]


class VolHistory(Resource):
    @jwt_required()
    def get(self):
        userEmail = get_jwt_identity()
        
        # This will return data where the userEmail is in database
        return data, 200
    
    @jwt_required()
    def post(self):
        newEntry = request.get_json()
        userEmail = get_jwt_identity()

        # Check for presence of data
        if not newEntry:
            return {"error": "Missing JSON body"}, 400

        # Required top-level fields
        required_fields = [
            "eventName", "eventDescription", "location", 
            "requiredSkills", "urgency", "eventDate", "participationStatus"
        ]
        for field in required_fields:
            if field not in newEntry:
                return {"error": f"Missing field '{field}'"}, 400

        # Type checks
        if not isinstance(newEntry["eventName"], str):
            return {"error": "'eventName' must be a string"}, 400

        if not isinstance(newEntry["eventDescription"], str):
            return {"error": "'eventDescription' must be a string"}, 400

        if not isinstance(newEntry["location"], str):
            return {"error": "'location' must be a string"}, 400

        if not isinstance(newEntry["requiredSkills"], list) or not all(isinstance(skill, str) for skill in newEntry["requiredSkills"]):
            return {"error": "'requiredSkills' must be a list of strings"}, 400

        # Check urgency
        urgency = newEntry["urgency"]
        if not isinstance(urgency, dict):
            return {"error": "'urgency' must be an object with 'text' and 'numeric'"}, 400
        if "text" not in urgency or "numeric" not in urgency:
            return {"error": "Missing fields in 'urgency'"}, 400
        if not isinstance(urgency["text"], str):
            return {"error": "'urgency.text' must be a string"}, 400
        if not isinstance(urgency["numeric"], int):
            return {"error": "'urgency.numeric' must be an integer"}, 400

        # Check eventDate
        try:
            datetime.strptime(newEntry["eventDate"], "%Y-%m-%d")
        except ValueError:
            return {"error": "'eventDate' must be in 'YYYY-MM-DD' format"}, 500

        # Check participationStatus
        participation = newEntry["participationStatus"]
        if not isinstance(participation, dict):
            return {"error": "'participationStatus' must be an object with 'text' and 'numeric'"}, 400
        if "text" not in participation or "numeric" not in participation:
            return {"error": "Missing fields in 'participationStatus'"}, 400
        if not isinstance(participation["text"], str):
            return {"error": "'participationStatus.text' must be a string"}, 400
        if not isinstance(participation["numeric"], int):
            return {"error": "'participationStatus.numeric' must be an integer"}, 400

        
        # Passed all validations
        # This would be added to the user history in the database
        newEntry['user'] = userEmail
        data.append(newEntry)
        return {"Msg": "Success"}, 201