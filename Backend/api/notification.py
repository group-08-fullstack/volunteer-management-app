from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

notifications = [
    { "receiver" : "Testuser1", "message": "Welcome!", "date": "6/28/2025", "read": False, "id": 0 },
    { "receiver" : "Testuser1", "message": "Edit profile Reminder", "date": "7/10/2025", "read": False ,"id": 1 },
      {"receiver" : "Testuser1", "message": "New Event: Food Drive", "date": "6/29/2025", "read": False,"id": 2 },
    {"receiver" : "Testuser1",  "message": "Event updated : Food Drive", "date": "6/28/2025", "read": False, "id": 3 },
    ]



class Notification(Resource):
    @jwt_required()
    def get(self):
        userEmail = get_jwt_identity()

        if not userEmail:
            return 400
        
        # Database query would go here

        return notifications, 200
    
    @jwt_required()
    def post(self):
        data = request.get_json()

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
            return {"error": "'date' must be a string in MM/DD/YYYY format"}, 400
        if not isinstance(data["read"], bool):
            return {"error": "'read' must be a boolean"}, 400

        # Assign new ID and append
        curId = len(notifications)
        data["id"] = curId
        notifications.append(data)

        return {"Msg": "Success"}, 201
    
    @jwt_required()
    def delete(self):
        # Extract notificationId from url parameters
        notiId = request.args.get('notiId')

        # Validate notiId
        if not notiId:
            return {"error": "Missing notiId parameter"}, 400
        if not notiId.isdigit():
            return {"error": "notiId must be a number"}, 400

        # Remove notificaion from the array,
        # to simulate database interactions 
        for i in range (0, len(notifications)):
            if (notifications[i]["id"] == int(notiId)):
                removeIndex = i 
                notifications.pop(removeIndex)
                break
    
        return {"Msg": "Data deleted"}, 200
    
    @jwt_required()
    def patch(self):
        notiId = request.args.get('notiId')
        data = request.get_json()


        # Validate notiId
        if not notiId:
            return {"error": "Missing notiId parameter"}, 400
        if not notiId.isdigit():
            return {"error": "notiId must be a number"}, 400
        

        notiId = int(notiId)

        # notiId out of bounds
        if notiId>= len(notifications):
            return {"error": "Notification dpes not exist"}, 404


        # Validate request body
        if not data or "read" not in data:
            return {"error": "'read' field is required"}, 400
        if not isinstance(data["read"], bool):
            return {"error": "'read' must be a boolean"}, 400
        # Simulate DB update
        for i, noti in enumerate(notifications):
            if noti["id"] == notiId:
                notifications[i]["read"] = data["read"]
                print(notifications[i]["read"])
                return {"Msg": "Success"}, 200
