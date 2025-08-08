import pytest
from api.db import get_db

class TestCompletedEventsAPI:
    def test_get_success(self,access_token_admin,client):

        with client.application.app_context():
            conn = None
            cursor = None

            try:
                # Establish connection
                conn = get_db()

                # Create cursor
                cursor = conn.cursor()


                # Populate database with test data
                sql = """
                INSERT INTO eventdetails (
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
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                values = (
                    101,
                    'Health Awareness Campaign',
                    'Public Speaking',
                    '',
                    'Connecticut',
                    'detroit',
                    '98765',
                    'Medium',
                    'south fulton',
                    1,
                    'Raising awareness about health issues and promoting healthy lifestyles.',
                    '2025-08-06',
                    '2025-08-05 06:17:35',
                    'Completed',
                    1
                )

                cursor.execute(sql, values)

                conn.commit()

            except Exception as e:
                print(f"Database error: {e}")

            finally:
                cursor.close()
                conn.close()

        respsonse = client.get("/api/events/completed",headers={"Authorization": f"Bearer {access_token_admin}"})
        assert respsonse.status_code == 200

    def test_get_unauthorized(self,access_token_volunteer,client):
        with client.application.app_context():
            conn = None
            cursor = None

            try:
                # Establish connection
                conn = get_db()

                # Create cursor
                cursor = conn.cursor()


                # Populate database with test data
                sql = """
                INSERT INTO eventdetails (
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
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                values = (
                    101,
                    'Health Awareness Campaign',
                    'Public Speaking',
                    '',
                    'Connecticut',
                    'detroit',
                    '98765',
                    'Medium',
                    'south fulton',
                    1,
                    'Raising awareness about health issues and promoting healthy lifestyles.',
                    '2025-08-06',
                    '2025-08-05 06:17:35',
                    'Completed',
                    1
                )

                cursor.execute(sql, values)

                conn.commit()

            except Exception as e:
                print(f"Database error: {e}")

            finally:
                cursor.close()
                conn.close()

        respsonse = client.get("/api/events/completed",headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert respsonse.status_code == 403


class TestEventStatisticsAPI:
    def test_get_success(self,access_token_admin,client):
        with client.application.app_context():
            conn = None
            cursor = None

            try:
                # Establish connection
                conn = get_db()

                # Create cursor
                cursor = conn.cursor()


                # Populate database with test data
                sql = """
                INSERT INTO eventdetails (
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
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                values = (
                    101,
                    'Health Awareness Campaign',
                    'Public Speaking',
                    '',
                    'Connecticut',
                    'detroit',
                    '98765',
                    'Medium',
                    'south fulton',
                    1,
                    'Raising awareness about health issues and promoting healthy lifestyles.',
                    '2025-08-06',
                    '2025-08-05 06:17:35',
                    'Completed',
                    1
                )

                cursor.execute(sql, values)

                conn.commit()

            except Exception as e:
                print(f"Database error: {e}")

            finally:
                cursor.close()
                conn.close()

        respsonse = client.get("/api/events/statistics",headers={"Authorization": f"Bearer {access_token_admin}"})
        assert respsonse.status_code == 200

    def test_get_unauthorized(self,access_token_volunteer,client):
        with client.application.app_context():
            conn = None
            cursor = None

            try:
                # Establish connection
                conn = get_db()

                # Create cursor
                cursor = conn.cursor()


                # Populate database with test data
                sql = """
                INSERT INTO eventdetails (
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
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                values = (
                    101,
                    'Health Awareness Campaign',
                    'Public Speaking',
                    '',
                    'Connecticut',
                    'detroit',
                    '98765',
                    'Medium',
                    'south fulton',
                    1,
                    'Raising awareness about health issues and promoting healthy lifestyles.',
                    '2025-08-06',
                    '2025-08-05 06:17:35',
                    'Completed',
                    1
                )

                cursor.execute(sql, values)

                conn.commit()

            except Exception as e:
                print(f"Database error: {e}")

            finally:
                cursor.close()
                conn.close()

        respsonse = client.get("/api/events/statistics",headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert respsonse.status_code == 403


class TestVolunteerPerformanceAPI:
    def test_get_success(self,access_token_admin,client,user_volunteer):
        with client.application.app_context():
            conn = None
            cursor = None

            try:
                # Establish connection
                conn = get_db()

                # Create cursor
                cursor = conn.cursor()

                
                # Get the user_id from UserCredentials table using email
                cursor.execute(
                    "SELECT user_id FROM usercredentials WHERE email = %s", 
                    (user_volunteer["email"],)
                )
                user_result = cursor.fetchone()

                if not user_result:
                    raise AssertionError("No user_result")
                
                user_id = user_result['user_id']


                # Populate database with test data

                # Test event
                sql = """
                INSERT INTO eventdetails (
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
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                values = (
                    101,
                    'Health Awareness Campaign',
                    'Public Speaking',
                    '',
                    'Connecticut',
                    'detroit',
                    '98765',
                    'Medium',
                    'south fulton',
                    1,
                    'Raising awareness about health issues and promoting healthy lifestyles.',
                    '2025-08-06',
                    '2025-08-05 06:17:35',
                    'Completed',
                    1
                )

                cursor.execute(sql, values)

                # Test user profile
                sql = """
                    INSERT INTO userprofile (
                        volunteer_id,
                        full_name,
                        address1,
                        address2,
                        city,
                        state_name,
                        zipcode,
                        preferences,
                        date_of_birth,
                        phone_number
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                values = (
                    user_id,                  # volunteer_id
                    'John Doe',               # full_name
                    '123 Main St',            # address1
                    'Apt 4B',                 # address2
                    'Springfield',            # city
                    'Texas',                  # state_name
                    '77381',                  # zipcode
                    'Environment, Education', # preferences
                    '1995-08-15',             # date_of_birth
                    '123-456-7890'            # phone_number
                )

                cursor.execute(sql, values)

                # Test volunteer history
                
                cursor.execute(
                    "INSERT INTO volunteerhistory (volunteer_id, event_id, participation_status) VALUES (%s, %s, %s)", 
                    (user_id, 101, 'Volunteered')
                )



                conn.commit()

            except Exception as e:
                print(f"Database error: {e}")

            finally:
                cursor.close()
                conn.close()

        respsonse = client.get("/api/events/volunteer-performance",headers={"Authorization": f"Bearer {access_token_admin}"})
        assert respsonse.status_code == 200

    def test_get_unauthorized(self,access_token_volunteer,client):
        with client.application.app_context():
            conn = None
            cursor = None

            try:
                # Establish connection
                conn = get_db()

                # Create cursor
                cursor = conn.cursor()


                # Populate database with test data
                sql = """
                INSERT INTO eventdetails (
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
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                values = (
                    101,
                    'Health Awareness Campaign',
                    'Public Speaking',
                    '',
                    'Connecticut',
                    'detroit',
                    '98765',
                    'Medium',
                    'south fulton',
                    1,
                    'Raising awareness about health issues and promoting healthy lifestyles.',
                    '2025-08-06',
                    '2025-08-05 06:17:35',
                    'Completed',
                    1
                )

                cursor.execute(sql, values)

                conn.commit()

            except Exception as e:
                print(f"Database error: {e}")

            finally:
                cursor.close()
                conn.close()

        respsonse = client.get("/api/events/volunteer-performance",headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert respsonse.status_code == 403
 