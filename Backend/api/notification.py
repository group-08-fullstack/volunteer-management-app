from flask_restful import Resource,reqparse
from flask import request

notifications = [
    { "message": "Edit profile Reminder", "date": "7/10/2025", "read": False, "id": 0 },
    { "message": "New Event assigned", "date": "6/29/2025", "read": False, "id": 1 },
    { "message": "Event updated", "date": "6/28/2025", "read": False, "id": 2 },
    { "message": "Welcome!", "date": "6/28/2025", "read": False, "id": 3 },
]


class Notification(Resource):
    def get(self):

        # Database query would go here

        return notifications, 200

    def post(self):
        # Extract receiverId from url parameters
        receiverId = request.args.get('receiverId')
        # Receive the data from the post
        data = request.get_json()

        # Increment id and assign to new notification
        curId = len(notifications) + 1
        data["id"] = curId

        # Add the new notification to the array and print receiverId,
        # to simulate database interactions
        print(receiverId)
        notifications.append(data)
         
        return {"Msg" : "Success"}, 201

    def delete(self):
        # Extract notificationId from url parameters
        notiId = request.args.get('notiId')

        # Remove notificaion from the array,
        # to simulate database interactions 
        for i in range (0, len(notifications)):
            if (notifications[i]["id"] == int(notiId)):
                removeIndex = i 
                notifications.pop(removeIndex)
                break
        

        return {"Msg": "Data deleted"}, 202
    
    def patch(self):
        # Extract notificationId from url parameters
        notiId = request.args.get('notiId')
        data = request.get_json()

        # Change the notificaion read status,
        # simulate database interactions 
        for i in range (0, len(notifications)):
            if (notifications[i]["id"] == int(notiId)):
                changeIndex = i 
                notifications[changeIndex]["read"] = data["read"]
                print(notifications[changeIndex]["read"])
                break


        return {"Msg" : "Success"}, 200