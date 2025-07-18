from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api
from datetime import timedelta

import os
from dotenv import load_dotenv

from flask_jwt_extended import JWTManager

# Load in env
basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, '.env')
load_dotenv(dotenv_path)

# Import api functions here, to be added
from . import notification
from . import volunteerHistory
from . import auth
from . import matching
from . import eventlist
from . import profileForm
  

app = Flask(__name__)

# Allow for outside sources to make requests(In this case this is the React Front end)
CORS(app)

# setup flask_restful
api = Api(app)

# Setup JWT authentication
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY") # Grab enviroment variable
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
jwt = JWTManager(app)
 
# Section to add api endpoints to app
api.add_resource(notification.Notification, '/api/notification/')
api.add_resource(volunteerHistory.VolHistory, "/api/history/")
api.add_resource(auth.Register, '/api/auth/register/')
api.add_resource(auth.Login, '/api/auth/login/')
api.add_resource(auth.RefreshToken,'/api/auth/refresh/')
api.add_resource(matching.MatchVolunteer, "/api/matching/match/")
api.add_resource(eventlist.EventList, '/api/eventlist/')
api.add_resource(eventlist.Event, '/api/eventlist/<int:event_id>')
api.add_resource(profileForm.Profile, '/api/profile/')
