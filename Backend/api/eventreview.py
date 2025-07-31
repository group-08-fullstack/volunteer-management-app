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

class EventReview(Resource):
    @jwt_required()
    def get(self):
        """Get all finalized events for review (Admin only)"""
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
            
            # Get all finalized events with volunteer counts
            cursor.execute("""
                SELECT 
                    e.event_id,
                    e.event_name,
                    e.date as event_date,
                    e.location_name,
                    e.event_description,
                    e.event_status,
                    COUNT(vh.volunteer_id) as total_volunteers,
                    SUM(CASE WHEN vh.participation_status = 'Registered' THEN 1 ELSE 0 END) as pending_reviews
                FROM eventdetails e
                LEFT JOIN volunteerhistory vh ON e.event_id = vh.event_id
                WHERE e.event_status = 'Finalized'
                GROUP BY e.event_id, e.event_name, e.date, e.location_name, e.event_description, e.event_status
                ORDER BY e.date DESC
            """)
            
            events = cursor.fetchall()
            
            formatted_events = []
            for event in events:
                formatted_events.append({
                    "id": event['event_id'],
                    "eventName": event['event_name'],
                    "eventDate": event['event_date'].strftime('%Y-%m-%d') if event['event_date'] else None,
                    "location": event['location_name'],
                    "description": event['event_description'],
                    "status": event['event_status'],
                    "totalVolunteers": safe_convert_numeric(event['total_volunteers']) or 0,
                    "pendingReviews": safe_convert_numeric(event['pending_reviews']) or 0,
                    "canComplete": (safe_convert_numeric(event['pending_reviews']) or 0) == 0 and (safe_convert_numeric(event['total_volunteers']) or 0) > 0
                })
            
            return {"events": formatted_events}, 200
            
        except Exception as e:
            print(f"Database error getting events for review: {e}")
            return {"error": "Failed to retrieve events for review"}, 500
        finally:
            cursor.close()
            conn.close()

class EventReviewVolunteers(Resource):
    @jwt_required()
    def get(self, event_id):
        """Get all volunteers for a specific finalized event"""
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
            
            # Check if event exists and is finalized
            cursor.execute("""
                SELECT event_name, event_status 
                FROM eventdetails 
                WHERE event_id = %s AND event_status = 'Finalized'
            """, (event_id,))
            
            event = cursor.fetchone()
            if not event:
                return {"error": "Event not found or not finalized"}, 404
            
            # Get all volunteers assigned to this event
            cursor.execute("""
                SELECT 
                    vh.volunteer_id,
                    vh.participation_status,
                    vh.performance,
                    vh.notes,
                    uc.email,
                    up.full_name
                FROM volunteerhistory vh
                JOIN usercredentials uc ON vh.volunteer_id = uc.user_id
                JOIN userprofile up ON vh.volunteer_id = up.volunteer_id
                WHERE vh.event_id = %s
                ORDER BY up.full_name
            """, (event_id,))
            
            volunteers = cursor.fetchall()
            
            formatted_volunteers = []
            for volunteer in volunteers:
                formatted_volunteers.append({
                    "volunteerId": volunteer['volunteer_id'],
                    "email": volunteer['email'],
                    "fullName": volunteer['full_name'],
                    "participationStatus": volunteer['participation_status'],
                    "performance": safe_convert_numeric(volunteer['performance']),
                    "notes": volunteer['notes'] or "",
                    "needsReview": volunteer['participation_status'] == 'Registered'
                })
            
            return {
                "eventName": event['event_name'],
                "volunteers": formatted_volunteers
            }, 200
            
        except Exception as e:
            print(f"Database error getting volunteers for review: {e}")
            return {"error": "Failed to retrieve volunteers for review"}, 500
        finally:
            cursor.close()
            conn.close()

class VolunteerReview(Resource):
    @jwt_required()
    def put(self, event_id, volunteer_id):
        """Submit performance review for a volunteer"""
        user_email = get_jwt_identity()
        data = request.get_json()
        
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
            
            # Validate required fields
            if 'participationStatus' not in data:
                return {"error": "Participation status is required"}, 400
            
            if data['participationStatus'] not in ['Volunteered', 'Did Not Show']:
                return {"error": "Status must be 'Volunteered' or 'Did Not Show'"}, 400
            
            # If status is "Volunteered", performance rating is required
            if data['participationStatus'] == 'Volunteered':
                if 'performance' not in data or not (1 <= data['performance'] <= 5):
                    return {"error": "Performance rating (1-5) is required for volunteers"}, 400
            
            # Check if volunteer is assigned to this event
            cursor.execute("""
                SELECT participation_status 
                FROM volunteerhistory 
                WHERE event_id = %s AND volunteer_id = %s
            """, (event_id, volunteer_id))
            
            assignment = cursor.fetchone()
            if not assignment:
                return {"error": "Volunteer not assigned to this event"}, 404
            
            # Update the volunteer review
            performance = data.get('performance') if data['participationStatus'] == 'Volunteered' else None
            notes = data.get('notes', '')
            
            cursor.execute("""
                UPDATE volunteerhistory 
                SET participation_status = %s, performance = %s, notes = %s
                WHERE event_id = %s AND volunteer_id = %s
            """, (
                data['participationStatus'],
                performance,
                notes,
                event_id,
                volunteer_id
            ))
            
            conn.commit()
            
            return {"message": "Volunteer review submitted successfully"}, 200
            
        except Exception as e:
            conn.rollback()
            print(f"Database error submitting volunteer review: {e}")
            return {"error": "Failed to submit volunteer review"}, 500
        finally:
            cursor.close()
            conn.close()

class CompleteEvent(Resource):
    @jwt_required()
    def put(self, event_id):
        """Mark event as completed (all volunteers must be reviewed first)"""
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
            
            # Check if event exists and is finalized
            cursor.execute("""
                SELECT event_status 
                FROM eventdetails 
                WHERE event_id = %s AND event_status = 'Finalized'
            """, (event_id,))
            
            event = cursor.fetchone()
            if not event:
                return {"error": "Event not found or not finalized"}, 404
            
            # Check if all volunteers have been reviewed
            cursor.execute("""
                SELECT COUNT(*) as pending_count
                FROM volunteerhistory 
                WHERE event_id = %s AND participation_status = 'Registered'
            """, (event_id,))
            
            pending = cursor.fetchone()
            pending_count = safe_convert_numeric(pending['pending_count']) or 0
            
            if pending_count > 0:
                return {"error": "All volunteers must be reviewed before completing the event"}, 400
            
            # Update event status to completed
            cursor.execute("""
                UPDATE eventdetails 
                SET event_status = 'Completed'
                WHERE event_id = %s
            """, (event_id,))
            
            conn.commit()
            
            return {"message": "Event marked as completed successfully"}, 200
            
        except Exception as e:
            conn.rollback()
            print(f"Database error completing event: {e}")
            return {"error": "Failed to complete event"}, 500
        finally:
            cursor.close()
            conn.close()