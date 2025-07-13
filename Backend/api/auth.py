from flask_restful import Resource, reqparse
from flask_jwt_extended import create_access_token, create_refresh_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask import jsonify

users = []

# Parser for registration and login requests
parser = reqparse.RequestParser()
parser.add_argument('email', type=str, required=True, help="Email cannot be blank!")
parser.add_argument('password', type=str, required=True, help="Password cannot be blank!")
parser.add_argument('role', type=str, choices=('admin', 'volunteer'), required=True, help="Role must be admin or volunteer")

class Register(Resource):
    def post(self):
        args = parser.parse_args()
        email = args['email'].lower()
        password = args['password']
        role = args['role']

        # Check if user already exists
        if any(user['email'] == email for user in users):
            return {"message": "User with this email already exists."}, 400

        # Add new user 
        users.append({
            "email": email,
            "password": password,
            "role": role
        })
        return {"message": "Registration successful!"}, 201

class Login(Resource):
    def post(self):
        args = parser.parse_args()
        email = args['email'].lower()
        password = args['password']
        role = args['role']

        # Find user by email, password, and role
        user = next((u for u in users if u['email'] == email and u['password'] == password and u['role'] == role), None)
        if user:
            # Return user JWT token
            user_info = {k: v for k, v in user.items() if k != 'password'}
            access_token = create_access_token(identity=user_info["email"])
            refresh_token = create_refresh_token(identity=user_info["email"])
            return {"message": "Login successful", "tokens" : {"access_token" : access_token, "refresh_token" : refresh_token} , "user": user_info}, 200
        else:
            return {"message": "Invalid credentials or role"}, 401
        

# API endpoint to create new access token using refresh token

class RefreshToken(Resource):
    
    @jwt_required(refresh=True)
    def post(self):
        identity = get_jwt_identity()

        new_access_token = create_access_token(identity=identity)

        return jsonify({"message": "Login successful", "access_token" : new_access_token}, 200)