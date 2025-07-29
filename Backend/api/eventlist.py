from flask_restful import Resource, reqparse
from flask import jsonify
from flask import request
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from . import db




event_parser = reqparse.RequestParser()
event_parser.add_argument('eventname', type=str, required=True)
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
            "eventname": row[1],
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
        data = event_parser.parse_args() 

        try:
           from datetime import datetime
           datetime.strptime(data["date"], "%Y-%m-%d") 

           event_duration_int = int(data["duration"])
           skills_string = ",".join([skill['value'] if isinstance(skill, dict) else skill for skill in data["skills"]])

           event_query = """
            INSERT INTO eventdetails (
            event_name, 
            required_skills, 
            state, 
            city, 
            zipcode, 
            urgency, 
            event_location, 
            event_duration, 
            event_description, 
            date
            ) 
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """

           event_values = (
            data["eventname"],
            skills_string,
            data["state"],
            data["city"],
            data["zipcode"],
            data["urgency"],
            data["location"],
            event_duration_int,
            data["description"],
            data["date"]
            )

           cursor.execute(event_query, event_values)
           conn.commit()

        except Exception as e:
         conn.rollback()
         return {"message": "Error submitting event", "error": str(e)}, 500
        finally:
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
