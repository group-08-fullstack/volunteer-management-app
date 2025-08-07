from flask_restful import Resource
from datetime import datetime, date
from flask import request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from .db import get_db
from decimal import Decimal
import io
import csv
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter


def convert_decimal(obj):
    if isinstance(obj, list):
        return [convert_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj


class VolunteerDashboard(Resource):
    @jwt_required()
    def get(self):
        """Get volunteer dashboard overview data"""
        user_email = get_jwt_identity()
        
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # Get user_id from email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']
            
            # Get volunteer profile info
            cursor.execute("""
                SELECT full_name, date_of_birth, phone_number, city, state_name
                FROM userprofile 
                WHERE volunteer_id = %s
            """, (user_id,))
            
            profile = cursor.fetchone()
            volunteer_name = profile['full_name'] if profile else "Volunteer"
            
            # Get volunteer statistics
            cursor.execute("""
                SELECT 
                    COUNT(CASE WHEN vh.participation_status = 'Volunteered' THEN 1 END) AS events_completed,
                    COALESCE(SUM(CASE WHEN vh.participation_status = 'Volunteered' 
                                    THEN ed.event_duration END), 0) AS total_hours
                FROM volunteerhistory vh
                LEFT JOIN eventdetails ed ON vh.event_id = ed.event_id
                WHERE vh.volunteer_id = %s
            """, (user_id,))
            
            stats = cursor.fetchone()
            events_completed = stats['events_completed'] or 0
            total_hours = stats['total_hours'] or 0
            
            # Get upcoming events count (registered events)
            cursor.execute("""
                SELECT COUNT(*) AS upcoming_count
                FROM volunteerhistory vh
                JOIN eventdetails ed ON vh.event_id = ed.event_id
                WHERE vh.volunteer_id = %s 
                AND vh.participation_status = 'Registered'
                AND ed.date >= CURDATE()
            """, (user_id,))
            
            upcoming_count = cursor.fetchone()['upcoming_count'] or 0
            
            # Get recent volunteer history (last 3 completed events)
            cursor.execute("""
                SELECT 
                    vh.event_id AS id,
                    ed.event_name AS event,
                    ed.date,
                    ed.event_duration AS hours,
                    ed.location_name AS location,
                    vh.participation_status,
                    vh.performance
                FROM volunteerhistory vh
                JOIN eventdetails ed ON vh.event_id = ed.event_id
                WHERE vh.volunteer_id = %s 
                AND vh.participation_status = 'Volunteered'
                ORDER BY ed.date DESC
                LIMIT 3
            """, (user_id,))
            
            recent_history_raw = cursor.fetchall()
            recent_history = []
            
            for history in recent_history_raw:
                recent_history.append({
                    "id": history['id'],
                    "event": history['event'],
                    "date": history['date'].strftime('%Y-%m-%d') if history['date'] else None,
                    "hours": history['hours'] or 0,
                    "location": history['location'] or "Location TBD",
                    "status": history['participation_status'],
                    "rating": float(history['performance']) if history['performance'] else None
                })
            
            # Get upcoming events (next 3 registered events)
            cursor.execute("""
                SELECT 
                    vh.event_id AS id,
                    ed.event_name AS event,
                    ed.date,
                    ed.event_duration,
                    ed.location_name AS location,
                    ed.volunteers_needed,
                    ed.event_status,
                    vh.participation_status
                FROM volunteerhistory vh
                JOIN eventdetails ed ON vh.event_id = ed.event_id
                WHERE vh.volunteer_id = %s 
                AND vh.participation_status = 'Registered'
                AND ed.date >= CURDATE()
                ORDER BY ed.date ASC
                LIMIT 3
            """, (user_id,))
            
            upcoming_events_raw = cursor.fetchall()
            upcoming_events = []
            
            for event in upcoming_events_raw:
                # Create time estimates based on duration
                duration = event['event_duration'] or 2
                start_time = "09:00:00"
                end_hour = 9 + duration
                end_time = f"{end_hour:02d}:00:00"
                
                upcoming_events.append({
                    "id": event['id'],
                    "event": event['event'],
                    "date": event['date'].strftime('%Y-%m-%d') if event['date'] else None,
                    "time": start_time,
                    "endTime": end_time,
                    "location": event['location'] or "Location TBD",
                    "volunteers": event['volunteers_needed'] or 0,
                    "status": event['event_status']
                })
            
            overview_data = {
                "volunteer_info": {
                    "name": volunteer_name,
                    "email": user_email,
                    "total_hours": total_hours,
                    "events_completed": events_completed,
                    "upcoming_events": upcoming_count
                },
                "recent_history": recent_history,
                "upcoming_events": upcoming_events,
                "statistics": {
                    "total_hours": total_hours,
                    "events_completed": events_completed,
                    "upcoming_events": upcoming_count
                }
            }
            
            return convert_decimal(overview_data), 200
            
        except Exception as e:
            print(f"Database error in VolunteerDashboard: {e}")
            return {"error": "Failed to retrieve dashboard data"}, 500
        
        finally:
            cursor.close()
            conn.close()


class VolunteerHistory(Resource):
    @jwt_required()
    def get(self):
        """Get complete volunteer history with optional filtering"""
        user_email = get_jwt_identity()
        
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # Get user_id from email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']
            
            # Get query parameters
            limit = request.args.get('limit', type=int)
            status = request.args.get('status', 'all')
            
            # Build query based on status filter
            status_condition = ""
            if status == 'completed':
                status_condition = "AND vh.participation_status = 'Volunteered'"
            elif status == 'registered':
                status_condition = "AND vh.participation_status = 'Registered'"
            
            query = f"""
                SELECT 
                    vh.event_id AS id,
                    ed.event_name AS event,
                    ed.date,
                    ed.event_duration AS hours,
                    ed.location_name AS location,
                    ed.event_description AS description,
                    vh.participation_status AS status,
                    vh.performance AS rating,
                    vh.notes
                FROM volunteerhistory vh
                JOIN eventdetails ed ON vh.event_id = ed.event_id
                WHERE vh.volunteer_id = %s {status_condition}
                ORDER BY ed.date DESC
            """
            
            if limit:
                query += f" LIMIT {limit}"
            
            cursor.execute(query, (user_id,))
            history_records = cursor.fetchall()
            
            history = []
            for record in history_records:
                history.append({
                    "id": record['id'],
                    "event": record['event'],
                    "date": record['date'].strftime('%Y-%m-%d') if record['date'] else None,
                    "hours": record['hours'] or 0,
                    "location": record['location'] or "Location TBD",
                    "description": record['description'] or "",
                    "status": record['status'],
                    "rating": float(record['rating']) if record['rating'] else None,
                    "notes": record['notes'] or ""
                })
            
            return convert_decimal({
                "history": history,
                "total": len(history),
                "filtered_count": len(history)
            }), 200
            
        except Exception as e:
            print(f"Database error in VolunteerHistory: {e}")
            return {"error": "Failed to retrieve volunteer history"}, 500
        
        finally:
            cursor.close()
            conn.close()


class VolunteerUpcomingEvents(Resource):
    @jwt_required()
    def get(self):
        """Get upcoming events that the volunteer is registered for"""
        user_email = get_jwt_identity()
        
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # Get user_id from email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']
            
            # Get query parameters
            limit = request.args.get('limit', type=int)
            
            # Get upcoming events that volunteer is registered for
            query = """
                SELECT 
                    ed.event_id AS id,
                    ed.event_name AS event,
                    ed.date,
                    ed.event_duration,
                    ed.location_name AS location,
                    ed.event_description AS description,
                    ed.volunteers_needed,
                    ed.event_status,
                    vh.participation_status
                FROM eventdetails ed
                JOIN volunteerhistory vh ON ed.event_id = vh.event_id
                WHERE vh.volunteer_id = %s
                AND ed.date >= CURDATE() 
                AND vh.participation_status IN ('Registered', 'Volunteered')
                ORDER BY ed.date ASC
            """
            
            if limit:
                query += f" LIMIT {limit}"
            
            cursor.execute(query, (user_id,))
            events_records = cursor.fetchall()
            
            events = []
            for record in events_records:
                # Calculate current volunteer count for this event
                cursor.execute("""
                    SELECT COUNT(*) as current_volunteers
                    FROM volunteerhistory 
                    WHERE event_id = %s AND participation_status IN ('Registered', 'Volunteered')
                """, (record['id'],))
                
                current_vol_count = cursor.fetchone()['current_volunteers'] or 0
                
                # Create time estimates
                duration = record['event_duration'] or 2
                start_time = "09:00:00"
                end_hour = 9 + duration
                end_time = f"{end_hour:02d}:00:00"
                
                events.append({
                    "id": record['id'],
                    "event": record['event'],
                    "date": record['date'].strftime('%Y-%m-%d') if record['date'] else None,
                    "time": start_time,
                    "endTime": end_time,
                    "location": record['location'] or "Location TBD",
                    "description": record['description'] or "",
                    "volunteers": current_vol_count,
                    "maxVolunteers": record['volunteers_needed'] or 0,
                    "event_status": record['event_status'],
                    "participation_status": record['participation_status']
                })
            
            return convert_decimal({
                "events": events,
                "total": len(events),
                "filtered_count": len(events)
            }), 200
            
        except Exception as e:
            print(f"Database error in VolunteerUpcomingEvents: {e}")
            return {"error": "Failed to retrieve upcoming events"}, 500
        
        finally:
            cursor.close()
            conn.close()


class VolunteerProfile(Resource):
    @jwt_required()
    def get(self):
        """Get detailed volunteer profile information"""
        user_email = get_jwt_identity()
        
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # Get user_id from email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']
            
            # Get profile information
            cursor.execute("""
                SELECT full_name, date_of_birth, phone_number, 
                       address1, city, state_name, zipcode, preferences
                FROM userprofile 
                WHERE volunteer_id = %s
            """, (user_id,))
            
            profile = cursor.fetchone()
            
            # Get volunteer skills
            cursor.execute("""
                SELECT s.skill_name
                FROM volunteer_skills vs
                JOIN skills s ON vs.skill_id = s.skills_id
                WHERE vs.volunteer_id = %s
            """, (user_id,))
            
            skills = [row['skill_name'] for row in cursor.fetchall()]
            
            # Get statistics
            cursor.execute("""
                SELECT 
                    COUNT(CASE WHEN vh.participation_status = 'Volunteered' THEN 1 END) AS events_completed,
                    COALESCE(SUM(CASE WHEN vh.participation_status = 'Volunteered' 
                                    THEN ed.event_duration END), 0) AS total_hours,
                    ROUND(AVG(CASE WHEN vh.participation_status = 'Volunteered' AND vh.performance IS NOT NULL 
                                   THEN vh.performance END), 1) AS average_rating
                FROM volunteerhistory vh
                LEFT JOIN eventdetails ed ON vh.event_id = ed.event_id
                WHERE vh.volunteer_id = %s
            """, (user_id,))
            
            stats = cursor.fetchone()
            
            volunteer_info = {
                "name": profile['full_name'] if profile else "Volunteer",
                "email": user_email,
                "city": profile['city'] if profile else "",
                "state": profile['state_name'] if profile else "",
                "skills": skills,
                "preferences": profile['preferences'] if profile else "",
                "total_hours": stats['total_hours'] or 0,
                "events_completed": stats['events_completed'] or 0,
                "average_rating": float(stats['average_rating']) if stats['average_rating'] else 0.0
            }
            
            return convert_decimal({
                "volunteer_info": volunteer_info,
                "achievements": [],  # Can be implemented later
                "recommendations": [],  # Can be implemented later
                "statistics": {
                    "total_hours": stats['total_hours'] or 0,
                    "events_completed": stats['events_completed'] or 0,
                    "average_rating": float(stats['average_rating']) if stats['average_rating'] else 0.0,
                    "upcoming_events": 0  # Can be calculated if needed
                }
            }), 200
            
        except Exception as e:
            print(f"Database error in VolunteerProfile: {e}")
            return {"error": "Failed to retrieve volunteer profile"}, 500
        
        finally:
            cursor.close()
            conn.close()


class VolunteerEventDetail(Resource):
    @jwt_required()
    def get(self, event_id):
        """Get detailed information about a specific event"""
        user_email = get_jwt_identity()
        
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # Get event details
            cursor.execute("""
                SELECT 
                    event_id AS id,
                    event_name AS event,
                    date,
                    event_duration,
                    location_name AS location,
                    event_description AS description,
                    volunteers_needed,
                    event_status,
                    urgency,
                    required_skills
                FROM eventdetails 
                WHERE event_id = %s
            """, (event_id,))
            
            event_record = cursor.fetchone()
            
            if not event_record:
                return {"error": "Event not found"}, 404
            
            # Get current volunteer count
            cursor.execute("""
                SELECT COUNT(*) as current_volunteers
                FROM volunteerhistory 
                WHERE event_id = %s AND participation_status IN ('Registered', 'Volunteered')
            """, (event_id,))
            
            current_vol_count = cursor.fetchone()['current_volunteers'] or 0
            
            # Check user's participation status
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            user_id = user_result['user_id'] if user_result else None
            
            participation_status = None
            if user_id:
                cursor.execute("""
                    SELECT participation_status 
                    FROM volunteerhistory 
                    WHERE event_id = %s AND volunteer_id = %s
                """, (event_id, user_id))
                
                participation_record = cursor.fetchone()
                if participation_record:
                    participation_status = participation_record['participation_status']
            
            # Format event data
            duration = event_record['event_duration'] or 2
            start_time = "09:00:00"
            end_hour = 9 + duration
            end_time = f"{end_hour:02d}:00:00"
            
            event_data = {
                "id": event_record['id'],
                "event": event_record['event'],
                "date": event_record['date'].strftime('%Y-%m-%d') if event_record['date'] else None,
                "time": start_time,
                "endTime": end_time,
                "location": event_record['location'] or "Location TBD",
                "description": event_record['description'] or "",
                "volunteers": current_vol_count,
                "maxVolunteers": event_record['volunteers_needed'] or 0,
                "event_status": event_record['event_status'],
                "urgency": event_record['urgency'],
                "required_skills": event_record['required_skills'].split(',') if event_record['required_skills'] else [],
                "participation_status": participation_status
            }
            
            return convert_decimal(event_data), 200
            
        except Exception as e:
            print(f"Database error in VolunteerEventDetail: {e}")
            return {"error": "Failed to retrieve event details"}, 500
        
        finally:
            cursor.close()
            conn.close()

class VolunteerReportCSV(Resource):
    @jwt_required()
    def get(self, volunteer_id):
        conn = get_db()
        cursor = conn.cursor()

        query = """
           SELECT 
               IFNULL(ed.event_name, 'N/A') AS event,
               IFNULL(DATE_FORMAT(ed.date, '%%Y-%%m-%%d'), 'N/A') AS date,
               IFNULL(ed.event_duration, -1) AS hours,
               IFNULL(ed.location_name, 'N/A') AS location,
               IFNULL(vh.participation_status, 'N/A') AS status,
               IFNULL(vh.performance, -1) AS rating,
               up.full_name AS name,
               uc.email AS email,
               up.address1,
               IFNULL(up.address2, 'N/A') AS address2,
               up.city,
               up.state_name,
               up.zipcode,
               IFNULL(skill_list.skills, 'N/A') AS skills,
               IFNULL(va.dates, 'N/A') AS preferences
           FROM userprofile up
           JOIN usercredentials uc ON up.volunteer_id = uc.user_id
           LEFT JOIN volunteerhistory vh ON vh.volunteer_id = up.volunteer_id
           LEFT JOIN eventdetails ed ON vh.event_id = ed.event_id
           LEFT JOIN (
               SELECT volunteer_id, GROUP_CONCAT(skill_name SEPARATOR ', ') AS skills
               FROM volunteer_skills vs
               JOIN skills s ON vs.skill_id = s.skills_id
               GROUP BY volunteer_id
           ) skill_list ON up.volunteer_id = skill_list.volunteer_id
           LEFT JOIN (
               SELECT 
                   volunteer_id, 
                   GROUP_CONCAT(DATE_FORMAT(date_available, '%%Y-%%m-%%d') ORDER BY date_available SEPARATOR ', ') AS dates
               FROM volunteer_availability
               GROUP BY volunteer_id
           ) va ON up.volunteer_id = va.volunteer_id
           WHERE up.volunteer_id = %s
           AND ed.event_id IS NOT NULL
           GROUP BY 
               ed.event_name, ed.date, ed.event_duration, ed.location_name,
               vh.participation_status, vh.performance,
               up.full_name, uc.email, up.address1, up.address2,
               up.city, up.state_name, up.zipcode, skill_list.skills, va.dates
           ORDER BY ed.date DESC;
        """
        cursor.execute(query, (volunteer_id,))
        data = cursor.fetchall()
        cursor.close()
        conn.close()

        if not data:
            return {"error": "No data found"}, 404

        total_hours = sum(row['hours'] if row['hours'] != -1 else 0 for row in data)
        total_events = sum(1 for row in data if row['event'] != 'N/A')
        rating = data[0].get('rating', -1)
        rating_val = rating if rating != -1 else 0

        is_zero_data = (total_hours == 0) and (total_events == 0) and (rating_val == 0)

        basic_fields = ['name', 'email', 'state_name', 'city', 'address1', 'address2', 'zipcode', 'skills', 'preferences']
        basic_headers = {
            'name': 'Name',
            'email': 'Email Address',
            'address1': 'Address Line 1',
            'address2': 'Address Line 2',
            'city': 'City',
            'state_name': 'State',
            'zipcode': 'ZIP Code',
            'skills': 'Skills',
            'preferences': 'Availability Dates'
        }

        full_fields = [
            'name', 'email', 'state_name', 'city', 'address1', 'address2', 'zipcode',
            'skills', 'preferences', 'event', 'date', 'hours', 'location', 'status', 'rating'
        ]
        full_headers = {
            'name': 'Name',
            'email': 'Email Address',
            'address1': 'Address Line 1',
            'address2': 'Address Line 2',
            'city': 'City',
            'state_name': 'State',
            'zipcode': 'ZIP Code',
            'skills': 'Skills',
            'preferences': 'Availability Dates',
            'event': 'Event Name',
            'date': 'Event Date',
            'hours': 'Duration (Hours)',
            'location': 'Location',
            'status': 'Participation Status',
            'rating': 'Performance Rating'
        }

        output = io.StringIO()
        if is_zero_data:
          # Only write basic volunteer info row
          writer = csv.DictWriter(output, fieldnames=basic_fields)
          writer.writeheader()
          basic_row = {field: data[0].get(field, '') for field in basic_fields}
          writer.writerow(basic_row)
        else:
          writer = csv.DictWriter(output, fieldnames=full_fields)
          writer.writeheader()
          for row in data:
            # Skip empty event rows with no real participation
            if row['event'] == 'N/A' and row['status'] != 'Registered':
             continue
        
             # Normalize address2 and fix hours/rating for display
            if not row.get('address2'):
             row['address2'] = ''
            row['hours'] = row['hours'] if row['hours'] != -1 else ''
            row['rating'] = row['rating'] if row['rating'] != -1 else ''
        writer.writerow({field: row.get(field, '') for field in full_fields})


        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={"Content-Disposition": f"attachment; filename=volunteer_{volunteer_id}_report.csv"}
        )




class VolunteerReportPDF(Resource):
    @jwt_required()
    def get(self, volunteer_id):
        conn = get_db()
        cursor = conn.cursor()

        query = """
        SELECT 
            IFNULL(ed.event_name, 'N/A') AS event,
            IFNULL(DATE_FORMAT(ed.date, '%%Y-%%m-%%d'), 'N/A') AS date,
            IFNULL(ed.event_duration, -1) AS hours,
            IFNULL(ed.location_name, 'N/A') AS location,
            IFNULL(vh.participation_status, 'N/A') AS status,
            IFNULL(vh.performance, -1) AS rating,
            IFNULL(up.full_name, 'N/A') AS name,
            IFNULL(uc.email, 'N/A') AS email,
            IFNULL(up.address1, 'N/A') AS address1,
            IFNULL(up.address2, 'N/A') AS address2,
            IFNULL(up.city, 'N/A') AS city,
            IFNULL(up.state_name, 'N/A') AS state_name,
            IFNULL(up.zipcode, 'N/A') AS zipcode,
            IFNULL(skill_list.skills, 'N/A') AS skills,
            IFNULL(va.dates, 'N/A') AS preferences
        FROM userprofile up
        JOIN usercredentials uc ON up.volunteer_id = uc.user_id
        LEFT JOIN volunteerhistory vh ON vh.volunteer_id = up.volunteer_id
        LEFT JOIN eventdetails ed ON vh.event_id = ed.event_id
        LEFT JOIN (
            SELECT volunteer_id, GROUP_CONCAT(skill_name SEPARATOR ', ') AS skills
            FROM volunteer_skills vs
            JOIN skills s ON vs.skill_id = s.skills_id
            GROUP BY volunteer_id
        ) skill_list ON up.volunteer_id = skill_list.volunteer_id
        LEFT JOIN (
            SELECT 
                volunteer_id, 
                GROUP_CONCAT(DATE_FORMAT(date_available, '%%Y-%%m-%%d') ORDER BY date_available SEPARATOR ', ') AS dates
            FROM volunteer_availability
            GROUP BY volunteer_id
        ) va ON up.volunteer_id = va.volunteer_id
        WHERE up.volunteer_id = %s
        GROUP BY 
            ed.event_name, ed.date, ed.event_duration, ed.location_name,
            vh.participation_status, vh.performance,
            up.full_name, uc.email, up.address1, up.address2,
            up.city, up.state_name, up.zipcode, skill_list.skills, va.dates
        ORDER BY ed.date DESC;
        """

        cursor.execute(query, (volunteer_id,))
        data = cursor.fetchall()
        cursor.close()
        conn.close()

        if not data:
            return {"error": "No data found"}, 404

        # Extract info from first row
        row = data[0]
        name = row['name']
        email = row['email']
        address1 = row['address1']
        address2 = row['address2']
        city = row['city']
        state = row['state_name']
        zipcode = row['zipcode']
        skills = row['skills']
        preferences = row['preferences']

        # Calculate totals from data
        total_hours = sum(item['hours'] if item['hours'] != -1 else 0 for item in data)
        # Count only rows with a real event name
        real_event_rows = [item for item in data if item['event'] != 'N/A']
        total_events = len(real_event_rows)
        rating = row.get('rating', -1)
        rating_val = rating if rating != -1 else 0  # Treat -1 as 0 for your logic

        # Condition to check zero stats
        is_zero_data = (total_hours == 0) and (total_events == 0) and (rating_val == 0)

        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        y = height - 40

        # Header
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(40, y, f"Volunteer Report - {name} (ID: {volunteer_id})")

        pdf.setFont("Helvetica", 10)
        report_date = datetime.now().strftime("%Y-%m-%d %H:%M")
        pdf.drawRightString(width - 40, y, f"Report Generated: {report_date}")
        y -= 35

        # Basic Info
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(40, y, "Volunteer Information")
        y -= 18

        pdf.setFont("Helvetica", 11)
        pdf.drawString(50, y, f"Email: {email}")
        y -= 15
        pdf.drawString(50, y, f"Address: {address1}, {address2}, {city}, {state}, {zipcode}")
        y -= 15
        pdf.drawString(50, y, f"Skills: {skills}")
        y -= 15
        pdf.drawString(50, y, f"Availability: {preferences}")
        y -= 15

        # If zero data, skip events section, just show rating and note
        if is_zero_data:
            pdf.drawString(50, y, "Rating: N/A")
            y -= 25
            pdf.setFont("Helvetica-Oblique", 11)
            pdf.drawString(50, y, "No event participation or ratings available for this volunteer.")
        else:
            rating_str = str(rating) if rating != -1 else 'N/A'
            pdf.drawString(50, y, f"Rating: {rating_str}")
            y -= 25

            # Participated events section
            pdf.setFont("Helvetica-Bold", 12)
            pdf.drawString(40, y, "Participated Events")
            y -= 18

            # Table header
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(50, y, "Event")
            pdf.drawString(220, y, "Date")
            pdf.drawString(300, y, "Location")
            pdf.drawString(420, y, "Hours")
            pdf.drawString(470, y, "Status")
            y -= 3
            pdf.line(40, y, width - 40, y)
            y -= 12

            # Table content
            pdf.setFont("Helvetica", 10)
            for item in data:
                # Skip empty event rows if there are real event rows
                if item['event'] == 'N/A' and total_events > 0:
                    continue

                event = item['event']
                date = item['date']
                location = item['location']
                hours = item['hours']
                hours_str = f"{hours}h" if hours != -1 else ''
                status = item['status']

                pdf.drawString(50, y, event)
                pdf.drawString(220, y, date)
                pdf.drawString(300, y, location)
                pdf.drawString(420, y, hours_str)
                pdf.drawString(470, y, status)

                y -= 12
                if y < 50:
                    pdf.showPage()
                    y = height - 40
                    pdf.setFont("Helvetica-Bold", 10)
                    pdf.drawString(50, y, "Event")
                    pdf.drawString(220, y, "Date")
                    pdf.drawString(300, y, "Location")
                    pdf.drawString(420, y, "Hours")
                    pdf.drawString(470, y, "Status")
                    y -= 3
                    pdf.line(40, y, width - 40, y)
                    y -= 12
                    pdf.setFont("Helvetica", 10)

        # Save PDF
        pdf.save()
        buffer.seek(0)

        return Response(
            buffer.getvalue(),
            mimetype='application/pdf',
            headers={"Content-Disposition": f"attachment; filename=volunteer_{volunteer_id}_report.pdf"}
        )




