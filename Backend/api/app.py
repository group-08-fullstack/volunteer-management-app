from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api
from datetime import timedelta
from . import config

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
from . import admin
from . import volunteer
from . import eventreview
from . import eventreport


def create_app(config_class):
    app = Flask(__name__)
    app.config.from_object(config_class) #Load configuration values from a class into the app’s config dictionary

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
    api.add_resource(eventlist.EventList, '/api/eventlist/')
    api.add_resource(eventlist.Event, '/api/eventlist/<int:event_id>')
    api.add_resource(profileForm.Profile, '/api/profile/')
    api.add_resource(profileForm.ProfileSkills, '/api/profile/skills/')   
    api.add_resource(profileForm.ProfileStates, '/api/profile/states/') 
    api.add_resource(auth.DeleteAccount, '/api/auth/delete/')
    api.add_resource(admin.AdminDashboard, '/api/admin/dashboard/')
    api.add_resource(admin.AdminVolunteers, '/api/admin/volunteers/')
    api.add_resource(admin.AdminEvents, '/api/admin/events/')
    api.add_resource(admin.AdminStatistics, '/api/admin/statistics/')
    api.add_resource(admin.AdminVolunteerDetail, '/api/admin/volunteers/<int:volunteer_id>/')
    api.add_resource(admin.AdminEventDetail, '/api/admin/events/<int:event_id>/')
    api.add_resource(volunteer.VolunteerDashboard, '/api/volunteer/dashboard/')
    api.add_resource(volunteer.VolunteerHistory, '/api/volunteer/history/')
    api.add_resource(volunteer.VolunteerUpcomingEvents, '/api/volunteer/events/')
    api.add_resource(volunteer.VolunteerProfile, '/api/volunteer/profile/')
    api.add_resource(volunteer.VolunteerEventDetail, '/api/volunteer/events/<int:event_id>/')
    api.add_resource(volunteer.VolunteerReportCSV, '/api/volunteer/<int:volunteer_id>/report/csv')
    api.add_resource(volunteer.VolunteerReportPDF, '/api/volunteer/<int:volunteer_id>/report/pdf')
    api.add_resource(eventlist.EventStatistics, '/api/eventlist/statistics/')
    api.add_resource(eventlist.EventsByStatus, '/api/eventlist/status/<string:status>')
    api.add_resource(eventlist.EventStatus, '/api/eventlist/<int:event_id>/status/')
    api.add_resource(eventlist.EventStates, '/api/eventlist/states/')
    api.add_resource(eventlist.EventSkills, '/api/eventlist/skills/')
    api.add_resource(eventreview.EventReview, '/api/eventreview/finalized')
    api.add_resource(eventreview.EventReviewVolunteers, '/api/eventreview/<int:event_id>/volunteers')
    api.add_resource(eventreview.VolunteerReview, '/api/eventreview/<int:event_id>/volunteer/<int:volunteer_id>')
    api.add_resource(auth.EmailVerification, '/api/auth/verifyEmail/')
    api.add_resource(auth.EmailCodeConfirmation, '/api/auth/confirmCode/')
    api.add_resource(matching.MatchVolunteer, "/api/matching/match/")
    api.add_resource(matching.VolunteerEventAssignments, "/api/matching/assignments/")
    api.add_resource(matching.FilteredVolunteers, '/api/matching/volunteers/<int:event_id>')
    api.add_resource(matching.FinalizeEvent, '/api/matching/finalize/<int:event_id>')
    api.add_resource(eventreview.CompleteEvent, '/api/eventreview/<int:event_id>/complete')
    api.add_resource(eventreport.CompletedEventsAPI, '/api/events/completed')
    api.add_resource(eventreport.EventStatisticsAPI, '/api/events/statistics')
    api.add_resource(eventreport.VolunteerPerformanceAPI, '/api/events/volunteer-performance')

    return app



app = create_app(config.Config)

if __name__ == '__main__':
    app.run()