from flask_restful import Resource
from datetime import datetime
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .db import get_db
from decimal import Decimal


def convert_decimal(obj):
    if isinstance(obj, list):
        return [convert_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj


class AdminDashboard(Resource):
    @jwt_required()
    def get(self):
        """
        Get admin dashboard data summary.
        """

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) AS total FROM userprofile")
        total_volunteers = cursor.fetchone()['total']

        active_volunteers = total_volunteers

        cursor.execute(
            "SELECT COUNT(*) AS upcoming FROM eventdetails WHERE event_status IN ('Pending', 'Finalized')"
        )
        upcoming_events = cursor.fetchone()['upcoming']

        cursor.execute(
            "SELECT COUNT(*) AS completed FROM eventdetails WHERE event_status = 'Completed'"
        )
        completed_events = cursor.fetchone()['completed']

        cursor.execute("SELECT COUNT(*) AS total_events FROM eventdetails")
        total_events = cursor.fetchone()['total_events']

        total_volunteer_hours = 0  # Placeholder
        average_rating = 0.0       # Placeholder

        cursor.execute(
            """
            SELECT COUNT(*) AS new_vols FROM UserCredentials 
            WHERE role = 'volunteer' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            """
        )
        monthly_new_volunteers = cursor.fetchone()['new_vols']

        cursor.execute(
            """
            SELECT COUNT(*) AS event_participation FROM volunteerhistory vh
            JOIN eventdetails ed ON vh.event_id = ed.event_id
            WHERE ed.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            """
        )
        monthly_event_participation = cursor.fetchone()['event_participation']

        cursor.close()
        conn.close()

        overview_data = {
            "admin_info": {
                "name": "Admin Manager",
                "email": "admin@volunteerportal.com",
                "role": "Administrator",
                "notifications": 5,
                "last_login": "2025-07-18T09:00:00Z"
            },
            "statistics": {
                "totalVolunteers": total_volunteers,
                "activeVolunteers": active_volunteers,
                "upcomingEvents": upcoming_events,
                "eventsToFinalize": 5,  # Placeholder
                "totalEvents": total_events,
                "completedEvents": completed_events,
                "totalVolunteerHours": total_volunteer_hours,
                "averageRating": average_rating,
                "monthlyNewVolunteers": monthly_new_volunteers,
                "monthlyEventParticipation": monthly_event_participation
            },
            "top_volunteers": [],      # Optional: implement fetching top volunteers
            "upcoming_events": [],     # Optional: implement fetching upcoming events
            "recent_activities": []    # Optional: implement fetching recent activities
        }

        return overview_data, 200


class AdminVolunteers(Resource):
    @jwt_required()
    def get(self):
        """
        Fetch all volunteers with their name, email, events attended, rating, total hours, expertise.
        Supports sorting and filtering.
        """
        sort_by = request.args.get('sort_by', 'events')  # 'events', 'rating', 'hours', 'name'
        order = request.args.get('order', 'desc')        # 'asc' or 'desc'
        limit = request.args.get('limit', type=int)

        conn = get_db()
        cursor = conn.cursor()

        query = """
            SELECT
                up.volunteer_id AS id,
                up.full_name AS name,
                uc.email,
                COUNT(vh.event_id) AS events_attended,
                ROUND(AVG(ed.event_duration) / 2, 1) AS rating,
                COALESCE(SUM(ed.event_duration), 0) AS total_hours,
                GROUP_CONCAT(DISTINCT s.skill_name SEPARATOR ', ') AS expertise
            FROM userprofile up
            JOIN UserCredentials uc ON up.volunteer_id = uc.user_id
            LEFT JOIN volunteerhistory vh ON up.volunteer_id = vh.volunteer_id
            LEFT JOIN eventdetails ed ON vh.event_id = ed.event_id
            LEFT JOIN volunteer_skills vs ON up.volunteer_id = vs.volunteer_id
            LEFT JOIN skills s ON vs.skill_id = s.skills_id
            GROUP BY up.volunteer_id, up.full_name, uc.email
        """

        cursor.execute(query)
        volunteers = cursor.fetchall()

        # Fix None values for sorting
        for vol in volunteers:
            vol['events_attended'] = vol['events_attended'] or 0
            vol['rating'] = vol['rating'] or 0.0
            vol['total_hours'] = vol['total_hours'] or 0

        reverse_order = (order == 'desc')

        def sort_key(vol):
            if sort_by == 'events':
                return vol['events_attended']
            elif sort_by == 'rating':
                return vol['rating']
            elif sort_by == 'hours':
                return vol['total_hours']
            elif sort_by == 'name':
                return vol['name'].lower()
            else:
                return vol['events_attended']

        volunteers.sort(key=sort_key, reverse=reverse_order)

        if limit:
            volunteers = volunteers[:limit]

        cursor.close()
        conn.close()

        return convert_decimal({
            "volunteers": volunteers,
            "total": len(volunteers),
            "filtered_count": len(volunteers),
            "sort_by": sort_by,
            "order": order
        }), 200


class AdminEvents(Resource):
    @jwt_required()
    def get(self):
        """Get all events with optional filtering"""
        status_filter = request.args.get('status', 'all')  # 'upcoming', 'completed', 'all'
        limit = request.args.get('limit', type=int)

        conn = get_db()
        cursor = conn.cursor()

        query = "SELECT * FROM eventdetails"
        params = []

        if status_filter == 'upcoming':
            query += " WHERE event_status IN ('Pending', 'Finalized')"
        elif status_filter == 'completed':
            query += " WHERE event_status = 'Completed'"

        query += " ORDER BY date DESC"

        if limit:
            query += " LIMIT %s"
            params.append(limit)

        cursor.execute(query, params)
        events = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "events": convert_decimal(events),
            "total": len(events),
            "filtered_count": len(events)
        }, 200


class AdminStatistics(Resource):
    @jwt_required()
    def get(self):
        """Get detailed statistics for admin dashboard"""
        conn = get_db()
        cursor = conn.cursor()

        # Example: fetch some statistics (similar to AdminDashboard)
        cursor.execute("SELECT COUNT(*) AS total FROM userprofile")
        total_volunteers = cursor.fetchone()['total']

        cursor.execute(
            "SELECT COUNT(*) AS upcoming FROM eventdetails WHERE event_status IN ('Pending', 'Finalized')"
        )
        upcoming_events = cursor.fetchone()['upcoming']

        cursor.execute(
            "SELECT COUNT(*) AS completed FROM eventdetails WHERE event_status = 'Completed'"
        )
        completed_events = cursor.fetchone()['completed']

        cursor.close()
        conn.close()

        statistics = {
            "totalVolunteers": total_volunteers,
            "upcomingEvents": upcoming_events,
            "completedEvents": completed_events,
            # Add more statistics as needed
        }

        recent_activities = []  # Placeholder for notifications or recent actions

        return {
            "statistics": statistics,
            "recent_activities": recent_activities
        }, 200


class AdminVolunteerDetail(Resource):
    @jwt_required()
    def get(self, volunteer_id):
        """Get detailed information about a specific volunteer"""
        conn = get_db()
        cursor = conn.cursor()

        query = """
            SELECT
                up.volunteer_id AS id,
                up.full_name AS name,
                uc.email,
                COUNT(vh.event_id) AS events_attended,
                ROUND(AVG(ed.event_duration) / 2, 1) AS rating,
                COALESCE(SUM(ed.event_duration), 0) AS total_hours,
                GROUP_CONCAT(DISTINCT s.skill_name SEPARATOR ', ') AS expertise
            FROM userprofile up
            JOIN UserCredentials uc ON up.volunteer_id = uc.user_id
            LEFT JOIN volunteerhistory vh ON up.volunteer_id = vh.volunteer_id
            LEFT JOIN eventdetails ed ON vh.event_id = ed.event_id
            LEFT JOIN volunteer_skills vs ON up.volunteer_id = vs.volunteer_id
            LEFT JOIN skills s ON vs.skill_id = s.skills_id
            WHERE up.volunteer_id = %s
            GROUP BY up.volunteer_id, up.full_name, uc.email
        """

        cursor.execute(query, (volunteer_id,))
        volunteer = cursor.fetchone()

        cursor.close()
        conn.close()

        if not volunteer:
            return {"error": "Volunteer not found"}, 404

        volunteer = convert_decimal(volunteer)

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
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM eventdetails WHERE event_id = %s", (event_id,))
        event = cursor.fetchone()

        cursor.close()
        conn.close()

        if not event:
            return {"error": "Event not found"}, 404

        event = convert_decimal(event)

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
