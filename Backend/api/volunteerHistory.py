from flask_restful import Resource
from datetime import datetime
from flask import request

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
    },
    {
        "eventName": "Food Bank Distribution",
        "eventDescription": "Help us sort, package, and distribute food to families in need. Volunteers should be able to lift light boxes and work efficiently in a team.",
        "location": "Helping Hands Food Bank, 45 River Rd, Rivertown",
        "requiredSkills": ["Organization", "Lifting", "Customer Service"],
        "urgency": {"text": "Medium", "numeric": 1},
        "eventDate": "2025-07-15",
        "participationStatus": {"text": "Interested", "numeric": 0}
    },
    {
        "eventName": "Animal Shelter Volunteering",
        "eventDescription": "Assist with feeding, walking, and socializing animals waiting for adoption. Great opportunity for animal lovers!",
        "location": "Sunny Paws Shelter, 22 Pet Lane, Springfield",
        "requiredSkills": ["Compassion", "Responsibility", "Animal Care"],
        "urgency": {"text": "Low", "numeric": 0},
        "eventDate": "2025-07-08",
        "participationStatus": {"text": "Completed", "numeric": 2}
    },
    {
        "eventName": "Riverbank Restoration Project",
        "eventDescription": "Work alongside environmental specialists to restore the natural habitat along the riverbank. Tasks include planting native species and removing invasive plants.",
        "location": "Maple River Trailhead, 321 River Rd, Springfield",
        "requiredSkills": ["Environmental Awareness", "Physical Stamina", "Teamwork"],
        "urgency": {"text": "High", "numeric": 2},
        "eventDate": "2025-07-12",
        "participationStatus": {"text": "Registered", "numeric": 1}
    },
    {
        "eventName": "Senior Center Tech Help",
        "eventDescription": "Help seniors learn to use smartphones and computers for staying in touch with family and friends.",
        "location": "Evergreen Senior Center, 90 Oak Blvd, Rivertown",
        "requiredSkills": ["Patience", "Technology", "Communication"],
        "urgency": {"text": "Medium", "numeric": 1},
        "eventDate": "2025-07-18",
        "participationStatus": {"text": "Interested", "numeric": 0}
    },
    {
        "eventName": "Community Mural Painting",
        "eventDescription": "Join local artists to design and paint a mural that reflects the community’s history and culture.",
        "location": "Downtown Wall Project, 12 Main St, Springfield",
        "requiredSkills": ["Artistic Skills", "Creativity", "Teamwork"],
        "urgency": {"text": "High", "numeric": 2},
        "eventDate": "2025-07-14",
        "participationStatus": {"text": "Completed", "numeric": 2}
    },
    {
        "eventName": "Library Summer Reading Program",
        "eventDescription": "Support young readers by helping with storytime, book organization, and activity stations during the summer reading kickoff.",
        "location": "Springfield Public Library, 88 Bookworm Ave, Springfield",
        "requiredSkills": ["Reading", "Patience", "Organization"],
        "urgency": {"text": "Low", "numeric": 0},
        "eventDate": "2025-07-05",
        "participationStatus": {"text": "Interested", "numeric": 0}
    },
    {
        "eventName": "Neighborhood Tree Planting",
        "eventDescription": "Join a local greening effort to plant trees and increase shade coverage across neighborhoods in need.",
        "location": "Various locations across North Springfield",
        "requiredSkills": ["Gardening", "Teamwork", "Physical Strength"],
        "urgency": {"text": "Medium", "numeric": 1},
        "eventDate": "2025-07-13",
        "participationStatus": {"text": "Registered", "numeric": 1}
    },
    {
        "eventName": "Homeless Shelter Meal Prep",
        "eventDescription": "Prepare and serve hot meals to guests at the local homeless shelter. Volunteers will work kitchen shifts with staff.",
        "location": "Safe Haven Shelter, 210 Hope St, Springfield",
        "requiredSkills": ["Cooking", "Teamwork", "Efficiency"],
        "urgency": {"text": "High", "numeric": 2},
        "eventDate": "2025-07-09",
        "participationStatus": {"text": "Completed", "numeric": 2}
    },
    {
        "eventName": "Park Safety Patrol",
        "eventDescription": "Help monitor and report safety concerns during a busy community park event. Volunteers walk trails and offer assistance.",
        "location": "Liberty Park, 9 Freedom Blvd, Rivertown",
        "requiredSkills": ["Alertness", "Public Communication", "Walking"],
        "urgency": {"text": "Medium", "numeric": 1},
        "eventDate": "2025-07-11",
        "participationStatus": {"text": "Registered", "numeric": 1}
    }
]

class VolHistory(Resource):
    def get(self):
        return data, 200
    
    def post(self):
        newEntry = request.get_json()

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
            return {"error": "'eventDate' must be in 'YYYY-MM-DD' format"}, 400

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
        data.append(newEntry)
        return {"Msg": "Success"}, 201