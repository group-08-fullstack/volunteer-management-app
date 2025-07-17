# import pytest
# from flask import Flask
# from flask_jwt_extended import create_access_token
# from api.app import app 

# @pytest.fixture
# def client():
#     app.config['TESTING'] = True
#     with app.test_client() as client:
#         yield client

# @pytest.fixture
# def access_token():
#     return create_access_token(identity="testuser@example.com")

class TestEventList:

    def test_get_events_unauthorized(self,client):
        response = client.get("/api/eventlist/")
        assert response.status_code == 500  # Unauthorized

    def test_get_events_authorized(self,client, access_token):
        response = client.get("/api/eventlist/", headers={
            "Authorization": f"Bearer {access_token}"
        })
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert all("event" in event for event in data)

    def test_create_event(self,client, access_token):
        new_event = {
            "event": "Community Cleanup",
            "date": "July 25, 2025",
            "time": "10:00 AM - 1:00 PM",
            "location": "Downtown Park",
            "volunteers": 10
        }
        response = client.post("/api/eventlist/", json=new_event, headers={
            "Authorization": f"Bearer {access_token}"
        })
        assert response.status_code == 201
        json_data = response.get_json()
        assert json_data["message"] == "Event created successfully!"
        assert "event" in json_data
        assert json_data["event"]["event"] == new_event["event"]

    def test_create_event_missing_fields(self,client, access_token):
        incomplete_event = {
            "event": "Missing Fields",
            "date": "August 1, 2025"
        }
        response = client.post("/api/eventlist/", json=incomplete_event, headers={
            "Authorization": f"Bearer {access_token}"
        })
        assert response.status_code == 400 

    def test_delete_event(self,client, access_token):
        response = client.post("/api/eventlist/", json={
            "event": "To Be Deleted",
            "date": "August 10, 2025",
            "time": "2:00 PM - 4:00 PM",
            "location": "Test Site",
            "volunteers": 5
        }, headers={"Authorization": f"Bearer {access_token}"})
        
        assert response.status_code == 201
        event_id = response.get_json()["event"]["id"]

        response = client.delete(f"/api/eventlist/{event_id}", headers={
            "Authorization": f"Bearer {access_token}"
        })
        assert response.status_code == 200
        assert f"Event {event_id} deleted." in response.get_json()["message"]
