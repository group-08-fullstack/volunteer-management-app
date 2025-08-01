from flask import request
from flask_restful import Resource, reqparse
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    get_jwt_identity, jwt_required
)
from passlib.hash import sha256_crypt
from . import db  
from datetime import datetime
import pytz
import smtplib,ssl
from email.message import EmailMessage
import random
import os

# Request parser
parser = reqparse.RequestParser()
parser.add_argument('email', type=str, required=True, help="Email cannot be blank!")
parser.add_argument('password', type=str, required=True, help="Password cannot be blank!")
parser.add_argument('role', type=str, choices=('admin', 'volunteer'), required=True, help="Role must be admin or volunteer")


class Register(Resource):
    def post(self):
        args = parser.parse_args()
        email = args['email'].lower()
        password = sha256_crypt.hash(args['password'])
        role = args['role']

        
        central = pytz.timezone('US/Central')
        central_time = datetime.now(central)

        conn = db.get_db()
        cursor = conn.cursor()

        try:
            cursor.execute("SELECT * FROM UserCredentials WHERE email = %s", (email,))
            if cursor.fetchone():
                # Check if account has been verified
                cursor.execute("SELECT verified FROM verification_codes WHERE email = %s", (email,))
                result = cursor.fetchone()

                if result and result["verified"] == 1: # boolean stored as 1/0 in MySQL
                    return {"message": "User with this email already exists and is verified."}, 400
                else:
                    return {"message": "User with this email already exists, but is not verified."}, 400
            else:
                cursor.execute(
                    "INSERT INTO UserCredentials (email, password_hash, role, created_at) VALUES (%s, %s, %s, %s)",
                    (email, password, role, central_time)
                )
                conn.commit()
            return {"message": "Registration successful!"}, 201
        except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
        finally:
            cursor.close()
            conn.close()


class Login(Resource):
    def post(self):
        args = parser.parse_args()
        email = args['email'].lower()
        password = args['password']
        role = args['role']

        conn = db.get_db()
        cursor = conn.cursor()

        try:
            cursor.execute(
                "SELECT user_id, email, password_hash, role FROM UserCredentials WHERE email = %s",
                (email,)
            )

            user = cursor.fetchone()
            if user:
                # Check if account has been verified
                cursor.execute("SELECT verified FROM verification_codes WHERE email = %s", (email,))
                result = cursor.fetchone()

                if result and result["verified"] == 1:

                    if user and sha256_crypt.verify(password, user['password_hash']) and user['role'] == role:
                        user_info = {
                            "user_id": user["user_id"],
                            "email": user["email"],
                            "role": user["role"]
                        }
                        access_token = create_access_token(identity=user["email"])
                        refresh_token = create_refresh_token(identity=user["email"])
                        return {
                            "message": "Login successful",
                            "tokens": {
                                "access_token": access_token,
                                "refresh_token": refresh_token
                            },
                            "user": user_info
                        }, 200
                    else:
                        return {"message": "Invalid login information"}, 401
                else:
                    return{"message" : "Account not verified. Please proceed to the registration page to verify your account."}
            else:
                return {"message": "Account does not exist"}, 401
        except Exception as e:
            return {"error": str(e)}, 500
        finally:
            cursor.close()
            conn.close()



class RefreshToken(Resource):

    @jwt_required(refresh=True)
    def post(self):
        identity = get_jwt_identity()

        new_access_token = create_access_token(identity=identity)
        return {"message": "New token created", "access_token": new_access_token}, 200


class DeleteAccount(Resource):
    @jwt_required()
    def delete(self):
        
        email = get_jwt_identity()

        conn = db.get_db()
        cursor = conn.cursor()

        try:
            
            cursor.execute("SELECT user_id FROM UserCredentials WHERE email = %s", (email,))
            user = cursor.fetchone()
            if not user:
                return {"message": "User not found."}, 404
            
            user_id = user['user_id']

           
            cursor.execute("DELETE FROM userprofile WHERE volunteer_id = %s", (user_id,))

            # Delete user credentials
            cursor.execute("DELETE FROM UserCredentials WHERE user_id = %s", (user_id,))

            
            conn.commit()
            return {"message": f"Account and profile for {email} deleted successfully."}, 200
        
        except Exception as e:
            
            conn.rollback()
            return {"error": str(e)}, 500
        
        finally:
           
            cursor.close()
            conn.close()


class EmailVerification(Resource):

    def post(self):
        args = parser.parse_args()
        user_email = args['email'].lower()

        conn = db.get_db()
        cursor = conn.cursor()

        # Check if email is already registered
        try:
            cursor.execute("SELECT * FROM verification_codes WHERE email = %s", (user_email,))
            # Do not generate new code just return for frontend to prompt user
            if cursor.fetchone():
                return {'message': 'A code has already been issued. Please refer to your previous email'}, 200
               
        except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500

        # Generate 4 digit code
        code = random.randint(1000, 9999)  

        # Store in database email -> code
        try:
            cursor.execute("INSERT INTO verification_codes (email,code) VALUES (%s,%s)", (user_email, code))
            conn.commit()

            # Create email message
            msg = EmailMessage()
            msg['Subject'] = 'Email Verification'
            msg['From'] = 'your@gmail.com'
            msg['To'] = user_email
            msg.set_content(f"Your verification code is {code}")

            # Setup config for server connection
            port = 465
            smtp_server = "smtp.gmail.com"
            sender_email = "volunteerscheduleplatform@gmail.com"
            sender_password = os.getenv("email_password")

            # Create connection and send message
            context = ssl.create_default_context()
            try:
                with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
                    server.login(sender_email, sender_password)
                    server.send_message(msg)
                return {'message': 'Verification code sent successfully'}, 200
            except Exception as e:
                return {'message': str(e)}, 500

        except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
        finally:
            cursor.close()
            conn.close()




class EmailCodeConfirmation(Resource):
    def post(self):
        data = request.get_json()
        email = data.get("email", "").lower()
        code = data.get("code")

        # Setup connection and cursor
        conn = db.get_db()
        cursor = conn.cursor()

        # Select code from database
        try:
            cursor.execute("SELECT code FROM verification_codes WHERE email=%s", (email,))
            result = cursor.fetchone()


            if result["code"] == code:
                try:
                    cursor.execute(
                        "UPDATE verification_codes SET verified = 1 WHERE email = %s",
                        (email,)
                    )
                    conn.commit()
                    return {'message': 'Verified'}, 200
                except Exception as e:
                    conn.rollback()
                    return {"error": str(e)}, 500
                
            else:
                return {'message': 'Invalid code'}, 400
            
        except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
        finally:
            cursor.close()
            conn.close()
            


