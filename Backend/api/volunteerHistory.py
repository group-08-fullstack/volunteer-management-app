from flask_restful import Resource
from datetime import datetime
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from . import db
import json


class VolHistory(Resource):
    @jwt_required()
    def get(self):
        userEmail = get_jwt_identity()

        # Establish connection
        conn = db.get_db()

        # Create cursor
        cursor = conn.cursor()

        try:
            # Get the user_id from UserCredentials table using email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (userEmail,)
            )
            user_result = cursor.fetchone()

            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']


            cursor.execute("SELECT * FROM volunteerhistory WHERE volunteer_id=%s",(user_id,))
            results = cursor.fetchall()

             # Convert any datetime.date fields to strings
            for row in results:
                    if isinstance(row['event_date'], (date)):
                        row['event_date'] = row['event_date'].isoformat()  # Convert format

            # Convert nested json, since only top level will be converted by frontend
            for row in results:
                row['urgency'] = json.loads(row['urgency'])
                row['participation_status'] = json.loads(row['participation_status'])

        except Exception as e:
            print(f"Database error: {e}")
            return {"error": "Failed"}, 500




        # Save actions to db
        conn.commit()

        # Close the cursor and conn
        cursor.close()
        conn.close()
        
        # This will return data where the userEmail is in database
        return results, 200
    
    @jwt_required()
    def post(self):
        newEntry = request.get_json()
        userEmail = get_jwt_identity()

        # Establish connection
        conn = db.get_db()

        # Create cursor
        cursor = conn.cursor()

        # Check for presence of data
        if not newEntry:
            return {"error": "Missing JSON body"}, 400

        # Required top-level fields
        required_fields = [
            "event_name", "event_description", "event_location", 
            "required_skills", "urgency", "event_date", "participation_status"
        ]
        for field in required_fields:
            if field not in newEntry:
                return {"error": f"Missing field '{field}'"}, 400

        # Type checks
        if not isinstance(newEntry["event_name"], str):
            return {"error": "'event_name' must be a string"}, 400

        if not isinstance(newEntry["event_description"], str):
            return {"error": "'event_description' must be a string"}, 400

        if not isinstance(newEntry["event_location"], str):
            return {"error": "'event_location' must be a string"}, 400

        if not isinstance(newEntry["required_skills"], list) or not all(isinstance(skill, str) for skill in newEntry["required_skills"]):
            return {"error": "'required_skills' must be a list of strings"}, 400

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

        # Check event_date
        try:
            datetime.strptime(newEntry["event_date"], "%Y-%m-%d")
        except ValueError:
            return {"error": "'event_date' must be in 'YYYY-MM-DD' format"}, 500

        # Check participation_status
        participation = newEntry["participation_status"]
        if not isinstance(participation, dict):
            return {"error": "'participation_status' must be an object with 'text' and 'numeric'"}, 400
        if "text" not in participation or "numeric" not in participation:
            return {"error": "Missing fields in 'participation_status'"}, 400
        if not isinstance(participation["text"], str):
            return {"error": "'participation_status.text' must be a string"}, 400
        if not isinstance(participation["numeric"], int):
            return {"error": "'participation_status.numeric' must be an integer"}, 400

        
        # Add to database
        cursor.execute(
        'INSERT INTO volunteerhistory (email,event_name, event_description, event_event_location, required_skills, urgency,event_date, participation_status) VALUES (%s, %s, %s, %s)',
        (userEmail, newEntry["event_name"], newEntry["event_description"], newEntry["event_location"],newEntry["required_skills"], newEntry["urgency"],newEntry["event_date"],newEntry["participation_status"])
        )

        # Save actions to db
        conn.commit()

        # #Close the cursor and conn
        cursor.close()
        conn.close()


        return {"Msg": "Success"}, 201