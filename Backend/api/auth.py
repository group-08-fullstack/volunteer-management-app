from flask_restful import Resource, reqparse
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    get_jwt_identity, jwt_required
)
from passlib.hash import sha256_crypt
from . import db  
from datetime import datetime
import pytz

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
                return {"message": "User with this email already exists."}, 400
            
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
                return {"message": "Invalid credentials or role"}, 401
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
            cursor.execute("SELECT * FROM UserCredentials WHERE email = %s", (email,))
            if not cursor.fetchone():
                return {"message": "User not found."}, 404

            cursor.execute("DELETE FROM UserCredentials WHERE email = %s", (email,))
            conn.commit()
            return {"message": f"Account for {email} deleted successfully."}, 200
        except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
        finally:
            cursor.close()
            conn.close()
