from flask_restful import Resource

notifications = [
        { "id" : 1,  "message": "Edit profile Reminder", "date" : "7/10/2025" , "read" : False },
        { "id" : 2, "message" : "New Event assigned", "date" : "6/29/2025", "read" : False },
        { "id" : 3,  "message": "Event updated", "date" : "6/28/2025" , "read" : False },
        { "id" : 4,  "message": "Welcome!", "date" : "6/28/2025" , "read" : False },
]

class Notification(Resource):
    def get(self):

        # Database query would go here

        return notifications, 200

    def post(self):
        return {"Msg": "Data updated"}, 201

    def delete(self):
        return {"Msg": "Data deleted"}, 202

