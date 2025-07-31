import pytest
from flask_jwt_extended import decode_token

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
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data["tokens"]


def test_login_wrong_password(client, user_admin):
    client.post("/api/auth/register/", json=user_admin)
    user_admin['password'] = "wrongpass"
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 401


def test_login_wrong_role(client, user_admin):
    client.post("/api/auth/register/", json=user_admin)
    user_admin['role'] = "volunteer" if user_admin['role'] == "admin" else "admin"
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 401


def test_refresh_token(client, user_admin):
    client.post("/api/auth/register/", json=user_admin)
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
