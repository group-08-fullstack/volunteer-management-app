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
        conn = get_db()
        cursor = conn.cursor()

        try:
            # Get basic statistics
            cursor.execute("SELECT COUNT(*) AS total FROM userprofile")
            total_volunteers = cursor.fetchone()['total']

            cursor.execute(
                "SELECT COUNT(*) AS upcoming FROM eventdetails WHERE event_status IN ('Pending', 'Finalized') AND date >= CURDATE()"
            )
            upcoming_events = cursor.fetchone()['upcoming']

            cursor.execute(
                "SELECT COUNT(*) AS to_finalize FROM eventdetails WHERE event_status = 'Finalized'"
            )
            events_to_finalize = cursor.fetchone()['to_finalize']

            cursor.execute(
                "SELECT COUNT(*) AS completed FROM eventdetails WHERE event_status = 'Completed'"
            )
            completed_events = cursor.fetchone()['completed']

            cursor.execute("SELECT COUNT(*) AS total_events FROM eventdetails")
            total_events = cursor.fetchone()['total_events']

            # Get top volunteers (only those with performance ratings and who have volunteered)
            cursor.execute("""
                SELECT 
                    up.volunteer_id AS id,
                    up.full_name AS name,
                    COUNT(CASE WHEN vh.participation_status = 'Volunteered' THEN 1 END) AS events,
                    ROUND(AVG(CASE WHEN vh.participation_status = 'Volunteered' AND vh.performance IS NOT NULL 
                               THEN vh.performance END), 1) AS rating,
                    COALESCE(SUM(CASE WHEN vh.participation_status = 'Volunteered' 
                                    THEN ed.event_duration END), 0) AS totalHours,
                    GROUP_CONCAT(DISTINCT s.skill_name ORDER BY s.skill_name SEPARATOR ', ') AS expertise
                FROM userprofile up
                LEFT JOIN volunteerhistory vh ON up.volunteer_id = vh.volunteer_id
                LEFT JOIN eventdetails ed ON vh.event_id = ed.event_id
                LEFT JOIN volunteer_skills vs ON up.volunteer_id = vs.volunteer_id
                LEFT JOIN skills s ON vs.skill_id = s.skills_id
                WHERE vh.participation_status = 'Volunteered' AND vh.performance IS NOT NULL
                GROUP BY up.volunteer_id, up.full_name
                HAVING COUNT(CASE WHEN vh.participation_status = 'Volunteered' THEN 1 END) > 0
                ORDER BY rating DESC, events DESC
                LIMIT 5
            """)
            
            top_volunteers_raw = cursor.fetchall()
            top_volunteers = []
            
            for volunteer in top_volunteers_raw:
                top_volunteers.append({
                    "id": volunteer['id'],
                    "name": volunteer['name'],
                    "events": volunteer['events'] or 0,
                    "rating": float(volunteer['rating']) if volunteer['rating'] else 0.0,
                    "totalHours": volunteer['totalHours'] or 0,
                    "expertise": volunteer['expertise'] or "No skills listed"
                })

            # Get upcoming events (next 3 events that are Pending or Finalized)
            cursor.execute("""
                SELECT 
                    event_id AS id,
                    event_name AS event,
                    date,
                    location_name AS location,
                    event_duration,
                    volunteers_needed AS volunteers,
                    event_status,
                    urgency
                FROM eventdetails 
                WHERE event_status IN ('Pending', 'Finalized') 
                AND date >= CURDATE()
                ORDER BY date ASC, event_id ASC
                LIMIT 5
            """)
            
            upcoming_events_raw = cursor.fetchall()
            upcoming_events_list = []
            
            for event in upcoming_events_raw:
                # Format the date for display
                event_date = event['date']
                if isinstance(event_date, str):
                    event_date_formatted = event_date
                else:
                    event_date_formatted = event_date.strftime('%Y-%m-%d')
                
                # Create time estimates based on duration (since we don't have start/end times)
                duration = event['event_duration'] or 2
                start_time = "09:00:00"  # Default start time
                end_hour = 9 + duration
                end_time = f"{end_hour:02d}:00:00"
                
                upcoming_events_list.append({
                    "id": event['id'],
                    "event": event['event'],
                    "date": event_date_formatted,
                    "time": start_time,
                    "endTime": end_time,
                    "location": event['location'] or "Location TBD",
                    "volunteers": event['volunteers'] or 0,
                    "status": event['event_status'],
                    "urgency": event['urgency']
                })

            # Get monthly stats
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
                AND vh.participation_status = 'Volunteered'
                """
            )
            monthly_event_participation = cursor.fetchone()['event_participation']

            # Calculate total volunteer hours
            cursor.execute(
                """
                SELECT COALESCE(SUM(ed.event_duration), 0) AS total_hours
                FROM volunteerhistory vh
                JOIN eventdetails ed ON vh.event_id = ed.event_id
                WHERE vh.participation_status = 'Volunteered'
                """
            )
            total_volunteer_hours = cursor.fetchone()['total_hours']

            # Calculate average rating
            cursor.execute(
                """
                SELECT ROUND(AVG(vh.performance), 1) AS avg_rating
                FROM volunteerhistory vh
                WHERE vh.participation_status = 'Volunteered' AND vh.performance IS NOT NULL
                """
            )
            avg_rating_result = cursor.fetchone()['avg_rating']
            average_rating = float(avg_rating_result) if avg_rating_result else 0.0

            overview_data = {
                "admin_info": {
                    "name": "Administrator",  # You can customize this
                    "email": get_jwt_identity(),
                    "role": "Administrator",
                    "notifications": 0,
                    "last_login": None
                },
                "statistics": {
                    "totalVolunteers": total_volunteers,
                    "activeVolunteers": total_volunteers,  # Can be refined with activity criteria
                    "upcomingEvents": upcoming_events,
                    "eventsToFinalize": events_to_finalize,
                    "totalEvents": total_events,
                    "completedEvents": completed_events,
                    "totalVolunteerHours": total_volunteer_hours,
                    "averageRating": average_rating,
                    "monthlyNewVolunteers": monthly_new_volunteers,
                    "monthlyEventParticipation": monthly_event_participation
                },
                "top_volunteers": top_volunteers,
                "upcoming_events": upcoming_events_list,
                "recent_activities": []  # Can be implemented later
            }

            return convert_decimal(overview_data), 200

        except Exception as e:
            print(f"Database error in AdminDashboard: {e}")
            return {"error": "Failed to retrieve dashboard data"}, 500
        
        finally:
            cursor.close()
            conn.close()


class AdminVolunteers(Resource):
    @jwt_required()
    def get(self):
        sort_by = request.args.get('sort_by', 'events')
        order = request.args.get('order', 'desc')
        limit = request.args.get('limit', type=int)

        conn = get_db()
        cursor = conn.cursor()

        # Fixed query - separate the skills query to avoid multiplication
        query = """
            SELECT
                up.volunteer_id AS id,
                up.full_name AS name,
                uc.email,
                COUNT(DISTINCT CASE WHEN vh.participation_status = 'Volunteered' THEN vh.event_id END) AS events_attended,
                ROUND(AVG(CASE WHEN vh.participation_status = 'Volunteered' AND vh.performance IS NOT NULL 
                               THEN vh.performance END), 1) AS rating,
                COALESCE(SUM(DISTINCT CASE WHEN vh.participation_status = 'Volunteered' 
                                THEN ed.event_duration END), 0) AS total_hours
            FROM userprofile up
            JOIN UserCredentials uc ON up.volunteer_id = uc.user_id
            LEFT JOIN volunteerhistory vh ON up.volunteer_id = vh.volunteer_id
            LEFT JOIN eventdetails ed ON vh.event_id = ed.event_id
            GROUP BY up.volunteer_id, up.full_name, uc.email
        """
        
        cursor.execute(query)
        volunteers = cursor.fetchall()

        # Get skills separately to avoid JOIN multiplication
        for vol in volunteers:
            cursor.execute("""
                SELECT GROUP_CONCAT(DISTINCT s.skill_name SEPARATOR ', ') AS expertise
                FROM volunteer_skills vs
                JOIN skills s ON vs.skill_id = s.skills_id
                WHERE vs.volunteer_id = %s
            """, (vol['id'],))
            
            skills_result = cursor.fetchone()
            vol['expertise'] = skills_result['expertise'] if skills_result and skills_result['expertise'] else 'No skills listed'

        # Convert and clean up the data
        for vol in volunteers:
            vol['events_attended'] = vol['events_attended'] or 0
            vol['rating'] = float(vol['rating']) if vol['rating'] else 0.0
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
        status_filter = request.args.get('status', 'all')
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
        conn = get_db()
        cursor = conn.cursor()

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
            "completedEvents": completed_events
        }

        return {
            "statistics": statistics,
            "recent_activities": []  # Should be dynamically retrieved
        }, 200


class AdminVolunteerDetail(Resource):
    @jwt_required()
    def get(self, volunteer_id):
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

        # These additional fields should ideally come from the DB
        detailed_volunteer = volunteer.copy()
        detailed_volunteer.update({
            "event_history": [],       # Populate with actual event history if needed
            "certifications": [],
            "availability": [],
            "emergency_contact": {}
        })

        return detailed_volunteer, 200


class AdminEventDetail(Resource):
    @jwt_required()
    def get(self, event_id):
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM eventdetails WHERE event_id = %s", (event_id,))
        event = cursor.fetchone()

        cursor.close()
        conn.close()

        if not event:
            return {"error": "Event not found"}, 404

        event = convert_decimal(event)

        # These should be dynamically pulled if implemented
        detailed_event = event.copy()
        detailed_event.update({
            "registered_volunteers": [],
            "required_skills": [],
            "equipment_needed": [],
            "weather_dependent": False,
            "special_instructions": ""
        })

        return detailed_event, 200
