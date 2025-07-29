from flask_restful import Resource, reqparse
from flask import jsonify
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from . import db



# Argument parser for POST
event_parser = reqparse.RequestParser()
event_parser.add_argument('eventName', type=str, required=True)
event_parser.add_argument('skills', type=list, location='json', required=True)
event_parser.add_argument('state', type=str, required=True)
event_parser.add_argument('city', type=str, required=True)
event_parser.add_argument('zipcode', type=str, required=True)
event_parser.add_argument('urgency', type=str, required=True)
event_parser.add_argument('location', type=str, required=True)
event_parser.add_argument('duration', type=str, required=True)
event_parser.add_argument('description', type=str, required=True)
event_parser.add_argument('date', type=str, required=True)


class EventList(Resource):
    @jwt_required()
    def get(self):
     conn = db.get_db()
     cursor = conn.cursor()

     cursor.execute('SELECT * FROM eventdetails')
     rows = cursor.fetchall()

    
     events = []
     for row in rows:
        event = {
            "id": row[0],  
            "eventName": row[1],
            "requiredSkills": row[2].split(",") if row[2] else [],
            "state": row[3],
            "city": row[4],
            "zipcode": row[5],
            "urgency": row[6],
            "location": row[7],
            "duration": row[8],
            "description": row[9],
            "date": row[10]
        }
        events.append(event)

     cursor.close()
     conn.close()

     return jsonify(events)

   
    
    @jwt_required()
    def post(self):
        conn = db.get_db()
        cursor = conn.cursor()
        args = event_parser.parse_args()

        try:

            event_duration_int = int(args["time"])
            cursor.execute(
             'INSERT INTO eventdetails (event_name, required_skills, state, city, zipcode, urgency, event_location, event_duration, event_description, date) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',
            (args["eventName"], ",".join(args["skills"]), args["state"], args["city"], args["zipcode"], args["urgency"], args["location"], args["duration"], args["description"], args["date"])
            )
            conn.commit()

        except Exception as e:
           conn.rollback()
           cursor.close()
           conn.close()
           return {"message": "Error submitting event", "error": str(e)}, 500
     

        cursor.close()
        conn.close()
        return {"message": "Event saved to database!"}, 201
   

class Event(Resource):
    @jwt_required()
    def delete(self, event_id):
        conn = db.get_db()
        cursor = conn.cursor()
        global events
        events = [e for e in events if e["id"] != event_id]
        return {"message": f"Event {event_id} deleted."}, 200
