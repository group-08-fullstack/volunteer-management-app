from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from . import db

class MatchVolunteer(Resource):
    
    @jwt_required()
    def get(self):
        """Get only pending events for matching"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            # Get all pending events
            events_query = """
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
                    volunteers_needed,
                    event_status
                FROM eventdetails
                WHERE event_status = 'Pending'
                ORDER BY date ASC
            """
            cursor.execute(events_query)
            event_rows = cursor.fetchall()
            
            print(f"Found {len(event_rows)} pending events")

            events = []
            for event_row in event_rows:
                # Handle date formatting
                event_date = event_row['date']
                if hasattr(event_date, 'strftime'):
                    event_date = event_date.strftime('%Y-%m-%d')
                elif isinstance(event_date, str):
                    event_date = event_date
                else:
                    event_date = str(event_date)

                print(f"Processing event: {event_row['event_name']} (Date: {event_date}, State: {event_row['state']})")

                # Handle required_skills (convert comma-separated string to array)
                required_skills = []
                if event_row['required_skills']:
                    required_skills = [skill.strip() for skill in event_row['required_skills'].split(',')]

                event = {
                    "id": event_row['event_id'],
                    "event_name": event_row['event_name'],
                    "required_skills": required_skills,
                    "address": event_row['address'] or "",
                    "state": event_row['state'],
                    "city": event_row['city'],
                    "zipcode": event_row['zipcode'],
                    "urgency": event_row['urgency'],
                    "location_name": event_row['location_name'],
                    "event_duration": event_row['event_duration'],
                    "event_description": event_row['event_description'],
                    "date": event_date,
                    "volunteers_needed": event_row['volunteers_needed'],
                    "event_status": event_row['event_status']
                }
                events.append(event)

            print(f"Returning {len(events)} events")

            return {
                "events": events
            }, 200

        except Exception as e:
            print(f"Database error getting events for matching: {e}")
            return {"error": "Failed to retrieve events for matching"}, 500
        finally:
            cursor.close()
            conn.close()

    @jwt_required()
    def post(self):
        """Match a volunteer to an event"""
        parser = reqparse.RequestParser()
        parser.add_argument("volunteer_email", required=True, help="Volunteer email is required")
        parser.add_argument("event_name", required=True, help="Event name is required")
        args = parser.parse_args()

        conn = db.get_db()
        cursor = conn.cursor()

        try:
            # Find the volunteer
            cursor.execute("""
                SELECT 
                    uc.user_id,
                    uc.email,
                    up.full_name,
                    up.date_of_birth,
                    up.phone_number,
                    up.city,
                    up.state_name
                FROM usercredentials uc
                JOIN userprofile up ON uc.user_id = up.volunteer_id
                WHERE uc.email = %s AND uc.role = 'volunteer'
            """, (args["volunteer_email"],))
            
            volunteer_row = cursor.fetchone()
            if not volunteer_row:
                return {"message": "Volunteer not found"}, 404

            # Find the event
            cursor.execute("""
                SELECT 
                    event_id,
                    event_name,
                    event_description,
                    date,
                    location_name,
                    urgency,
                    state,
                    event_status
                FROM eventdetails
                WHERE event_name = %s
            """, (args["event_name"],))
            
            event_row = cursor.fetchone()
            if not event_row:
                return {"message": "Event not found"}, 404

            # Check if event is still pending
            if event_row['event_status'] != 'Pending':
                return {"message": "Event is not available for assignment (not pending status)"}, 400

            # Check if volunteer is in the same state as the event
            if volunteer_row['state_name'] != event_row['state']:
                return {"message": f"Volunteer is not in the same state as the event. Volunteer: {volunteer_row['state_name']}, Event: {event_row['state']}"}, 400

            # Check if volunteer is available on the event date
            event_date = event_row['date']
            if hasattr(event_date, 'strftime'):
                event_date_str = event_date.strftime('%Y-%m-%d')
            else:
                event_date_str = str(event_date)

            print(f"Checking availability for volunteer {volunteer_row['user_id']} on date {event_date_str}")

            # Check availability
            cursor.execute("""
                SELECT date_available
                FROM volunteer_availability
                WHERE volunteer_id = %s
            """, (volunteer_row['user_id'],))
            
            all_availability = cursor.fetchall()
            print(f"Volunteer's all availability dates: {[str(av['date_available']) for av in all_availability]}")
            
            # Check if any availability date matches the event date
            availability_match = False
            for avail_row in all_availability:
                avail_date = avail_row['date_available']
                if hasattr(avail_date, 'strftime'):
                    avail_date_str = avail_date.strftime('%Y-%m-%d')
                else:
                    avail_date_str = str(avail_date)
                
                print(f"Comparing: {avail_date_str} == {event_date_str}")
                if avail_date_str == event_date_str:
                    availability_match = True
                    break
            
            if not availability_match:
                return {"message": f"Volunteer is not available on the event date ({event_date_str}). Available dates: {[str(av['date_available']) for av in all_availability]}"}, 400

            # Insert assignment record into volunteerhistory table
            try:
                # Truncate event_name to fit TINYTEXT (255 characters max)
                event_name_truncated = event_row['event_name'][:255] if event_row['event_name'] else ''
                
                print(f"Inserting into volunteerhistory:")
                print(f"  event_id: {event_row['event_id']}")
                print(f"  volunteer_id: {volunteer_row['user_id']}")
                print(f"  email: {volunteer_row['email']}")
                print(f"  event_name: {event_name_truncated}")
                print(f"  participation_status: Using database default (Registered)")
                
                # Insert without participation_status - let database use default value
                cursor.execute("""
                    INSERT INTO volunteerhistory
                    (event_id, volunteer_id, email, event_name)
                    VALUES (%s, %s, %s, %s)
                """, (
                    event_row['event_id'], 
                    volunteer_row['user_id'], 
                    volunteer_row['email'], 
                    event_name_truncated
                ))
                
                conn.commit()
                print(f"Successfully inserted volunteer {volunteer_row['email']} to event {event_name_truncated} in volunteerhistory")
                
            except Exception as assignment_error:
                print(f"Error inserting into volunteerhistory: {assignment_error}")
                import traceback
                traceback.print_exc()
                return {"error": f"Failed to save assignment: {str(assignment_error)}"}, 500

            # Format phone number for response
            phone_number = ""
            if volunteer_row['phone_number']:
                phone_digits = str(volunteer_row['phone_number'])
                if len(phone_digits) == 10:
                    phone_number = f"({phone_digits[:3]}) {phone_digits[3:6]}-{phone_digits[6:]}"
                else:
                    phone_number = phone_digits

            # Format response data
            volunteer_data = {
                "email": volunteer_row['email'],
                "name": volunteer_row['full_name'],
                "fullName": volunteer_row['full_name'],
                "dateOfBirth": volunteer_row['date_of_birth'].strftime('%Y-%m-%d') if volunteer_row['date_of_birth'] else None,
                "phoneNumber": phone_number,
                "city": volunteer_row['city'],
                "state": volunteer_row['state_name']
            }

            event_data = {
                "id": event_row['event_id'],
                "name": event_row['event_name'],
                "event_name": event_row['event_name'],
                "description": event_row['event_description'],
                "date": event_date_str,
                "location": event_row['location_name'],
                "urgency": event_row['urgency']
            }

            return {
                "message": f"{volunteer_data['name']} successfully matched to event {event_data['name']}",
                "volunteer": volunteer_data,
                "event": event_data
            }, 200

        except Exception as e:
            conn.rollback()
            print(f"Database error matching volunteer: {e}")
            return {"error": f"Failed to match volunteer: {str(e)}"}, 500
        finally:
            cursor.close()
            conn.close()


class FilteredVolunteers(Resource):
    
    @jwt_required()
    def get(self, event_id):
        """Get volunteers filtered by event requirements (same state + available on event date)"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            # First get the event details
            cursor.execute("""
                SELECT date, state
                FROM eventdetails 
                WHERE event_id = %s AND event_status = 'Pending'
            """, (event_id,))
            
            event_row = cursor.fetchone()
            if not event_row:
                return {"volunteers": []}, 200
            
            event_date = event_row['date']
            event_state = event_row['state']
            
            # Format event date for comparison
            if hasattr(event_date, 'strftime'):
                event_date_str = event_date.strftime('%Y-%m-%d')
            else:
                event_date_str = str(event_date)

            print(f"Filtering volunteers for event_id {event_id}: state={event_state}, date={event_date_str}")

            # Get volunteers who are in the same state AND available on the event date
            # Also exclude volunteers already assigned to this event
            volunteers_query = """
                SELECT DISTINCT
                    uc.email,
                    up.full_name,
                    up.date_of_birth,
                    up.phone_number,
                    up.address1,
                    up.city,
                    up.state_name,
                    up.zipcode,
                    up.preferences,
                    uc.user_id
                FROM usercredentials uc
                JOIN userprofile up ON uc.user_id = up.volunteer_id
                JOIN volunteer_availability va ON uc.user_id = va.volunteer_id
                WHERE uc.role = 'volunteer'
                AND up.state_name = %s
                AND DATE(va.date_available) = %s
                AND NOT EXISTS (
                    SELECT 1 FROM volunteerhistory vh 
                    WHERE vh.volunteer_id = uc.user_id 
                    AND vh.event_id = %s
                )
                ORDER BY up.full_name
            """
            
            cursor.execute(volunteers_query, (event_state, event_date_str, event_id))
            volunteer_rows = cursor.fetchall()

            print(f"Found {len(volunteer_rows)} available volunteers")

            volunteers = []
            for vol_row in volunteer_rows:
                volunteer_id = vol_row['user_id']

                # Get volunteer skills
                cursor.execute("""
                    SELECT s.skill_name 
                    FROM volunteer_skills vs
                    JOIN skills s ON vs.skill_id = s.skills_id
                    WHERE vs.volunteer_id = %s
                """, (volunteer_id,))
                skill_rows = cursor.fetchall()
                skills = [{'value': skill['skill_name'], 'label': skill['skill_name']} for skill in skill_rows]

                # Get volunteer availability
                cursor.execute("""
                    SELECT date_available
                    FROM volunteer_availability
                    WHERE volunteer_id = %s
                    ORDER BY date_available
                """, (volunteer_id,))
                avail_rows = cursor.fetchall()
                availability = []
                for avail_row in avail_rows:
                    if isinstance(avail_row['date_available'], str):
                        availability.append(avail_row['date_available'])
                    else:
                        availability.append(avail_row['date_available'].strftime('%Y-%m-%d'))

                # Format phone number
                phone_number = ""
                if vol_row['phone_number']:
                    phone_digits = str(vol_row['phone_number'])
                    if len(phone_digits) == 10:
                        phone_number = f"({phone_digits[:3]}) {phone_digits[3:6]}-{phone_digits[6:]}"
                    else:
                        phone_number = phone_digits

                volunteer = {
                    "email": vol_row['email'],
                    "fullName": vol_row['full_name'],
                    "dateOfBirth": vol_row['date_of_birth'].strftime('%Y-%m-%d') if vol_row['date_of_birth'] else None,
                    "phoneNumber": phone_number,
                    "address1": vol_row['address1'],
                    "city": vol_row['city'],
                    "state": vol_row['state_name'],
                    "zipcode": vol_row['zipcode'],
                    "preferences": vol_row['preferences'],
                    "skills": skills,
                    "availability": availability,
                    "user_id": volunteer_id
                }
                volunteers.append(volunteer)

            print(f"Returning {len(volunteers)} filtered volunteers")
            return {"volunteers": volunteers}, 200

        except Exception as e:
            print(f"Database error getting filtered volunteers: {e}")
            return {"error": "Failed to retrieve filtered volunteers"}, 500
        finally:
            cursor.close()
            conn.close()


class VolunteerEventAssignments(Resource):
    """Get all volunteer-event assignments from volunteerhistory table"""
    
    @jwt_required()
    def get(self):
        """Get all volunteer-event assignments from volunteerhistory table"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            # Query the volunteerhistory table
            assignments_query = """
                SELECT 
                    vh.event_id,
                    vh.volunteer_id,
                    vh.email,
                    vh.event_name,
                    vh.participation_status,
                    up.full_name as volunteer_name,
                    ed.date as event_date,
                    ed.location_name,
                    ed.urgency
                FROM volunteerhistory vh
                LEFT JOIN userprofile up ON vh.volunteer_id = up.volunteer_id
                LEFT JOIN eventdetails ed ON vh.event_id = ed.event_id
                ORDER BY vh.event_id DESC
            """
            cursor.execute(assignments_query)
            assignment_rows = cursor.fetchall()

            assignments = []
            for row in assignment_rows:
                assignment = {
                    "event_id": row['event_id'],
                    "volunteer_id": row['volunteer_id'],
                    "volunteer_email": row['email'],
                    "volunteer_name": row['volunteer_name'] or "Unknown",
                    "event_name": row['event_name'],
                    "event_date": row['event_date'].strftime('%Y-%m-%d') if row['event_date'] else None,
                    "location_name": row['location_name'],
                    "urgency": row['urgency'],
                    "participation_status": row['participation_status'] or "Unknown"
                }
                assignments.append(assignment)

            return {
                "assignments": assignments,
                "total": len(assignments)
            }, 200

        except Exception as e:
            print(f"Database error getting assignments from volunteerhistory: {e}")
            return {"error": f"Failed to retrieve assignments: {str(e)}"}, 500
        finally:
            cursor.close()
            conn.close()