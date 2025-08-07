# eventreport.py
# Event Reports API using Flask-RESTful

from flask_restful import Resource, reqparse
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from decimal import Decimal
from . import db

def safe_convert_numeric(value):
    """Convert Decimal or other numeric types to proper Python types for JSON serialization"""
    if isinstance(value, Decimal):
        return float(value)
    elif value is None:
        return None
    else:
        return value

class CompletedEventsAPI(Resource):
    @jwt_required()
    def get(self):
        """Get all completed events for reporting with volunteer details"""
        user_email = get_jwt_identity()
        
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # Check if user is admin
            cursor.execute(
                "SELECT user_id, role FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result or user_result['role'] != 'admin':
                return {"error": "Admin access required"}, 403
            
            print(f"Getting completed events for user: {user_email}")
            
            # First, get all completed events
            cursor.execute("""
                SELECT 
                    e.event_id,
                    e.event_name,
                    e.date,
                    e.location_name,
                    e.city,
                    e.state,
                    e.zipcode,
                    e.urgency,
                    e.event_duration,
                    e.volunteers_needed,
                    e.event_description,
                    e.required_skills,
                    e.address,
                    e.event_status,
                    e.created_at,
                    COUNT(vh.volunteer_id) as volunteers_registered,
                    SUM(CASE WHEN vh.participation_status = 'Volunteered' THEN 1 ELSE 0 END) as volunteers_attended,
                    AVG(CASE WHEN vh.performance > 0 THEN vh.performance ELSE NULL END) as avg_rating
                FROM eventdetails e
                LEFT JOIN volunteerhistory vh ON e.event_id = vh.event_id
                WHERE e.event_status = 'Completed'
                GROUP BY e.event_id, e.event_name, e.date, e.location_name, e.city, e.state, 
                         e.zipcode, e.urgency, e.event_duration, e.volunteers_needed, 
                         e.event_description, e.required_skills, e.address, e.event_status, e.created_at
                ORDER BY e.date DESC
            """)
            
            events_data = cursor.fetchall()
            print(f"Found {len(events_data)} completed events")
            
            # Process the events data
            events = []
            for event in events_data:
                # Handle date conversion
                event_date = None
                if event['date']:
                    event_date = event['date'].strftime('%Y-%m-%d') if hasattr(event['date'], 'strftime') else str(event['date'])
                
                # Handle created_at conversion
                created_at = None
                if event.get('created_at'):
                    created_at = event['created_at'].strftime('%Y-%m-%d %H:%M:%S') if hasattr(event['created_at'], 'strftime') else str(event['created_at'])
                
                # Handle required_skills
                required_skills = []
                if event['required_skills']:
                    if isinstance(event['required_skills'], str):
                        required_skills = [skill.strip() for skill in event['required_skills'].split(',')]
                    else:
                        required_skills = event['required_skills']
                
                # Get volunteers for this specific event
                cursor.execute("""
                    SELECT 
                        vh.volunteer_id,
                        vh.participation_status,
                        vh.performance,
                        vh.notes,
                        up.full_name,
                        uc.email,
                        up.city as volunteer_city,
                        up.state_name as volunteer_state
                    FROM volunteerhistory vh
                    JOIN userprofile up ON vh.volunteer_id = up.volunteer_id
                    JOIN usercredentials uc ON vh.volunteer_id = uc.user_id
                    WHERE vh.event_id = %s
                    ORDER BY up.full_name
                """, (event['event_id'],))
                
                volunteers_data = cursor.fetchall()
                volunteers = []
                
                for volunteer in volunteers_data:
                    volunteers.append({
                        "volunteer_id": volunteer['volunteer_id'],
                        "name": volunteer['full_name'],
                        "email": volunteer['email'],
                        "city": volunteer['volunteer_city'],
                        "state": volunteer['volunteer_state'],
                        "participation_status": volunteer['participation_status'],
                        "performance": safe_convert_numeric(volunteer['performance']),
                        "notes": volunteer['notes'] or ""
                    })
                
                # Ensure numeric fields are properly converted
                volunteers_registered = safe_convert_numeric(event['volunteers_registered']) or 0
                volunteers_attended = safe_convert_numeric(event['volunteers_attended']) or 0
                avg_rating = safe_convert_numeric(event['avg_rating'])
                avg_rating = round(float(avg_rating), 1) if avg_rating else 0
                volunteers_needed = safe_convert_numeric(event['volunteers_needed']) or 0
                
                # Calculate rates
                registration_rate = 0
                if volunteers_needed > 0:
                    registration_rate = round((volunteers_registered / volunteers_needed) * 100, 1)
                
                attendance_rate = 0
                if volunteers_registered > 0:
                    attendance_rate = round((volunteers_attended / volunteers_registered) * 100, 1)
                
                events.append({
                    "id": event['event_id'],
                    "event_name": event['event_name'],
                    "date": event_date,
                    "location_name": event['location_name'],
                    "city": event['city'],
                    "state": event['state'],
                    "zipcode": event['zipcode'],
                    "urgency": event['urgency'],
                    "event_duration": safe_convert_numeric(event['event_duration']),
                    "volunteers_needed": volunteers_needed,
                    "event_description": event['event_description'],
                    "required_skills": required_skills,
                    "address": event['address'],
                    "event_status": event['event_status'],
                    "created_at": created_at,
                    "volunteers_registered": volunteers_registered,
                    "volunteers_attended": volunteers_attended,
                    "avg_rating": avg_rating,
                    "registration_rate": registration_rate,
                    "attendance_rate": attendance_rate,
                    "volunteers": volunteers  # Added volunteer details
                })
            
            return {
                'success': True,
                'events': events,
                'total_events': len(events)
            }, 200
            
        except Exception as e:
            print(f"Error in get_completed_events: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }, 500
        finally:
            cursor.close()
            conn.close()

class EventStatisticsAPI(Resource):
    @jwt_required()
    def get(self):
        """Get overall statistics for reporting dashboard"""
        user_email = get_jwt_identity()
        
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # Check if user is admin
            cursor.execute(
                "SELECT user_id, role FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result or user_result['role'] != 'admin':
                return {"error": "Admin access required"}, 403
            
            print(f"Getting event statistics for user: {user_email}")
            
            # Total completed events
            cursor.execute("SELECT COUNT(*) as total FROM eventdetails WHERE event_status = 'Completed'")
            total_events_result = cursor.fetchone()
            total_events = safe_convert_numeric(total_events_result['total']) or 0
            
            # Total volunteers who participated
            cursor.execute("""
                SELECT COUNT(DISTINCT vh.volunteer_id) as total
                FROM volunteerhistory vh 
                JOIN eventdetails e ON vh.event_id = e.event_id 
                WHERE e.event_status = 'Completed'
            """)
            total_volunteers_result = cursor.fetchone()
            total_volunteers = safe_convert_numeric(total_volunteers_result['total']) or 0
            
            # Average performance rating
            cursor.execute("""
                SELECT AVG(vh.performance) as avg_perf
                FROM volunteerhistory vh 
                JOIN eventdetails e ON vh.event_id = e.event_id 
                WHERE e.event_status = 'Completed' 
                AND vh.performance > 0
            """)
            avg_performance_result = cursor.fetchone()
            avg_performance = safe_convert_numeric(avg_performance_result['avg_perf'])
            avg_performance = round(float(avg_performance), 1) if avg_performance else 0
            
            # Events by urgency
            cursor.execute("""
                SELECT urgency, COUNT(*) as count
                FROM eventdetails 
                WHERE event_status = 'Completed'
                GROUP BY urgency
            """)
            urgency_data = cursor.fetchall()
            events_by_urgency = {}
            for row in urgency_data:
                events_by_urgency[row['urgency']] = safe_convert_numeric(row['count'])
            
            # Events by month (last 12 months)
            cursor.execute("""
                SELECT 
                    DATE_FORMAT(date, '%Y-%m') as month,
                    COUNT(*) as count
                FROM eventdetails 
                WHERE event_status = 'Completed' 
                AND date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(date, '%Y-%m')
                ORDER BY month
            """)
            monthly_data = cursor.fetchall()
            events_by_month = {}
            for row in monthly_data:
                events_by_month[row['month']] = safe_convert_numeric(row['count'])
            
            statistics = {
                'total_events': total_events,
                'total_volunteers': total_volunteers,
                'avg_performance': avg_performance,
                'events_by_urgency': events_by_urgency,
                'events_by_month': events_by_month
            }
            
            print(f"Statistics: {statistics}")
            
            return {
                'success': True,
                'statistics': statistics
            }, 200
            
        except Exception as e:
            print(f"Error in get_event_statistics: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }, 500
        finally:
            cursor.close()
            conn.close()

class VolunteerPerformanceAPI(Resource):
    @jwt_required()
    def get(self):
        """Get detailed volunteer performance data for reporting"""
        user_email = get_jwt_identity()
        
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # Check if user is admin
            cursor.execute(
                "SELECT user_id, role FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result or user_result['role'] != 'admin':
                return {"error": "Admin access required"}, 403
            
            print(f"Getting volunteer performance report for user: {user_email}")
            
            # Get detailed volunteer performance data
            cursor.execute("""
                SELECT 
                    up.volunteer_id,
                    up.full_name,
                    uc.email,
                    up.skills,
                    COUNT(vh.event_id) as total_events,
                    SUM(CASE WHEN vh.participation_status = 'Volunteered' THEN 1 ELSE 0 END) as events_attended,
                    SUM(CASE WHEN vh.participation_status = 'Did Not Show' THEN 1 ELSE 0 END) as events_missed,
                    AVG(CASE WHEN vh.performance > 0 THEN vh.performance ELSE NULL END) as avg_rating,
                    MAX(e.date) as last_event_date,
                    GROUP_CONCAT(DISTINCT e.event_name ORDER BY e.date DESC LIMIT 3) as recent_events
                FROM userprofile up
                JOIN usercredentials uc ON up.volunteer_id = uc.user_id
                JOIN volunteerhistory vh ON up.volunteer_id = vh.volunteer_id
                JOIN eventdetails e ON vh.event_id = e.event_id
                WHERE e.event_status = 'Completed'
                GROUP BY up.volunteer_id, up.full_name, uc.email, up.skills
                ORDER BY avg_rating DESC, total_events DESC
            """)
            
            volunteers_data = cursor.fetchall()
            
            volunteers = []
            for volunteer in volunteers_data:
                # Calculate attendance rate
                total_events = safe_convert_numeric(volunteer['total_events']) or 0
                events_attended = safe_convert_numeric(volunteer['events_attended']) or 0
                attendance_rate = 0
                if total_events > 0:
                    attendance_rate = round((events_attended / total_events) * 100, 1)
                
                # Format dates
                last_event_date = None
                if volunteer.get('last_event_date'):
                    last_event_date = volunteer['last_event_date'].strftime('%Y-%m-%d') if hasattr(volunteer['last_event_date'], 'strftime') else str(volunteer['last_event_date'])
                
                # Round rating
                avg_rating = safe_convert_numeric(volunteer['avg_rating'])
                avg_rating = round(float(avg_rating), 1) if avg_rating else 0
                
                # Handle skills
                skills = []
                if volunteer['skills']:
                    if isinstance(volunteer['skills'], str):
                        skills = [skill.strip() for skill in volunteer['skills'].split(',')]
                    else:
                        skills = volunteer['skills']
                
                # Handle recent events
                recent_events = []
                if volunteer.get('recent_events'):
                    recent_events = volunteer['recent_events'].split(',')
                
                volunteers.append({
                    "volunteer_id": volunteer['volunteer_id'],
                    "name": volunteer['full_name'],
                    "email": volunteer['email'],
                    "skills": skills,
                    "total_events": total_events,
                    "events_attended": events_attended,
                    "events_missed": safe_convert_numeric(volunteer['events_missed']) or 0,
                    "avg_rating": avg_rating,
                    "attendance_rate": attendance_rate,
                    "last_event_date": last_event_date,
                    "recent_events": recent_events
                })
            
            return {
                'success': True,
                'volunteers': volunteers,
                'total_volunteers': len(volunteers)
            }, 200
            
        except Exception as e:
            print(f"Error in get_volunteer_performance_report: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }, 500
        finally:
            cursor.close()
            conn.close()