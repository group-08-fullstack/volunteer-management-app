import re
from flask_restful import Resource
from datetime import datetime
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import db

class Profile(Resource):
    @jwt_required()
    def get(self):
        """Get user's profile"""
        user_email = get_jwt_identity()  # Get email from JWT
        
        # Establish database connection
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # 1. First, get the user_id from UserCredentials table using email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']  # This is the integer user_id
            
            # 2. Get user profile from userprofile table (including new fields)
            cursor.execute("""
                SELECT 
                    volunteer_id, full_name, date_of_birth, phone_number,
                    address1, address2, city, state_name, zipcode, preferences
                FROM userprofile 
                WHERE volunteer_id = %s
            """, (user_id,))
            
            profile = cursor.fetchone()
            
            if not profile:
                return {"error": "Profile not found"}, 404
            
            # 3. Get user skills from volunteer_skills and skills tables
            cursor.execute("""
                SELECT s.skill_name as label, s.skill_name as value
                FROM volunteer_skills vs
                JOIN skills s ON vs.skill_id = s.skills_id
                WHERE vs.volunteer_id = %s
            """, (user_id,))
            
            skills = cursor.fetchall()
            
            # 4. Get user availability from volunteer_availability table
            cursor.execute("""
                SELECT date_available
                FROM volunteer_availability
                WHERE volunteer_id = %s
                ORDER BY date_available
            """, (user_id,))
            
            availability_rows = cursor.fetchall()
            # Convert date objects to strings in YYYY-MM-DD format
            availability = []
            for row in availability_rows:
                if isinstance(row['date_available'], str):
                    availability.append(row['date_available'])
                else:
                    # If it's a date object, convert to string
                    availability.append(row['date_available'].strftime('%Y-%m-%d'))
            
            # 5. Format date_of_birth and phone_number for response
            date_of_birth = None
            if profile['date_of_birth']:
                if isinstance(profile['date_of_birth'], str):
                    date_of_birth = profile['date_of_birth']
                else:
                    date_of_birth = profile['date_of_birth'].strftime('%Y-%m-%d')
            
            phone_number = str(profile['phone_number']) if profile['phone_number'] else ""
            
            # 6. Combine all data using consistent field names
            user_profile = {
                "id": profile['volunteer_id'],
                "userId": user_id,
                "fullName": profile['full_name'],
                "dateOfBirth": date_of_birth,
                "phoneNumber": phone_number,
                "address1": profile['address1'],
                "address2": profile['address2'] or "",
                "city": profile['city'],
                "state": profile['state_name'],
                "zip": profile['zipcode'],
                "skills": skills,
                "preferences": profile['preferences'] or "",
                "availability": availability,
                "createdAt": datetime.now().isoformat() + "Z",
                "updatedAt": datetime.now().isoformat() + "Z"
            }
            
            return user_profile, 200
            
        except Exception as e:
            print(f"Database error getting profile: {e}")
            return {"error": "Failed to retrieve profile"}, 500
            
        finally:
            cursor.close()
            conn.close()
    
    @jwt_required()  # Require valid JWT token
    def post(self):
        # Get the logged-in user's email from JWT token
        user_email = get_jwt_identity()
        
        # Get form data from request
        data = request.get_json()

        # Validate the profile data
        validation_result = self._validate_profile_data(data)
        if validation_result:
            return validation_result, 400
        
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # 1. First, get the user_id from UserCredentials table using email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']  # This is the integer user_id
            
            # 2. Check if profile already exists in userprofile table
            cursor.execute(
                "SELECT * FROM userprofile WHERE volunteer_id = %s", 
                (user_id,)
            )
            if cursor.fetchone():
                return {"message": "Profile already exists for this user"}, 400
            
            # 3. Prepare phone number (convert to int or None)
            phone_number = None
            if data.get('phoneNumber') and data['phoneNumber'].strip():
                phone_number = int(data['phoneNumber'])
            
            # 4. Create the profile using the existing user_id (including new fields)
            profile_query = """
            INSERT INTO userprofile (volunteer_id, full_name, date_of_birth, phone_number, 
                                   address1, address2, city, state_name, zipcode, preferences) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            profile_values = (
                user_id,  # Use the integer user_id from UserCredentials as volunteer_id
                data['fullName'],
                data['dateOfBirth'],  # Should be in YYYY-MM-DD format from frontend
                phone_number,  # Integer or None
                data['address1'],
                data.get('address2', ''),  # Optional field
                data['city'],
                data['state'],  # This goes to state_name column
                data['zip'],    # This goes to zipcode column
                data.get('preferences', '')
            )
            
            cursor.execute(profile_query, profile_values)
            
            # 5. Handle skills - insert into volunteer_skills table
            if 'skills' in data and data['skills']:
                for skill in data['skills']:
                    # Check if skill exists in skills table
                    cursor.execute("SELECT skills_id FROM skills WHERE skill_name = %s", (skill['value'],))
                    skill_row = cursor.fetchone()
                    
                    if skill_row:
                        skill_id = skill_row['skills_id']
                    else:
                        # Create new skill if it doesn't exist
                        cursor.execute(
                            "INSERT INTO skills (skill_name, skill_description) VALUES (%s, %s)",
                            (skill['value'], skill['label'])
                        )
                        skill_id = cursor.lastrowid
                    
                    # Link skill to volunteer
                    cursor.execute(
                        "INSERT INTO volunteer_skills (volunteer_id, skill_id) VALUES (%s, %s)",
                        (user_id, skill_id)
                    )
            
            # 6. Handle availability dates - insert into volunteer_availability table
            if 'availability' in data and data['availability']:
                for date_str in data['availability']:
                    cursor.execute(
                        """INSERT INTO volunteer_availability (volunteer_id, date_available) 
                        VALUES (%s, %s)""",
                        (user_id, date_str)
                    )
            
            conn.commit()
            
            return {"message": "Profile created successfully!"}, 201
            
        except Exception as e:
            conn.rollback()
            return {"error": f"Database error creating profile: {str(e)}"}, 500
        finally:
            cursor.close()
            conn.close()
    
    @jwt_required()
    def put(self):
        """Update existing profile"""
        user_email = get_jwt_identity()  # This returns email, not user_id
        profile_data = request.get_json()
        
        # Validate the profile data
        validation_result = self._validate_profile_data(profile_data)
        if validation_result:
            return validation_result, 400
        
        # Establish database connection
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # Get the user_id from email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']
            
            # Check if profile exists
            cursor.execute("SELECT volunteer_id FROM userprofile WHERE volunteer_id = %s", (user_id,))
            existing_profile = cursor.fetchone()
            
            if not existing_profile:
                return {"error": "Profile not found"}, 404
            
            # Prepare phone number (convert to int or None)
            phone_number = None
            if profile_data.get('phoneNumber') and profile_data['phoneNumber'].strip():
                phone_number = int(profile_data['phoneNumber'])
            
            # Update profile using your column names (including new fields)
            cursor.execute("""
                UPDATE userprofile 
                SET full_name = %s, date_of_birth = %s, phone_number = %s,
                    address1 = %s, address2 = %s, city = %s, 
                    state_name = %s, zipcode = %s, preferences = %s
                WHERE volunteer_id = %s
            """, (
                profile_data["fullName"],
                profile_data["dateOfBirth"],  # Should be in YYYY-MM-DD format
                phone_number,  # Integer or None
                profile_data["address1"],
                profile_data.get("address2", ""),
                profile_data["city"],
                profile_data["state"],
                profile_data["zip"],
                profile_data.get("preferences", ""),
                user_id
            ))
            
            # Update skills
            self._update_user_skills(cursor, user_id, profile_data["skills"])
            
            # Update availability dates
            self._update_user_availability(cursor, user_id, profile_data["availability"])
            
            # Commit all changes
            conn.commit()
            
            return {"message": "Profile updated successfully"}, 200
            
        except Exception as e:
            conn.rollback()
            print(f"Database error updating profile: {e}")
            return {"error": "Failed to update profile"}, 500
            
        finally:
            cursor.close()
            conn.close()

    @jwt_required()
    def delete(self):
        """Delete user's profile"""
        user_email = get_jwt_identity()  # This returns email, not user_id
        
        # Establish database connection
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # Get the user_id from email
            cursor.execute(
                "SELECT user_id FROM usercredentials WHERE email = %s", 
                (user_email,)
            )
            user_result = cursor.fetchone()
            
            if not user_result:
                return {"error": "User not found"}, 404
            
            user_id = user_result['user_id']
            
            # Check if profile exists
            cursor.execute("SELECT volunteer_id FROM userprofile WHERE volunteer_id = %s", (user_id,))
            profile = cursor.fetchone()
            
            if not profile:
                return {"error": "Profile not found"}, 404
            
            # Delete related data first (due to foreign key constraints)
            cursor.execute("DELETE FROM volunteer_skills WHERE volunteer_id = %s", (user_id,))
            cursor.execute("DELETE FROM volunteer_availability WHERE volunteer_id = %s", (user_id,))
            
            # Delete profile
            cursor.execute("DELETE FROM userprofile WHERE volunteer_id = %s", (user_id,))
            
            # Commit changes
            conn.commit()
            
            return {"message": "Profile deleted successfully"}, 200
            
        except Exception as e:
            conn.rollback()
            print(f"Database error deleting profile: {e}")
            return {"error": "Failed to delete profile"}, 500
            
        finally:
            cursor.close()
            conn.close()
    
    def _update_user_skills(self, cursor, user_id, skills):
        """Update user skills in database using your table structure"""
        # Delete existing skills
        cursor.execute("DELETE FROM volunteer_skills WHERE volunteer_id = %s", (user_id,))
        
        # Insert new skills
        for skill in skills:
            # Get skill ID by skill name (since your skills table uses skill_name)
            cursor.execute("SELECT skills_id FROM skills WHERE skill_name = %s", (skill["value"],))
            skill_row = cursor.fetchone()
            
            if skill_row:
                cursor.execute(
                    "INSERT INTO volunteer_skills (volunteer_id, skill_id) VALUES (%s, %s)",
                    (user_id, skill_row['skills_id'])
                )
            else:
                # If skill doesn't exist, create it
                cursor.execute(
                    "INSERT INTO skills (skill_name, skill_description) VALUES (%s, %s)",
                    (skill["value"], skill["label"])
                )
                # Get the new skill ID
                new_skill_id = cursor.lastrowid
                # Link it to the user
                cursor.execute(
                    "INSERT INTO volunteer_skills (volunteer_id, skill_id) VALUES (%s, %s)",
                    (user_id, new_skill_id)
                )
    
    def _update_user_availability(self, cursor, user_id, availability):
        """Update user availability in database using your table structure"""
        # Delete existing availability
        cursor.execute("DELETE FROM volunteer_availability WHERE volunteer_id = %s", (user_id,))
        
        # Insert new availability
        for date_str in availability:
            cursor.execute(
                "INSERT INTO volunteer_availability (volunteer_id, date_available) VALUES (%s, %s)",
                (user_id, date_str)
            )
    
    def _validate_profile_data(self, data):
        """Validate profile data and return error if invalid"""
        if not data:
            return {"error": "Missing JSON body"}
        
        # Required fields (including new dateOfBirth)
        required_fields = ["fullName", "dateOfBirth", "address1", "city", "state", "zip", "skills", "availability"]
        for field in required_fields:
            if field not in data:
                return {"error": f"Missing required field: {field}"}
        
        # Validate fullName (matches your varchar(50))
        if not isinstance(data["fullName"], str) or not data["fullName"].strip():
            return {"error": "Full name must be a non-empty string"}
        if len(data["fullName"]) > 50:
            return {"error": "Full name must be 50 characters or less"}
        
        # Validate dateOfBirth (required field)
        if not isinstance(data["dateOfBirth"], str) or not data["dateOfBirth"].strip():
            return {"error": "Date of birth must be a non-empty string"}
        try:
            datetime.strptime(data["dateOfBirth"], "%Y-%m-%d")
        except ValueError:
            return {"error": "Date of birth must be in YYYY-MM-DD format"}
        
        # Validate phoneNumber (optional field)
        if "phoneNumber" in data and data["phoneNumber"]:
            if not isinstance(data["phoneNumber"], str):
                return {"error": "Phone number must be a string"}
            # Remove any formatting and check if it's all digits
            phone_digits = re.sub(r'\D', '', data["phoneNumber"])
            if phone_digits and not phone_digits.isdigit():
                return {"error": "Phone number must contain only digits"}
            if phone_digits and len(phone_digits) != 10:
                return {"error": "Phone number must be exactly 10 digits"}
        
        # Validate address1 (matches your varchar(100))
        if not isinstance(data["address1"], str) or not data["address1"].strip():
            return {"error": "Address 1 must be a non-empty string"}
        if len(data["address1"]) > 100:
            return {"error": "Address 1 must be 100 characters or less"}
        
        # Validate address2 (matches your varchar(100))
        if "address2" in data and data["address2"]:
            if not isinstance(data["address2"], str):
                return {"error": "Address 2 must be a string"}
            if len(data["address2"]) > 100:
                return {"error": "Address 2 must be 100 characters or less"}
        
        # Validate city (matches your varchar(100))
        if not isinstance(data["city"], str) or not data["city"].strip():
            return {"error": "City must be a non-empty string"}
        if len(data["city"]) > 100:
            return {"error": "City must be 100 characters or less"}
        
        # Validate state (matches your varchar(100))
        if not isinstance(data["state"], str) or not data["state"].strip():
            return {"error": "State must be a non-empty string"}
        if len(data["state"]) > 100:
            return {"error": "State must be 100 characters or less"}
        
        # Validate zip code (matches your varchar(9))
        if not isinstance(data["zip"], str) or not data["zip"].strip():
            return {"error": "Zip code must be a non-empty string"}
        if len(data["zip"]) > 9:
            return {"error": "Zip code must be 9 characters or less"}
        zip_pattern = r'^\d{5}(-\d{4})?'
        if not re.match(zip_pattern, data["zip"]):
            return {"error": "Zip code must be in format 12345 or 12345-6789"}
        
        # Validate skills
        if not isinstance(data["skills"], list):
            return {"error": "Skills must be an array"}
        if len(data["skills"]) == 0:
            return {"error": "At least one skill must be selected"}
        
        for skill in data["skills"]:
            if not isinstance(skill, dict) or "value" not in skill or "label" not in skill:
                return {"error": "Each skill must be an object with 'value' and 'label' properties"}
        
        # Validate availability
        if not isinstance(data["availability"], list):
            return {"error": "Availability must be an array"}
        if len(data["availability"]) == 0:
            return {"error": "At least one availability date must be provided"}
        
        for date_str in data["availability"]:
            if not isinstance(date_str, str):
                return {"error": "Each availability date must be a string"}
            try:
                datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                return {"error": f"Invalid date format: {date_str}. Must be YYYY-MM-DD"}
        
        return None  # No validation errors


class ProfileSkills(Resource):
    @jwt_required()
    def get(self):
        """Get all available skills from the skills table"""
        conn = db.get_db()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                SELECT skills_id, skill_name 
                FROM skills 
                ORDER BY skill_name ASC
            """)
            
            skill_rows = cursor.fetchall()
            
            skills = []
            for row in skill_rows:
                skill = {
                    "value": row['skill_name'],  # Frontend expects 'value'
                    "label": row['skill_name'],  # Frontend expects 'label'
                    "id": row['skills_id']       # Keep ID for reference
                }
                skills.append(skill)

            return {
                "skills": skills,
                "total": len(skills)
            }, 200

        except Exception as e:
            print(f"Database error getting skills: {e}")
            return {"error": "Failed to retrieve skills"}, 500
        finally:
            cursor.close()
            conn.close()


class ProfileStates(Resource):
    def get(self):
        """Get available state options from database"""
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # Query your states table
            cursor.execute("""
                SELECT state_id, state_name, abbreviation 
                FROM states 
                ORDER BY state_name ASC
            """)
            
            state_rows = cursor.fetchall()
            
            # Format for frontend consumption
            states = []
            for row in state_rows:
                state = {
                    "value": row['state_name'],  # Full name for database storage
                    "label": row['state_name'],  # Display name
                    "abbreviation": row['abbreviation'],  # For optional use
                    "id": row['state_id']  # Database ID
                }
                states.append(state)
            
            return {
                "states": states,
                "total": len(states)
            }, 200
            
        except Exception as e:
            print(f"Database error getting states: {e}")
            return {"error": "Failed to retrieve states"}, 500
        finally:
            cursor.close()
            conn.close()


class ProfileList(Resource):
    @jwt_required()
    def get(self):
        """Get all profiles (admin only)"""
        # Establish database connection
        conn = db.get_db()
        cursor = conn.cursor()
        
        try:
            # Get profile count
            cursor.execute("SELECT COUNT(*) as total FROM userprofile")
            total_count = cursor.fetchone()['total']
            
            # Get basic profile info using your column names (including new fields)
            cursor.execute("""
                SELECT 
                    volunteer_id, full_name, date_of_birth, phone_number,
                    city, state_name, address1, zipcode, preferences
                FROM userprofile
                ORDER BY volunteer_id DESC
            """)
            
            profiles = cursor.fetchall()
            
            # Format the profiles
            formatted_profiles = []
            for profile in profiles:
                # Format date_of_birth
                date_of_birth = None
                if profile['date_of_birth']:
                    if isinstance(profile['date_of_birth'], str):
                        date_of_birth = profile['date_of_birth']
                    else:
                        date_of_birth = profile['date_of_birth'].strftime('%Y-%m-%d')
                
                # Format phone_number
                phone_number = str(profile['phone_number']) if profile['phone_number'] else ""
                
                formatted_profiles.append({
                    "id": profile['volunteer_id'],
                    "fullName": profile['full_name'],
                    "dateOfBirth": date_of_birth,
                    "phoneNumber": phone_number,
                    "city": profile['city'],
                    "state": profile['state_name'],
                    "address1": profile['address1'],
                    "zipcode": profile['zipcode'],
                    "preferences": profile['preferences']
                })
            
            return {"profiles": formatted_profiles, "total": total_count}, 200
            
        except Exception as e:
            print(f"Database error getting profile list: {e}")
            return {"error": "Failed to retrieve profiles"}, 500
            
        finally:
            cursor.close()
            conn.close()