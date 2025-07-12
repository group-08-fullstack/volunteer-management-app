from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api


# Import api functions here, to be added
from notification import Notification
from volunteerHistory import VolHistory
from auth import Register, Login
  

app = Flask(__name__)

# Allow for outside sources to make requests(In this case this is the React Front end)
CORS(app)

# setup flask_restful
api = Api(app)
 
# Section to add api endpoints to app
api.add_resource(Notification, '/api/notification/')
api.add_resource(VolHistory, "/api/history/")
api.add_resource(Register, '/api/auth/register')
api.add_resource(Login, '/api/auth/login')