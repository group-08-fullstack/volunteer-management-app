from flask_restful import Resource, reqparse
from flask import jsonify
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity

# In-memory event list
events = [
    {
        "id": 1,
        "event": "Senior Center Visit",
        "date": "July 5, 2025",
        "time": "2:00 PM - 5:00 PM",
        "location": "Golden Years Senior Center",
        "volunteers": 8
    },
    {
        "id": 2,
        "event": "Park Restoration",
        "date": "July 12, 2025",
        "time": "9:00 AM - 1:00 PM",
        "location": "Riverside Park",
        "volunteers": 15
    },
    {
        "id": 3,
        "event": "Youth Mentoring",
        "date": "July 18, 2025",
        "time": "4:00 PM - 6:00 PM",
        "location": "Community Youth Center",
        "volunteers": 5
    }
]

# Argument parser for POST
event_parser = reqparse.RequestParser()
event_parser.add_argument('event', type=str, required=True)
event_parser.add_argument('date', type=str, required=True)
event_parser.add_argument('time', type=str, required=True)
event_parser.add_argument('location', type=str, required=True)
event_parser.add_argument('volunteers', type=int, required=True)

# GET and POST for event list
class EventList(Resource):
    @jwt_required()
    def get(self):
        identity = get_jwt_identity() 
        return jsonify(events)

    @jwt_required()
    def post(self):
        args = event_parser.parse_args()
        new_event = {
            "id": max(event["id"] for event in events) + 1 if events else 1,
            "event": args["event"],
            "date": args["date"],
            "time": args["time"],
            "location": args["location"],
            "volunteers": args["volunteers"]
        }
        events.append(new_event)
        return {"message": "Event created successfully!", "event": new_event}, 201

# DELETE individual event
class Event(Resource):
    @jwt_required()
    def delete(self, event_id):
        global events
        events = [e for e in events if e["id"] != event_id]
        return {"message": f"Event {event_id} deleted."}, 200
