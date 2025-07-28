from flask_restful import Resource
from datetime import datetime
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import db

class EventHistory(Resource):
    @jwt_required()
    def get(self):
        """Get event history for the current user"""
        user_email = get_jwt_identity()
        
        # Establish database connection
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # 1. Get the user_id from UserCredentials table using email
            cursor.execute(
                "SELECT user_id, role FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']
            user_role = user_result['role']
            
            if user_role == 'admin':
                # Admin sees all event history
                cursor.execute("""
                    SELECT 
                        eh.history_id,
                        eh.event_id,
                        eh.volunteer_id,
                        eh.participation_date,
                        eh.hours_worked,
                        eh.status,
                        eh.created_at,
                        ed.event_name,
                        ed.event_location,
                        ed.event_description,
                        ed.event_date,
                        ed.urgency,
                        ed.event_duration,
                        ed.created_at as event_created_at,
                        up.full_name as volunteer_name
                    FROM event_history eh
                    LEFT JOIN eventdetails ed ON eh.event_id = ed.event_id
                    LEFT JOIN userprofile up ON eh.volunteer_id = up.volunteer_id
                    ORDER BY eh.participation_date DESC, eh.created_at DESC
                """)
            else:
                # Volunteer sees only their own history
                cursor.execute("""
                    SELECT 
                        eh.history_id,
                        eh.event_id,
                        eh.volunteer_id,
                        eh.participation_date,
                        eh.hours_worked,
                        eh.status,
                        eh.created_at,
                        ed.event_name,
                        ed.event_location,
                        ed.event_description,
                        ed.event_date,
                        ed.urgency,
                        ed.event_duration,
                        ed.created_at as event_created_at
                    FROM event_history eh
                    LEFT JOIN eventdetails ed ON eh.event_id = ed.event_id
                    WHERE eh.volunteer_id = %s
                    ORDER BY eh.participation_date DESC, eh.created_at DESC
                """, (user_id,))
            
            history_records = cursor.fetchall()
            
            # Format the response
            formatted_history = []
            for record in history_records:
                # Get required skills for this event
                cursor.execute("""
                    SELECT skill_name 
                    FROM required_skills 
                    WHERE event_id = %s
                """, (record['event_id'],))
                
                skills_result = cursor.fetchall()
                required_skills = [skill['skill_name'] for skill in skills_result] if skills_result else []
                
                history_item = {
                    "id": record['history_id'],
                    "eventId": record['event_id'],
                    "volunteerId": record['volunteer_id'],
                    "eventName": record['event_name'] or "Unknown Event",
                    "location": record['event_location'] or "Unknown Location",
                    "description": record['event_description'] or "",
                    "eventDate": record['event_date'].strftime('%Y-%m-%d') if record['event_date'] else None,
                    "participationDate": record['participation_date'].strftime('%Y-%m-%d') if record['participation_date'] else None,
                    "hoursWorked": float(record['hours_worked']) if record['hours_worked'] else 0,
                    "status": record['status'] or "completed",
                    "urgency": record['urgency'] or "Medium",
                    "duration": record['event_duration'] or "2 hours",
                    "requiredSkills": required_skills,
                    "createdAt": record['created_at'].isoformat() + "Z" if record['created_at'] else None,
                    "eventCreatedAt": record['event_created_at'].isoformat() + "Z" if record['event_created_at'] else None
                }
                
                # Add volunteer name for admin view
                if user_role == 'admin' and 'volunteer_name' in record:
                    history_item["volunteerName"] = record['volunteer_name'] or "Unknown Volunteer"
                
                formatted_history.append(history_item)
            
            return {
                "history": formatted_history,
                "userRole": user_role
            }, 200
            
        except Exception as e:
            print(f"Database error getting event history: {e}")
            return {"error": "Failed to retrieve event history"}, 500
            
        finally:
            cursor.close()
            conn.close()
    
    @jwt_required()
    def post(self):
        """Create a new event history record (Admin only)"""
        user_email = get_jwt_identity()
        data = request.get_json()
        
        # Establish database connection
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
            required_fields = ["eventId", "volunteerId", "participationDate", "hoursWorked"]
            for field in required_fields:
                if field not in data:
                    return {"error": f"Missing required field: {field}"}, 400
            
            # Insert new event history record
            cursor.execute("""
                INSERT INTO event_history 
                (event_id, volunteer_id, participation_date, hours_worked, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                data['eventId'],
                data['volunteerId'],
                data['participationDate'],
                data['hoursWorked'],
                data.get('status', 'completed'),
                datetime.now()
            ))
            
            conn.commit()
            
            return {"message": "Event history record created successfully"}, 201
            
        except Exception as e:
            conn.rollback()
            print(f"Database error creating event history: {e}")
            return {"error": "Failed to create event history record"}, 500
            
        finally:
            cursor.close()
            conn.close()

class EventHistoryDetail(Resource):
    @jwt_required()
    def get(self, history_id):
        """Get specific event history record"""
        user_email = get_jwt_identity()
        
        # Establish database connection
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # Get user info
            cursor.execute(
                "SELECT user_id, role FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']
            user_role = user_result['role']
            
            # Build query based on user role
            if user_role == 'admin':
                # Admin can see any record
                cursor.execute("""
                    SELECT 
                        eh.history_id,
                        eh.event_id,
                        eh.volunteer_id,
                        eh.participation_date,
                        eh.hours_worked,
                        eh.status,
                        eh.created_at,
                        ed.event_name,
                        ed.event_location,
                        ed.event_description,
                        ed.event_date,
                        ed.urgency,
                        ed.event_duration,
                        ed.created_at as event_created_at,
                        up.full_name as volunteer_name
                    FROM event_history eh
                    LEFT JOIN eventdetails ed ON eh.event_id = ed.event_id
                    LEFT JOIN userprofile up ON eh.volunteer_id = up.volunteer_id
                    WHERE eh.history_id = %s
                """, (history_id,))
            else:
                # Volunteer can only see their own records
                cursor.execute("""
                    SELECT 
                        eh.history_id,
                        eh.event_id,
                        eh.volunteer_id,
                        eh.participation_date,
                        eh.hours_worked,
                        eh.status,
                        eh.created_at,
                        ed.event_name,
                        ed.event_location,
                        ed.event_description,
                        ed.event_date,
                        ed.urgency,
                        ed.event_duration,
                        ed.created_at as event_created_at
                    FROM event_history eh
                    LEFT JOIN eventdetails ed ON eh.event_id = ed.event_id
                    WHERE eh.history_id = %s AND eh.volunteer_id = %s
                """, (history_id, user_id))
            
            record = cursor.fetchone()
            
            if not record:
                return {"error": "Event history record not found"}, 404
            
            # Get required skills for this event
            cursor.execute("""
                SELECT skill_name 
                FROM required_skills 
                WHERE event_id = %s
            """, (record['event_id'],))
            
            skills_result = cursor.fetchall()
            required_skills = [skill['skill_name'] for skill in skills_result] if skills_result else []
            
            # Format response
            history_detail = {
                "id": record['history_id'],
                "eventId": record['event_id'],
                "volunteerId": record['volunteer_id'],
                "eventName": record['event_name'] or "Unknown Event",
                "location": record['event_location'] or "Unknown Location",
                "description": record['event_description'] or "",
                "eventDate": record['event_date'].strftime('%Y-%m-%d') if record['event_date'] else None,
                "participationDate": record['participation_date'].strftime('%Y-%m-%d') if record['participation_date'] else None,
                "hoursWorked": float(record['hours_worked']) if record['hours_worked'] else 0,
                "status": record['status'] or "completed",
                "urgency": record['urgency'] or "Medium",
                "duration": record['event_duration'] or "2 hours",
                "requiredSkills": required_skills,
                "createdAt": record['created_at'].isoformat() + "Z" if record['created_at'] else None,
                "eventCreatedAt": record['event_created_at'].isoformat() + "Z" if record['event_created_at'] else None
            }
            
            # Add volunteer name for admin view
            if user_role == 'admin' and 'volunteer_name' in record:
                history_detail["volunteerName"] = record['volunteer_name'] or "Unknown Volunteer"
            
            return history_detail, 200
            
        except Exception as e:
            print(f"Database error getting event history detail: {e}")
            return {"error": "Failed to retrieve event history record"}, 500
            
        finally:
            cursor.close()
            conn.close()
    
    @jwt_required()
    def put(self, history_id):
        """Update event history record (Admin only)"""
        user_email = get_jwt_identity()
        data = request.get_json()
        
        # Establish database connection
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
            
            # Check if record exists
            cursor.execute("SELECT history_id FROM event_history WHERE history_id = %s", (history_id,))
            if not cursor.fetchone():
                return {"error": "Event history record not found"}, 404
            
            # Update the record
            cursor.execute("""
                UPDATE event_history 
                SET participation_date = %s, hours_worked = %s, status = %s
                WHERE history_id = %s
            """, (
                data.get('participationDate'),
                data.get('hoursWorked'),
                data.get('status', 'completed'),
                history_id
            ))
            
            conn.commit()
            
            return {"message": "Event history record updated successfully"}, 200
            
        except Exception as e:
            conn.rollback()
            print(f"Database error updating event history: {e}")
            return {"error": "Failed to update event history record"}, 500
            
        finally:
            cursor.close()
            conn.close()
    
    @jwt_required()
    def delete(self, history_id):
        """Delete event history record (Admin only)"""
        user_email = get_jwt_identity()
        
        # Establish database connection
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
            
            # Check if record exists
            cursor.execute("SELECT history_id FROM event_history WHERE history_id = %s", (history_id,))
            if not cursor.fetchone():
                return {"error": "Event history record not found"}, 404
            
            # Delete the record
            cursor.execute("DELETE FROM event_history WHERE history_id = %s", (history_id,))
            
            conn.commit()
            
            return {"message": "Event history record deleted successfully"}, 200
            
        except Exception as e:
            conn.rollback()
            print(f"Database error deleting event history: {e}")
            return {"error": "Failed to delete event history record"}, 500
            
        finally:
            cursor.close()
            conn.close()