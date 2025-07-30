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

        # Establish connection
        conn = db.get_db()

        # Create cursor
        cursor = conn.cursor()

        # Check for presence of data
        if not newEntry:
            return {"error": "Missing JSON body"}, 400

        # Required top-level fields
        required_fields = [
            "event_id", "volunteer_email", "participation_status"
        ]
        for field in required_fields:
            if field not in newEntry:
                return {"error": f"Missing field '{field}'"}, 400

        # Type checks
        if not isinstance(newEntry["event_id"], int):
            return {"error": "'event_id' must be a int"}, 400
        
        if not isinstance(newEntry["volunteer_email"], str):
            return {"error": "'volunteer_email' must be a string"}, 400

        # Check participation_status
        participation = newEntry["participation_status"]
        if not isinstance(participation, str):
            return {"error": "'participation_status' must be a string"}, 400

        
        # Add to database

        try:
            # Get the user_id from UserCredentials table using email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (newEntry["volunteer_email"],)
            )
            user_result = cursor.fetchone()

            if not user_result:
                return {"error": "User not found"}, 404
            
            volunteer_id = user_result['user_id']

            cursor.execute(
            'INSERT INTO volunteerhistory (event_id,volunteer_id, participation_status) VALUES (%s, %s, %s)',
            (newEntry["event_id"],volunteer_id,newEntry["participation_status"])
            )

        except Exception as e:
            print(f"Database error: {e}")
            return {"error": str(e)}, 500


        # Save actions to db
        conn.commit()

        # #Close the cursor and conn
        cursor.close()
        conn.close()


        return {"Msg": "Success"}, 201