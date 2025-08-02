import pytest
from flask_jwt_extended import decode_token
from api.db import get_db


def test_register_success(client, user_admin):
    response = client.post("/api/auth/register/", json=user_admin)
    assert response.status_code == 201
    assert response.get_json()["message"] == "Registration successful!"


def test_register_duplicate(client, user_admin):
    client.post("/api/auth/register/", json=user_admin)
    response = client.post("/api/auth/register/", json=user_admin)
    assert response.status_code == 400
    assert "already exists" in response.get_json()["message"]


def test_register_missing_fields(client):
    response = client.post("/api/auth/register/", json={"email": "no_password@example.com"})
    assert response.status_code == 400


def test_login_success(client, user_admin):
    client.post("/api/auth/register/", json=user_admin)
    # Manually insert verficaiton code and set verified to true
    with client.application.app_context():
        conn = get_db()
        cursor = conn.cursor()

        code = 1111
        verified = 1 # True
        email = user_admin["email"]
    
    try:
        cursor.execute(
            "INSERT INTO verification_codes (email, code, verified) VALUES (%s, %s, %s)",
            (email, code, verified)
        )
    except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data["tokens"]


def test_login_wrong_password(client, user_admin):
    client.post("/api/auth/register/", json=user_admin)
    # Manually insert verficaiton code and set verified to true
    with client.application.app_context():
        conn = get_db()
        cursor = conn.cursor()

        code = 1111
        verified = 1 # True
        email = user_admin["email"]
    
    try:
        cursor.execute(
            "INSERT INTO verification_codes (email, code, verified) VALUES (%s, %s, %s)",
            (email, code, verified)
        )
    except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()
    user_admin['password'] = "wrongpass"
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 401


def test_login_wrong_role(client, user_admin):
    client.post("/api/auth/register/", json=user_admin)
    # Manually insert verficaiton code and set verified to true
    with client.application.app_context():
        conn = get_db()
        cursor = conn.cursor()

        code = 1111
        verified = 1 # True
        email = user_admin["email"]
    
    try:
        cursor.execute(
            "INSERT INTO verification_codes (email, code, verified) VALUES (%s, %s, %s)",
            (email, code, verified)
        )
    except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()
    user_admin['role'] = "volunteer" if user_admin['role'] == "admin" else "admin"
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 401


def test_refresh_token(client, user_admin):
    client.post("/api/auth/register/", json=user_admin)
    # Manually insert verficaiton code and set verified to true
    with client.application.app_context():
        conn = get_db()
        cursor = conn.cursor()

        code = 1111
        verified = 1 # True
        email = user_admin["email"]
    
    try:
        cursor.execute(
            "INSERT INTO verification_codes (email, code, verified) VALUES (%s, %s, %s)",
            (email, code, verified)
        )
    except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()
    login = client.post("/api/auth/login/", json=user_admin)
    refresh_token = login.get_json()["tokens"]["refresh_token"]

    response = client.post(
        "/api/auth/refresh/",
        headers={"Authorization": f"Bearer {refresh_token}"}
    )
    assert response.status_code == 200
    assert "access_token" in response.get_json()


def test_delete_account(client, access_token_admin):
    response = client.delete(
        "/api/auth/delete/",
        headers={"Authorization": f"Bearer {access_token_admin}"}
    )
    assert response.status_code == 200
    assert "deleted successfully" in response.get_json()["message"]


def test_delete_nonexistent(client):
    
    token = "Invalid token that does not correspond to any existing user"

    response = client.delete(
        "/api/auth/delete/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code in [404, 500]


# class TestVerification:

#     def test_send_success(client,user_admin):
#         response = client.post("/api/auth/verifyEmail/", json=user_admin)

#         assert 