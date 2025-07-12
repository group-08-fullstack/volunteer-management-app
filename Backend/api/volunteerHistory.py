from flask_restful import Resource
from flask import request



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

        # Retreive data to be added to database
        newEntry = request.get_json()

        # Add data to the database
        data.append(newEntry)

        return {"Msg" : "Success"}, 201