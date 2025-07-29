from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from . import db

class Notification(Resource):
    @jwt_required()
    def get(self):

        # Establish connection
        conn = db.get_db()

        # Create cursor
        cursor = conn.cursor()

        # Get current user
        userEmail = get_jwt_identity()

        if not userEmail:
            return 400
        
        # Database

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

            # Select all notifications
            cursor.execute("SELECT * FROM notifications WHERE user_id = %s", (user_id,))
            results = cursor.fetchall()
            
        except Exception as e:
            print(f"Database error: {e}")
            return {"error": "Failed"}, 500
    


        # Convert any datetime.date fields to strings
        for row in results:
                if isinstance(row['event_date'], (date)):
                    row['event_date'] = row['event_date'].isoformat()  # Convert to string

        #Close the cursor and db connection
        cursor.close()
        conn.close()
                

        return results, 200
    
    @jwt_required()
    def post(self):
        data = request.get_json()

        # Establish connection
        conn = db.get_db()


        # Create cursor
        cursor = conn.cursor()

        # Validate body structure
        required_fields = ["receiver","message", "date", "read"]
        if not data:
            return {"error": "Missing request body"}, 400

        for field in required_fields:
            if field not in data:
                return {"error": f"Missing field '{field}'"}, 400

        # Check if correct types
        if not isinstance(data["receiver"], str):
            return {"error": "'receiver' must be a string"}, 400
        if not isinstance(data["message"], str):
            return {"error": "'message' must be a string"}, 400
        if not isinstance(data["date"], str):
            return {"error": "'date' must be a string in YYYY-MM-DD format"}, 400
        if not isinstance(data["read"], bool):
            return {"error": "'read' must be a boolean"}, 400
        
        try:
            # Get the user_id from UserCredentials table using email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (data["receiver"],)
            )
            user_result = cursor.fetchone()

            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']

            
            cursor.execute(
            'INSERT INTO notifications (message, event_date, user_id, `read`) VALUES (%s, %s, %s, %s)',
            (data["message"], data["date"], user_id, data["read"])
            )
        except Exception as e:
            print(f"Database error: {e}")
            return {"error": "Failed"}, 500


        # Save actions to db
        conn.commit()

        #Close the cursor and db connection
        cursor.close()
        conn.close()

        return {"Msg": "Success"}, 201
    
    @jwt_required()
    def delete(self):
        # Extract notificationId from url parameters
        notiId = request.args.get('notiId')

       # Establish connection
        conn = db.get_db()


        # Create cursor
        cursor = conn.cursor()

        # Validate notiId
        if not notiId:
            return {"error": "Missing notiId parameter"}, 400
        if not notiId.isdigit():
            return {"error": "notiId must be a number"}, 400

        # Remove notificaion from the array,
        # database interactions 
        cursor.execute("DELETE FROM notifications WHERE notification_id = %s", (notiId,))

         # Save actions to db
        conn.commit()

        #Close the cursor and db connection
        cursor.close()
        conn.close()

    
        return {"Msg": "Data deleted"}, 200
    
    @jwt_required()
    def patch(self):
        notiId = request.args.get('notiId')
        data = request.get_json()

        # Establish connection
        conn = db.get_db()


        # Create cursor
        cursor = conn.cursor()



        # Validate notiId
        if not notiId:
            return {"error": "Missing notiId parameter"}, 400
        if not notiId.isdigit():
            return {"error": "notiId must be a number"}, 400
        

        notiId = int(notiId)



        # Validate request body
        if not data or "read" not in data:
            return {"error": "'read' field is required"}, 400
        if not isinstance(data["read"], bool):
            return {"error": "'read' must be a boolean"}, 400
        
        # DB update
        cursor.execute("UPDATE notifications SET `read` = %s WHERE notification_id = %s", (data["read"],notiId))

        
        # Save actions to db
        conn.commit()

        #Close the cursor and db connection
        cursor.close()
        conn.close()
        

        return {"Msg": "Success"}, 200
