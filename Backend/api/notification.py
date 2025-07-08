from flask_restful import Resource

notifications = [{"Msg": "Sent", "body": "New Event!", "Date": "7/8/2025"}]

class Notification(Resource):
    def get(self):
        return notifications, 200

    def post(self):
        return {"Msg": "Data updated"}, 201

    def delete(self):
        return {"Msg": "Data deleted"}, 202
