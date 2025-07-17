from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required


# hard-coded database
class MatchVolunteer(Resource):
    volunteers = [
        { "email": "alice@yahoo.com", "name": "Alice Johnson" },
        { "email": "bob@yahoo.com", "name": "Bob Smith" },
        { "email": "carol@yahoo.com", "name": "Carol Williams" }
    ]

    events = [
        {
            "name": "Food Drive",
            "description": "Help distribute food to those in need",
            "location": "Community Center",
            "requiredSkills": ["Food Handling", "Bilingual"],
            "urgency": "High",
            "date": "2025-08-15"
        },
        {
            "name": "Animal Shelter Support",
            "description": "Assist with animal care and adoption events",
            "location": "Animal Shelter",
            "requiredSkills": ["Animal Handling"],
            "urgency": "Medium",
            "date": "2025-09-01"
        }
    ]
    @jwt_required()
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("volunteer_email", required=True, help="Volunteer email is required")
        parser.add_argument("event_name", required=True, help="Event name is required")
        args = parser.parse_args()

        volunteer = next((v for v in self.volunteers if v["email"] == args["volunteer_email"]), None)
        event = next((e for e in self.events if e["name"] == args["event_name"]), None)

        if not volunteer or not event:
            return {"message": "Volunteer or Event not found"}, 404
        
        return {
            "message": f"{volunteer['name']} matched to event {event['name']}",
            "volunteer": volunteer,
            "event": event
        }, 200
