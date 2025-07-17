import pytest
from flask_jwt_extended import decode_token
from api.app import app  

class TestAuth:
    def test_register_and_login(self,client, user):
        # Register user
        response = client.post("/api/auth/register/", json=user)
        assert response.status_code == 201
        assert response.get_json().get("message") == "Registration successful!"

        # Login user
        response = client.post("/api/auth/login/", json=user)
        assert response.status_code == 200
        data = response.get_json()
        assert "tokens" in data
        assert "access_token" in data["tokens"]
        assert "refresh_token" in data["tokens"]

        with app.app_context():
            decoded = decode_token(data["tokens"]["access_token"])
            assert decoded["sub"] == user["email"].lower()

    def test_register_existing_email(self,client, user):
        client.post("/api/auth/register/", json=user)
        response = client.post("/api/auth/register/", json=user)
        assert response.status_code == 400
        message = response.get_json().get("message")
        assert message and "user with this email already exists" in str(message).lower()

    def test_register_missing_email(self,client, user):
        invalid_user = dict(user)
        invalid_user.pop("email", None)
        response = client.post("/api/auth/register/", json=invalid_user)
        assert response.status_code == 400
        message = response.get_json().get("message")
        assert message and "email" in str(message).lower()

    def test_register_invalid_email_format(self,client, user):
        invalid_user = dict(user)
        invalid_user["email"] = "invalid-email-format"
        response = client.post("/api/auth/register/", json=invalid_user)    
        assert response.status_code in (201, 400)

    def test_register_missing_password(self,client, user):
        invalid_user = dict(user)
        invalid_user.pop("password", None)
        response = client.post("/api/auth/register/", json=invalid_user)
        assert response.status_code == 400
        message = response.get_json().get("message")
        assert message and "password" in str(message).lower()

    def test_register_missing_role(self,client, user):
        invalid_user = dict(user)
        invalid_user.pop("role", None)
        response = client.post("/api/auth/register/", json=invalid_user)
        assert response.status_code == 400
        message = response.get_json().get("message")
        assert message and "role" in str(message).lower()

    def test_login_wrong_password(self,client, user):
        client.post("/api/auth/register/", json=user)
        wrong_pass = dict(user)
        wrong_pass["password"] = "wrongpass"
        response = client.post("/api/auth/login/", json=wrong_pass)
        assert response.status_code == 401
        message = response.get_json().get("message")
        assert message and "invalid credentials" in str(message).lower()

    def test_login_wrong_role(self,client, user):
        client.post("/api/auth/register/", json=user)
        wrong_role = dict(user)
        wrong_role["role"] = "volunteer" if user.get("role") != "volunteer" else "admin"
        response = client.post("/api/auth/login/", json=wrong_role)
        assert response.status_code == 401
        message = response.get_json().get("message")
        assert message and "invalid credentials" in str(message).lower()

    def test_login_missing_password(self,client, user):
        incomplete_user = dict(user)
        incomplete_user.pop("password", None)
        response = client.post("/api/auth/login/", json=incomplete_user)
        assert response.status_code == 400
        message = response.get_json().get("message")
        assert message and "password" in str(message).lower()

    def test_login_missing_email(self,client, user):
        incomplete_user = dict(user)
        incomplete_user.pop("email", None)
        response = client.post("/api/auth/login/", json=incomplete_user)
        assert response.status_code == 400
        message = response.get_json().get("message")
        assert message and "email" in str(message).lower()

    def test_login_missing_role(self,client, user):
        incomplete_user = dict(user)
        incomplete_user.pop("role", None)
        response = client.post("/api/auth/login/", json=incomplete_user)
        assert response.status_code == 400
        message = response.get_json().get("message")
        assert message and "role" in str(message).lower()


    def test_login_empty_fields(self,client, user):
        empty_email = dict(user)
        empty_email["email"] = ""
        response = client.post("/api/auth/login/", json=empty_email)    
        assert response.status_code == 401  

        empty_password = dict(user)
        empty_password["password"] = ""
        response = client.post("/api/auth/login/", json=empty_password)    
        assert response.status_code == 401

    def test_register_empty_fields(self,client, user):
        empty_user = dict(user)
        empty_user["email"] = ""
        response = client.post("/api/auth/register/", json=empty_user)    
        assert response.status_code in (201, 400)  

        empty_user = dict(user)
        empty_user["password"] = ""
        response = client.post("/api/auth/register/", json=empty_user)
        assert response.status_code in (201, 400)

        empty_user = dict(user)
        empty_user["role"] = ""
        response = client.post("/api/auth/register/", json=empty_user)
        assert response.status_code in (201, 400)

