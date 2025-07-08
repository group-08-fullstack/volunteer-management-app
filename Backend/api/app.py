from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api

  

# Import api functions here, to be added
from notification import Notification

  

app = Flask(__name__)

# Allow for outside sources to make requests(In this case this is the React Front end)
CORS(app)

# setup flask_restful
api = Api(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

# Section to add api endpoints to app
api.add_resource(Notification, '/api/notification/')