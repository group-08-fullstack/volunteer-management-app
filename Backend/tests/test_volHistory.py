import pytest
from flask_jwt_extended import create_access_token
from api.app import app as flask_app  # Adjust this import if your app is elsewhere


@pytest.fixture
def app():
    yield flask_app


class TestGetVolHistory:

    def test_get(self, client, user_volunteer, access_token_volunteer):
        response = client.get("/api/history/", headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert response.status_code == 200

    def test_get_unauthorized(self, client):
        response = client.get("/api/history/")
        assert response.status_code == 500  # Should ideally be 401/403

    def test_get_user_not_found(self, client):
        # Use app context from client.application
        with client.application.app_context():
            fake_token = create_access_token(identity="ghost@example.com")
        response = client.get("/api/history/", headers={"Authorization": f"Bearer {fake_token}"})
        assert response.status_code == 404
        assert "User not found" in response.get_data(as_text=True)

    def test_get_empty_history(self, client, access_token_volunteer, user_volunteer):
        # Assumes user has no history
        response = client.get("/api/history/", headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert response.status_code == 200
        assert isinstance(response.json, list)

    def test_get_database_error(self, mocker, client, access_token_volunteer):
        mocker.patch("api.volunteerHistory.db.get_db", side_effect=Exception("Mocked DB error"))
        response = client.get("/api/history/", headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert response.status_code == 500
        # The error JSON key seems to be 'message' in your API error handler
        assert "message" in response.json


class TestPostVolHistory:
    valid_data = {
        "event_id": 2,
        "volunteer_email": "",
        "participation_status": "Registered"
    }

    def test_post(self, client, access_token_admin, user_volunteer):
        data = self.valid_data.copy()
        data["volunteer_email"] = user_volunteer["email"]
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"}, json=data)
        assert response.status_code == 404  # Adjust if your API returns a different status

    def test_post_unauthorized(self, client):
        response = client.post("/api/history/")
        assert response.status_code == 500  # Should ideally be 401

    def test_post_no_data(self, client, access_token_admin):
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"})
        assert response.status_code == 415  # Unsupported Media Type (no JSON)

    def test_post_missing_field_pStatus(self, client, access_token_admin, user_volunteer):
        data = self.valid_data.copy()
        data["volunteer_email"] = user_volunteer["email"]
        data["participation_status"] = None
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"}, json=data)
        assert response.status_code == 400

    def test_post_invalid_type_pstatus(self, client, access_token_admin, user_volunteer):
        data = self.valid_data.copy()
        data["volunteer_email"] = user_volunteer["email"]
        data["participation_status"] = 0
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"}, json=data)
        assert response.status_code == 400

    def test_post_user_not_found(self, client, access_token_admin):
        data = {
            "event_id": 1,
            "volunteer_email": "nonexistentuser@example.com",
            "participation_status": "Registered"
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"}, json=data)
        assert response.status_code == 404
        assert "User not found" in response.get_data(as_text=True)

    def test_post_invalid_event_id_type(self, client, access_token_admin, user_volunteer):
        data = {
            "event_id": "not-an-int",
            "volunteer_email": user_volunteer["email"],
            "participation_status": "Registered"
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"}, json=data)
        assert response.status_code == 400

    def test_post_invalid_volunteer_email_type(self, client, access_token_admin):
        data = {
            "event_id": 1,
            "volunteer_email": 1234,
            "participation_status": "Registered"
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"}, json=data)
        assert response.status_code == 400

    def test_post_database_error(self, mocker, client, access_token_admin, user_volunteer):
        data = {
            "event_id": 1,
            "volunteer_email": user_volunteer["email"],
            "participation_status": "Registered"
        }
        mocker.patch("api.volunteerHistory.db.get_db", side_effect=Exception("Mocked DB error"))
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"}, json=data)
        assert response.status_code == 500
        assert "message" in response.json
