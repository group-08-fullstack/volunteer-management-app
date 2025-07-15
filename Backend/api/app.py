from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api
from datetime import timedelta

import os
from dotenv import load_dotenv

from flask_jwt_extended import JWTManager

# Load in env
load_dotenv()

# Import api functions here, to be added
from notification import Notification
from volunteerHistory import VolHistory
from auth import Register, Login,RefreshToken
from matching import MatchVolunteer
  

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
api.add_resource(Notification, '/api/notification/')
api.add_resource(VolHistory, "/api/history/")
api.add_resource(Register, '/api/auth/register/')
api.add_resource(Login, '/api/auth/login/')
api.add_resource(RefreshToken,'/api/auth/refresh/')
api.add_resource(MatchVolunteer, "/api/matching/match/")
