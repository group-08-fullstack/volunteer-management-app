from flask_restful import Resource
from datetime import datetime
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

# Sample volunteer dashboard data
volunteer_dashboard_data = {
    "volunteer_info": {
        "name": "Sarah Johnson",
        "email": "sarah.johnson@email.com",
        "member_since": "2024-03-15",
        "total_hours": 24,
        "events_completed": 7,
        "upcoming_events": 3,
        "skills": ["Community Outreach", "Event Planning", "Public Speaking"],
        "preferred_activities": ["Community Service", "Environmental", "Youth Programs"]
    },
    
    "volunteer_history": [
        {
            "id": 1,
            "event": "Community Food Drive",
            "date": "2025-03-15",
            "hours": 4,
            "location": "Downtown Community Center",
            "description": "Helped organize and distribute food to families in need",
            "coordinator": "Lisa Park",
            "status": "Completed",
            "rating": 4.8
        },
        {
            "id": 2,
            "event": "Beach Cleanup",
            "date": "2025-03-08",
            "hours": 3,
            "location": "Sunset Beach",
            "description": "Participated in environmental cleanup effort along the coastline",
            "coordinator": "Michael Chen",
            "status": "Completed",
            "rating": 4.7
        },
        {
            "id": 3,
            "event": "Animal Shelter Help",
            "date": "2025-02-28",
            "hours": 5,
            "location": "Happy Paws Shelter",
            "description": "Assisted with animal care, feeding, and socialization",
            "coordinator": "Emily Rodriguez",
            "status": "Completed",
            "rating": 4.9
        },
        {
            "id": 4,
            "event": "Senior Center Visit",
            "date": "2025-02-20",
            "hours": 3,
            "location": "Golden Years Senior Center",
            "description": "Spent time with elderly residents, organized activities",
            "coordinator": "David Thompson",
            "status": "Completed",
            "rating": 4.6
        },
        {
            "id": 5,
            "event": "Youth Mentoring Program",
            "date": "2025-02-15",
            "hours": 4,
            "location": "Community Youth Center",
            "description": "Mentored local teenagers in academic and life skills",
            "coordinator": "Sarah Johnson",
            "status": "Completed",
            "rating": 4.8
        },
        {
            "id": 6,
            "event": "Park Restoration",
            "date": "2025-02-10",
            "hours": 5,
            "location": "Riverside Park",
            "description": "Planted trees, cleaned trails, and maintained park facilities",
            "coordinator": "Michael Chen",
            "status": "Completed",
            "rating": 4.7
        }
    ],
    
    "upcoming_events": [
        {
            "id": 1,
            "event": "Senior Center Visit",
            "date": "2025-07-25",
            "time": "14:00:00",
            "endTime": "17:00:00",
            "location": "Golden Years Senior Center",
            "address": "123 Elder Lane, Springfield",
            "volunteers": 8,
            "maxVolunteers": 12,
            "description": "Visit and spend time with seniors, organize activities and provide companionship",
        },
        {
            "id": 2,
            "event": "Park Restoration",
            "date": "2025-08-01",
            "time": "09:00:00",
            "endTime": "13:00:00",
            "location": "Riverside Park",
            "address": "456 River Road, Springfield",
            "volunteers": 15,
            "maxVolunteers": 20,
            "description": "Help restore the local park by planting trees, cleaning trails, and maintaining facilities",
            "coordinator": "Michael Chen",
        },
        {
            "id": 3,
            "event": "Youth Mentoring",
            "date": "2025-07-30",
            "time": "16:00:00",
            "endTime": "18:00:00",
            "location": "Community Youth Center",
            "address": "789 Youth Street, Springfield",
            "volunteers": 5,
            "maxVolunteers": 8,
            "description": "Mentor local youth in academic subjects and life skills",
            "coordinator": "Emily Rodriguez",
        },
        {
            "id": 4,
            "event": "Food Bank Distribution",
            "date": "2025-08-05",
            "time": "10:00:00",
            "endTime": "14:00:00",
            "location": "Community Food Bank",
            "address": "321 Helper Avenue, Springfield",
            "volunteers": 12,
            "maxVolunteers": 15,
            "description": "Sort and distribute food to families in need",
            "coordinator": "Lisa Park",
        },
        {
            "id": 5,
            "event": "Environmental Education Workshop",
            "date": "2025-08-10",
            "time": "10:00:00",
            "endTime": "15:00:00",
            "location": "Nature Center",
            "address": "555 Green Way, Springfield",
            "volunteers": 6,
            "maxVolunteers": 10,
            "description": "Educate children about environmental conservation and sustainability",
            "coordinator": "Michael Chen",
        }
    ],
    
    "achievements": [
        {
            "id": 1,
            "title": "Community Champion",
            "description": "Completed 5 community service events",
            "date_earned": "2025-03-01",
            "icon": "🏆"
        },
        {
            "id": 2,
            "title": "Time Warrior",
            "description": "Volunteered over 20 hours",
            "date_earned": "2025-03-10",
            "icon": "⏰"
        },
        {
            "id": 3,
            "title": "Team Player",
            "description": "Participated in team-based volunteer activities",
            "date_earned": "2025-02-25",
            "icon": "🤝"
        }
    ],
    
    "recommendations": [
        {
            "id": 1,
            "event": "Environmental Education Workshop",
            "match_score": 95,
            "reason": "Matches your environmental interests and teaching skills"
        },
        {
            "id": 2,
            "event": "Community Garden Project",
            "match_score": 88,
            "reason": "Perfect for your gardening skills and community focus"
        },
        {
            "id": 3,
            "event": "Youth Sports Coaching",
            "match_score": 82,
            "reason": "Great match for your youth mentoring experience"
        }
    ]
}


class VolunteerDashboard(Resource):
    @jwt_required()
    def get(self):
        """Get volunteer dashboard overview data"""
        current_user_id = get_jwt_identity()
        
        # In a real app, you'd fetch user-specific data:
        # volunteer_info = get_volunteer_by_user_id(current_user_id)
        # volunteer_history = get_volunteer_history(current_user_id)
        # upcoming_events = get_user_upcoming_events(current_user_id)
        
        # For now, return sample data
        overview_data = {
            "volunteer_info": volunteer_dashboard_data["volunteer_info"],
            "recent_history": volunteer_dashboard_data["volunteer_history"][:3],  # Last 3 events
            "upcoming_events": volunteer_dashboard_data["upcoming_events"][:3],   # Next 3 events
            "achievements": volunteer_dashboard_data["achievements"],
            "statistics": {
                "total_hours": volunteer_dashboard_data["volunteer_info"]["total_hours"],
                "events_completed": volunteer_dashboard_data["volunteer_info"]["events_completed"],
                "upcoming_events": volunteer_dashboard_data["volunteer_info"]["upcoming_events"]
            }
        }
        
        return overview_data, 200


class VolunteerHistory(Resource):
    @jwt_required()
    def get(self):
        """Get complete volunteer history with optional filtering"""
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        limit = request.args.get('limit', type=int)
        status = request.args.get('status', 'all')  # 'completed', 'upcoming', 'all'
        
        history = volunteer_dashboard_data["volunteer_history"].copy()
        
        # Filter by status if specified
        if status != 'all':
            history = [h for h in history if h["status"].lower() == status.lower()]
        
        # Limit results if specified
        if limit:
            history = history[:limit]
        
        return {
            "history": history,
            "total": len(volunteer_dashboard_data["volunteer_history"]),
            "filtered_count": len(history)
        }, 200


class VolunteerUpcomingEvents(Resource):
    @jwt_required()
    def get(self):
        """Get upcoming events available for registration"""
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        limit = request.args.get('limit', type=int)
        status = request.args.get('status', 'all')  # 'available', 'registered', 'all'
        
        events = volunteer_dashboard_data["upcoming_events"].copy()
        
        # Filter by registration status if specified
        if status != 'all':
            events = [e for e in events if e["registration_status"].lower() == status.lower()]
        
        # Limit results if specified
        if limit:
            events = events[:limit]
        
        return {
            "events": events,
            "total": len(volunteer_dashboard_data["upcoming_events"]),
            "filtered_count": len(events)
        }, 200


class VolunteerProfile(Resource):
    @jwt_required()
    def get(self):
        """Get detailed volunteer profile information"""
        current_user_id = get_jwt_identity()
        
        return {
            "volunteer_info": volunteer_dashboard_data["volunteer_info"],
            "achievements": volunteer_dashboard_data["achievements"],
            "recommendations": volunteer_dashboard_data["recommendations"],
            "statistics": {
                "total_hours": sum(h["hours"] for h in volunteer_dashboard_data["volunteer_history"]),
                "events_completed": len(volunteer_dashboard_data["volunteer_history"]),
                "average_rating": sum(h["rating"] for h in volunteer_dashboard_data["volunteer_history"]) / len(volunteer_dashboard_data["volunteer_history"]),
                "upcoming_events": len([e for e in volunteer_dashboard_data["upcoming_events"] if e["registration_status"] == "Registered"])
            }
        }, 200


class VolunteerEventDetail(Resource):
    @jwt_required()
    def get(self, event_id):
        """Get detailed information about a specific event"""
        current_user_id = get_jwt_identity()
        
        # Search in both upcoming events and history
        event = None
        
        # Check upcoming events
        for e in volunteer_dashboard_data["upcoming_events"]:
            if e["id"] == event_id:
                event = e
                break
        
        # Check history if not found in upcoming
        if not event:
            for h in volunteer_dashboard_data["volunteer_history"]:
                if h["id"] == event_id:
                    event = h
                    break
        
        if not event:
            return {"error": "Event not found"}, 404
        
        return event, 200


class VolunteerEventRegistration(Resource):
    @jwt_required()
    def post(self, event_id):
        """Register for an upcoming event"""
        current_user_id = get_jwt_identity()
        
        # Find the event
        event = next((e for e in volunteer_dashboard_data["upcoming_events"] if e["id"] == event_id), None)
        
        if not event:
            return {"error": "Event not found"}, 404
        
        if event["registration_status"] == "Registered":
            return {"error": "Already registered for this event"}, 400
        
        if event["volunteers"] >= event["maxVolunteers"]:
            return {"error": "Event is full"}, 400
        
        # Update registration status
        event["registration_status"] = "Registered"
        event["registration_date"] = datetime.utcnow().isoformat() + "Z"
        event["volunteers"] += 1
        
        return {"message": "Successfully registered for event", "event": event}, 200
    
    @jwt_required()
    def delete(self, event_id):
        """Unregister from an upcoming event"""
        current_user_id = get_jwt_identity()
        
        # Find the event
        event = next((e for e in volunteer_dashboard_data["upcoming_events"] if e["id"] == event_id), None)
        
        if not event:
            return {"error": "Event not found"}, 404
        
        if event["registration_status"] != "Registered":
            return {"error": "Not registered for this event"}, 400
        
        # Update registration status
        event["registration_status"] = "Available"
        event["registration_date"] = None
        event["volunteers"] -= 1
        
        return {"message": "Successfully unregistered from event"}, 200

