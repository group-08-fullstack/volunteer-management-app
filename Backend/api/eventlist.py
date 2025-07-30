from flask_restful import Resource, reqparse
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from . import db

# Event parser for POST/PUT requests - matching your complete database schema
event_parser = reqparse.RequestParser()
event_parser.add_argument('event_name', type=str, required=True, help="Event name is required")
event_parser.add_argument('required_skills', type=str, required=True, help="Required skills are required")
event_parser.add_argument('address', type=str, required=False, help="Address is optional")
event_parser.add_argument('state', type=str, required=True, help="State is required")
event_parser.add_argument('city', type=str, required=True, help="City is required")
event_parser.add_argument('zipcode', type=str, required=True, help="Zipcode is required")
event_parser.add_argument('urgency', type=str, required=True, help="Urgency is required")
event_parser.add_argument('location_name', type=str, required=True, help="Location name is required")
event_parser.add_argument('event_duration', type=int, required=True, help="Event duration is required")
event_parser.add_argument('event_description', type=str, required=True, help="Event description is required")
event_parser.add_argument('date', type=str, required=True, help="Date is required")
event_parser.add_argument('volunteers_needed', type=int, required=True, help="Volunteers needed is required")

class EventList(Resource):
    @jwt_required()
    def get(self):
        """Get all events from the eventdetails table"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            # Query using your exact database column names
            cursor.execute('''
                SELECT 
                    event_id,
                    event_name, 
                    required_skills, 
                    address,
                    state, 
                    city, 
                    zipcode, 
                    urgency, 
                    location_name, 
                    event_duration, 
                    event_description, 
                    date,
                    created_at,
                    event_status,
                    volunteers_needed
                FROM eventdetails 
                ORDER BY date ASC
            ''')
            rows = cursor.fetchall()

            events = []
            for row in rows:
                # Handle date formatting
                event_date = row['date']
                if hasattr(event_date, 'strftime'):
                    event_date = event_date.strftime('%Y-%m-%d')
                elif isinstance(event_date, str):
                    event_date = event_date
                else:
                    event_date = str(event_date)

                # Handle created_at formatting
                created_at = row['created_at']
                if hasattr(created_at, 'strftime'):
                    created_at = created_at.strftime('%Y-%m-%d %H:%M:%S')
                elif isinstance(created_at, str):
                    created_at = created_at
                else:
                    created_at = str(created_at)

                # Handle required_skills (convert comma-separated string to array)
                required_skills = []
                if row['required_skills']:
                    required_skills = [skill.strip() for skill in row['required_skills'].split(',')]

                event = {
                    "id": row['event_id'],
                    "event_name": row['event_name'],
                    "required_skills": required_skills,
                    "address": row['address'] or "",
                    "state": row['state'],
                    "city": row['city'],
                    "zipcode": row['zipcode'],
                    "urgency": row['urgency'],
                    "location_name": row['location_name'],
                    "event_duration": row['event_duration'],
                    "event_description": row['event_description'],
                    "date": event_date,
                    "created_at": created_at,
                    "event_status": row['event_status'],
                    "volunteers_needed": row['volunteers_needed']
                }
                events.append(event)

            return {"events": events, "total": len(events)}, 200

        except Exception as e:
            print(f"Database error getting events: {e}")
            return {"error": "Failed to retrieve events", "details": str(e)}, 500
        finally:
            cursor.close()
            conn.close()

    @jwt_required()
    def post(self):
        """Create a new event in the eventdetails table"""
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            data = event_parser.parse_args()
            print(f"Received event data: {data}")
            
            # Validate date format
            try:
                event_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
            except ValueError:
                return {"error": "Date must be in YYYY-MM-DD format"}, 400

            # Validate numeric fields
            if data["event_duration"] <= 0:
                return {"error": "Event duration must be a positive number"}, 400

            if data["volunteers_needed"] <= 0:
                return {"error": "Volunteers needed must be a positive number"}, 400

            # Validate urgency matches your ENUM values
            valid_urgency_levels = ['Low', 'Medium', 'High']
            if data["urgency"] not in valid_urgency_levels:
                return {"error": f"Urgency must be one of: {', '.join(valid_urgency_levels)}"}, 400

            # Insert event into database using your exact column names and structure
            event_query = """
                INSERT INTO eventdetails (
                    event_name, 
                    required_skills, 
                    address,
                    state, 
                    city, 
                    zipcode, 
                    urgency, 
                    location_name, 
                    event_duration, 
                    event_description, 
                    date,
                    event_status,
                    volunteers_needed
                ) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """

            event_values = (
                data["event_name"],
                data["required_skills"],  # Already a comma-separated string from frontend
                data.get("address", ""),  # Optional field
                data["state"],
                data["city"],
                data["zipcode"],
                data["urgency"],
                data["location_name"],
                data["event_duration"],
                data["event_description"],
                event_date,
                'pending',  # Default status from your ENUM
                data["volunteers_needed"]
            )

            print(f"Executing query with values: {event_values}")
            cursor.execute(event_query, event_values)
            event_id = cursor.lastrowid
            conn.commit()

            print(f"Event created successfully with ID: {event_id}")

            return {
                "message": "Event created successfully!",
                "event_id": event_id
            }, 201

        except Exception as e:
            conn.rollback()
            print(f"Database error creating event: {e}")
            return {"error": f"Failed to create event: {str(e)}"}, 500
        finally:
            cursor.close()
            conn.close()


class Event(Resource):
    @jwt_required()
    def get(self, event_id):
        """Get a specific event by ID"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                SELECT 
                    event_id,
                    event_name, 
                    required_skills, 
                    address,
                    state, 
                    city, 
                    zipcode, 
                    urgency, 
                    location_name, 
                    event_duration, 
                    event_description, 
                    date,
                    created_at,
                    event_status,
                    volunteers_needed
                FROM eventdetails 
                WHERE event_id = %s
            ''', (event_id,))
            
            row = cursor.fetchone()
            
            if not row:
                return {"error": "Event not found"}, 404

            # Handle date formatting
            event_date = row['date']
            if hasattr(event_date, 'strftime'):
                event_date = event_date.strftime('%Y-%m-%d')
            elif isinstance(event_date, str):
                event_date = event_date
            else:
                event_date = str(event_date)

            # Handle created_at formatting
            created_at = row['created_at']
            if hasattr(created_at, 'strftime'):
                created_at = created_at.strftime('%Y-%m-%d %H:%M:%S')
            elif isinstance(created_at, str):
                created_at = created_at
            else:
                created_at = str(created_at)

            # Handle required_skills (convert comma-separated string to array)
            required_skills = []
            if row['required_skills']:
                required_skills = [skill.strip() for skill in row['required_skills'].split(',')]

            event = {
                "id": row['event_id'],
                "event_name": row['event_name'],
                "required_skills": required_skills,
                "address": row['address'] or "",
                "state": row['state'],
                "city": row['city'],
                "zipcode": row['zipcode'],
                "urgency": row['urgency'],
                "location_name": row['location_name'],
                "event_duration": row['event_duration'],
                "event_description": row['event_description'],
                "date": event_date,
                "created_at": created_at,
                "event_status": row['event_status'],
                "volunteers_needed": row['volunteers_needed']
            }

            return event, 200

        except Exception as e:
            print(f"Database error getting event {event_id}: {e}")
            return {"error": "Failed to retrieve event"}, 500
        finally:
            cursor.close()
            conn.close()

    @jwt_required()
    def put(self, event_id):
        """Update a specific event"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            data = event_parser.parse_args()
            
            # Check if event exists
            cursor.execute("SELECT event_id FROM eventdetails WHERE event_id = %s", (event_id,))
            if not cursor.fetchone():
                return {"error": "Event not found"}, 404

            # Validate date format
            try:
                event_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
            except ValueError:
                return {"error": "Date must be in YYYY-MM-DD format"}, 400

            # Validate numeric fields
            if data["event_duration"] <= 0:
                return {"error": "Event duration must be a positive number"}, 400

            if data["volunteers_needed"] <= 0:
                return {"error": "Volunteers needed must be a positive number"}, 400

            # Validate urgency
            valid_urgency_levels = ['Low', 'Medium', 'High']
            if data["urgency"] not in valid_urgency_levels:
                return {"error": f"Urgency must be one of: {', '.join(valid_urgency_levels)}"}, 400

            # Update event using your exact column names
            update_query = """
                UPDATE eventdetails SET
                    event_name = %s,
                    required_skills = %s,
                    address = %s,
                    state = %s,
                    city = %s,
                    zipcode = %s,
                    urgency = %s,
                    location_name = %s,
                    event_duration = %s,
                    event_description = %s,
                    date = %s,
                    volunteers_needed = %s
                WHERE event_id = %s
            """

            update_values = (
                data["event_name"],
                data["required_skills"],  # Already a comma-separated string from frontend
                data.get("address", ""),
                data["state"],
                data["city"],
                data["zipcode"],
                data["urgency"],
                data["location_name"],
                data["event_duration"],
                data["event_description"],
                event_date,
                data["volunteers_needed"],
                event_id
            )

            cursor.execute(update_query, update_values)
            conn.commit()

            return {"message": "Event updated successfully!"}, 200

        except Exception as e:
            conn.rollback()
            print(f"Database error updating event {event_id}: {e}")
            return {"error": f"Failed to update event: {str(e)}"}, 500
        finally:
            cursor.close()
            conn.close()

    @jwt_required()
    def delete(self, event_id):
        """Delete a specific event"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            # Check if event exists
            cursor.execute("SELECT event_id FROM eventdetails WHERE event_id = %s", (event_id,))
            if not cursor.fetchone():
                return {"error": "Event not found"}, 404

            # Delete related records first if you have foreign key constraints
            # For example, if you have volunteer registrations for events:
            # cursor.execute("DELETE FROM event_registrations WHERE event_id = %s", (event_id,))

            # Delete the event
            cursor.execute("DELETE FROM eventdetails WHERE event_id = %s", (event_id,))
            conn.commit()

            return {"message": f"Event {event_id} deleted successfully."}, 200

        except Exception as e:
            conn.rollback()
            print(f"Database error deleting event {event_id}: {e}")
            return {"error": f"Failed to delete event: {str(e)}"}, 500
        finally:
            cursor.close()
            conn.close()


class EventStatistics(Resource):
    @jwt_required()
    def get(self):
        """Get event statistics for admin dashboard"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            # Get total events
            cursor.execute("SELECT COUNT(*) as total FROM eventdetails")
            total_events = cursor.fetchone()['total']

            # Get events by urgency
            cursor.execute("""
                SELECT urgency, COUNT(*) as count 
                FROM eventdetails 
                GROUP BY urgency
            """)
            urgency_stats = cursor.fetchall()

            # Get upcoming events (future dates)
            cursor.execute("""
                SELECT COUNT(*) as upcoming 
                FROM eventdetails 
                WHERE date >= CURDATE()
            """)
            upcoming_events = cursor.fetchone()['upcoming']

            # Get events by status
            cursor.execute("""
                SELECT event_status, COUNT(*) as count 
                FROM eventdetails 
                GROUP BY event_status
            """)
            status_stats = cursor.fetchall()

            # Get events by state (top 5)
            cursor.execute("""
                SELECT state, COUNT(*) as count 
                FROM eventdetails 
                GROUP BY state 
                ORDER BY count DESC 
                LIMIT 5
            """)
            state_stats = cursor.fetchall()

            # Get recent events (last 30 days)
            cursor.execute("""
                SELECT COUNT(*) as recent 
                FROM eventdetails 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            """)
            recent_events = cursor.fetchone()['recent']

            # Get total volunteers needed
            cursor.execute("""
                SELECT SUM(volunteers_needed) as total_volunteers_needed 
                FROM eventdetails 
                WHERE date >= CURDATE()
            """)
            total_volunteers_needed = cursor.fetchone()['total_volunteers_needed'] or 0

            return {
                "total_events": total_events,
                "upcoming_events": upcoming_events,
                "recent_events": recent_events,
                "total_volunteers_needed": total_volunteers_needed,
                "urgency_breakdown": urgency_stats,
                "status_breakdown": status_stats,
                "top_states": state_stats
            }, 200

        except Exception as e:
            print(f"Database error getting event statistics: {e}")
            return {"error": "Failed to retrieve event statistics"}, 500
        finally:
            cursor.close()
            conn.close()


class EventsByStatus(Resource):
    @jwt_required()
    def get(self, status):
        """Get events filtered by status"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            # Validate status
            valid_statuses = ['pending', 'finalized']
            if status not in valid_statuses:
                return {"error": f"Status must be one of: {', '.join(valid_statuses)}"}, 400

            cursor.execute('''
                SELECT 
                    event_id,
                    event_name, 
                    required_skills, 
                    address,
                    state, 
                    city, 
                    zipcode, 
                    urgency, 
                    location_name, 
                    event_duration, 
                    event_description, 
                    date,
                    created_at,
                    event_status,
                    volunteers_needed
                FROM eventdetails 
                WHERE event_status = %s
                ORDER BY date ASC
            ''', (status,))
            
            rows = cursor.fetchall()

            events = []
            for row in rows:
                # Handle date formatting
                event_date = row['date']
                if hasattr(event_date, 'strftime'):
                    event_date = event_date.strftime('%Y-%m-%d')
                elif isinstance(event_date, str):
                    event_date = event_date
                else:
                    event_date = str(event_date)

                # Handle created_at formatting
                created_at = row['created_at']
                if hasattr(created_at, 'strftime'):
                    created_at = created_at.strftime('%Y-%m-%d %H:%M:%S')
                elif isinstance(created_at, str):
                    created_at = created_at
                else:
                    created_at = str(created_at)

                # Handle required_skills
                required_skills = []
                if row['required_skills']:
                    required_skills = [skill.strip() for skill in row['required_skills'].split(',')]

                event = {
                    "id": row['event_id'],
                    "event_name": row['event_name'],
                    "required_skills": required_skills,
                    "address": row['address'] or "",
                    "state": row['state'],
                    "city": row['city'],
                    "zipcode": row['zipcode'],
                    "urgency": row['urgency'],
                    "location_name": row['location_name'],
                    "event_duration": row['event_duration'],
                    "event_description": row['event_description'],
                    "date": event_date,
                    "created_at": created_at,
                    "event_status": row['event_status'],
                    "volunteers_needed": row['volunteers_needed']
                }
                events.append(event)

            return {"events": events, "total": len(events), "status": status}, 200

        except Exception as e:
            print(f"Database error getting events by status {status}: {e}")
            return {"error": "Failed to retrieve events by status"}, 500
        finally:
            cursor.close()
            conn.close()


class EventStatus(Resource):
    @jwt_required()
    def put(self, event_id):
        """Update event status (e.g., from pending to finalized)"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            data = request.get_json()
            new_status = data.get('status')

            # Validate status
            valid_statuses = ['pending', 'finalized']
            if new_status not in valid_statuses:
                return {"error": f"Status must be one of: {', '.join(valid_statuses)}"}, 400

            # Check if event exists
            cursor.execute("SELECT event_id FROM eventdetails WHERE event_id = %s", (event_id,))
            if not cursor.fetchone():
                return {"error": "Event not found"}, 404

            # Update event status
            cursor.execute(
                "UPDATE eventdetails SET event_status = %s WHERE event_id = %s",
                (new_status, event_id)
            )
            conn.commit()

            return {"message": f"Event status updated to {new_status}"}, 200

        except Exception as e:
            conn.rollback()
            print(f"Database error updating event status {event_id}: {e}")
            return {"error": f"Failed to update event status: {str(e)}"}, 500
        finally:
            cursor.close()
            conn.close()
