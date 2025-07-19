from flask_restful import Resource
from datetime import datetime
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

# Sample data for admin dashboard
admin_data = {
    "admin_info": {
        "name": "Admin Manager",
        "email": "admin@volunteerportal.com",
        "role": "Administrator",
        "notifications": 5,
        "last_login": "2025-07-18T09:00:00Z"
    },
    
    "volunteers": [
        {
            "id": 1,
            "name": "Sarah Johnson",
            "email": "sarah.johnson@email.com",
            "events": 12,
            "rating": 4.7,
            "totalHours": 48,
            "expertise": "Community Outreach",
            "joinDate": "2024-03-15",
            "status": "Active",
            "skills": ["Community Outreach", "Event Planning", "Public Speaking"]
        },
        {
            "id": 2,
            "name": "Michael Chen",
            "email": "michael.chen@email.com",
            "events": 10,
            "rating": 4.8,
            "totalHours": 42,
            "expertise": "Environmental",
            "joinDate": "2024-02-20",
            "status": "Active",
            "skills": ["Environmental Science", "Outdoor Activities", "Education"]
        },
        {
            "id": 3,
            "name": "Emily Rodriguez",
            "email": "emily.rodriguez@email.com",
            "events": 9,
            "rating": 4.9,
            "totalHours": 36,
            "expertise": "Youth Programs",
            "joinDate": "2024-04-10",
            "status": "Active",
            "skills": ["Youth Mentoring", "Education", "Sports Coaching"]
        },
        {
            "id": 4,
            "name": "David Thompson",
            "email": "david.thompson@email.com",
            "events": 8,
            "rating": 4.6,
            "totalHours": 32,
            "expertise": "Senior Care",
            "joinDate": "2024-01-25",
            "status": "Active",
            "skills": ["Senior Care", "Healthcare", "Companionship"]
        },
        {
            "id": 5,
            "name": "Lisa Park",
            "email": "lisa.park@email.com",
            "events": 7,
            "rating": 4.8,
            "totalHours": 28,
            "expertise": "Food Services",
            "joinDate": "2024-05-05",
            "status": "Active",
            "skills": ["Food Preparation", "Kitchen Management", "Nutrition"]
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
            "status": "Open for Registration",
            "coordinator": "Sarah Johnson"
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
            "status": "Open for Registration",
            "coordinator": "Michael Chen"
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
            "status": "Open for Registration",
            "coordinator": "Emily Rodriguez"
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
            "status": "Open for Registration",
            "coordinator": "Lisa Park"
        }
    ],
    
    "statistics": {
        "totalVolunteers": 156,
        "activeVolunteers": 142,
        "upcomingEvents": 8,
        "eventsToFinalize": 5,
        "totalEvents": 45,
        "completedEvents": 32,
        "totalVolunteerHours": 2847,
        "averageRating": 4.7,
        "monthlyNewVolunteers": 23,
        "monthlyEventParticipation": 89
    },
    
    "recent_activities": [
        {
            "id": 1,
            "type": "volunteer_joined",
            "message": "Lisa Park joined the platform",
            "timestamp": "2025-07-18T08:30:00Z",
            "user": "Lisa Park"
        },
        {
            "id": 2,
            "type": "event_created",
            "message": "New event 'Food Bank Distribution' created",
            "timestamp": "2025-07-17T15:45:00Z",
            "user": "Admin Manager"
        },
        {
            "id": 3,
            "type": "volunteer_registered",
            "message": "Michael Chen registered for 'Park Restoration'",
            "timestamp": "2025-07-17T12:20:00Z",
            "user": "Michael Chen"
        }
    ]
}


class AdminDashboard(Resource):
    @jwt_required()
    def get(self):
        """Get admin dashboard overview data"""
        current_user_id = get_jwt_identity()
        
        # You can add role checking here later
        # user_role = get_user_role(current_user_id)
        # if user_role != 'admin':
        #     return {"error": "Unauthorized - Admin access required"}, 403
        
        # Return overview data
        overview_data = {
            "admin_info": admin_data["admin_info"],
            "statistics": admin_data["statistics"],
            "top_volunteers": admin_data["volunteers"][:3],  # Top 3 volunteers
            "upcoming_events": admin_data["upcoming_events"][:3],  # Next 3 events
            "recent_activities": admin_data["recent_activities"][:5]  # Last 5 activities
        }
        
        return overview_data, 200


class AdminVolunteers(Resource):
    @jwt_required()
    def get(self):
        """Get all volunteers with optional sorting and filtering"""
        # Get query parameters
        sort_by = request.args.get('sort_by', 'events')  # 'events', 'rating', 'hours', 'name'
        order = request.args.get('order', 'desc')  # 'asc' or 'desc'
        status_filter = request.args.get('status', 'all')  # 'active', 'inactive', 'all'
        limit = request.args.get('limit', type=int)  # Number of results to return
        
        volunteers = admin_data["volunteers"].copy()
        
        # Filter by status
        if status_filter != 'all':
            volunteers = [v for v in volunteers if v["status"].lower() == status_filter.lower()]
        
        # Sort volunteers
        reverse_order = (order == 'desc')
        
        if sort_by == 'events':
            volunteers.sort(key=lambda x: x["events"], reverse=reverse_order)
        elif sort_by == 'rating':
            volunteers.sort(key=lambda x: x["rating"], reverse=reverse_order)
        elif sort_by == 'hours':
            volunteers.sort(key=lambda x: x["totalHours"], reverse=reverse_order)
        elif sort_by == 'name':
            volunteers.sort(key=lambda x: x["name"], reverse=reverse_order)
        
        # Limit results if specified
        if limit:
            volunteers = volunteers[:limit]
        
        return {
            "volunteers": volunteers,
            "total": len(admin_data["volunteers"]),
            "filtered_count": len(volunteers),
            "sort_by": sort_by,
            "order": order,
            "status_filter": status_filter
        }, 200


class AdminEvents(Resource):
    @jwt_required()
    def get(self):
        """Get all events with optional filtering"""
        # Get query parameters
        status_filter = request.args.get('status', 'all')  # 'upcoming', 'completed', 'all'
        limit = request.args.get('limit', type=int)
        
        events = admin_data["upcoming_events"].copy()
        
        # For now all events are upcoming, but you can add status filtering later
        # if status_filter == 'upcoming':
        #     events = [e for e in events if e["status"] == "Open for Registration"]
        
        # Limit results if specified
        if limit:
            events = events[:limit]
        
        return {
            "events": events,
            "total": len(admin_data["upcoming_events"]),
            "filtered_count": len(events)
        }, 200


class AdminStatistics(Resource):
    @jwt_required()
    def get(self):
        """Get detailed statistics for admin dashboard"""
        return {
            "statistics": admin_data["statistics"],
            "recent_activities": admin_data["recent_activities"]
        }, 200


class AdminVolunteerDetail(Resource):
    @jwt_required()
    def get(self, volunteer_id):
        """Get detailed information about a specific volunteer"""
        volunteer = next((v for v in admin_data["volunteers"] if v["id"] == volunteer_id), None)
        
        if not volunteer:
            return {"error": "Volunteer not found"}, 404
        
        # Add additional details that might not be in the summary
        detailed_volunteer = volunteer.copy()
        detailed_volunteer.update({
            "event_history": [
                {"event_name": "Community Garden Project", "date": "2025-06-15", "hours": 4, "rating": 4.8},
                {"event_name": "Senior Center Visit", "date": "2025-06-10", "hours": 3, "rating": 4.7},
                {"event_name": "Youth Mentoring", "date": "2025-06-05", "hours": 2, "rating": 4.9}
            ],
            "certifications": ["First Aid", "CPR", "Food Safety"],
            "availability": ["Monday", "Wednesday", "Saturday"],
            "emergency_contact": {
                "name": "Emergency Contact Name",
                "phone": "555-0123",
                "relationship": "Spouse"
            }
        })
        
        return detailed_volunteer, 200


class AdminEventDetail(Resource):
    @jwt_required()
    def get(self, event_id):
        """Get detailed information about a specific event"""
        event = next((e for e in admin_data["upcoming_events"] if e["id"] == event_id), None)
        
        if not event:
            return {"error": "Event not found"}, 404
        
        # Add additional details
        detailed_event = event.copy()
        detailed_event.update({
            "registered_volunteers": [
                {"id": 1, "name": "Sarah Johnson", "email": "sarah.johnson@email.com"},
                {"id": 2, "name": "Michael Chen", "email": "michael.chen@email.com"}
            ],
            "required_skills": ["Communication", "Teamwork", "Patience"],
            "equipment_needed": ["Gloves", "Cleaning supplies", "Water bottles"],
            "weather_dependent": True,
            "special_instructions": "Please wear comfortable clothing and closed-toe shoes"
        })
        
        return detailed_event, 200
