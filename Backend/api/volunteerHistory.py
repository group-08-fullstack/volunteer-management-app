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

            # Get volunteer particiaption status
            cursor.execute("SELECT * FROM volunteerhistory WHERE volunteer_id=%s",(user_id,))
            volHistoryResults = cursor.fetchall() # results holds rows


            # Get all event details
            event_ids = [row["event_id"] for row in volHistoryResults]

            if event_ids:
                format_strings = ','.join(['%s'] * len(event_ids)) # Generate enough '%s' for the variable length of event_ids
                cursor.execute(f"SELECT event_name,event_id, event_name, required_skills, address, state, city,urgency, location_name,event_description, date FROM eventdetails WHERE event_id IN ({format_strings})", event_ids)
                event_details = cursor.fetchall()
            else:
                event_details = []

             # Convert any datetime.date fields to strings
            for row in event_details:
                    if isinstance(row['date'], (date)):
                        row['date'] = row['date'].isoformat()  # Convert format

        except Exception as e:
            print(f"Database error: {e}")
            return {"error": str(e)}, 500


        # Save actions to db
        conn.commit()

        # Close the cursor and conn
        cursor.close()
        conn.close()

        # Merge dictionaries
        for i in range(len(event_details)):
            event_details[i].update(volHistoryResults[i])

        
        # This will return all user volunteer history
        return event_details, 200
    
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