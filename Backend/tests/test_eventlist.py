import random

class TestEventList:
    new_event = {
            "event_name": "Community Cleanup",
            "required_skills": "Lifting, Sweeping",
            "address": "123 Main St",
            "state": "TX",
            "city": "Houston",
            "zipcode": "77381",
            "urgency": "High",
            "location_name": "Downtown Park",
            "event_duration": 3,
            "event_description": "A community effort to clean up the local park.",
            "date": "2025-07-31",
            "volunteers_needed": 10
        }

    def test_get_events_unauthorized(self,client):
        response = client.get("/api/eventlist/")
        assert response.status_code == 500  # Unauthorized

    def test_get_events_authorized(self,client, access_token_admin):
        response = client.get("/api/eventlist/", headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, dict)
        assert "events" in data and isinstance(data["events"], list)
        assert "total" in data and isinstance(data["total"], int)

    def test_create_event(self,client, access_token_admin):
        event = self.new_event.copy()

        response = client.post("/api/eventlist/", json=event, headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        assert response.status_code == 201
        json_data = response.get_json()
        assert json_data["message"] == "Event created successfully!"
        assert "event_id" in json_data
        assert "message" in json_data

    def test_create_event_missing_fields(self,client, access_token_admin):
        incomplete_event = {
            "event_name": "Missing Fields",
            "date": "August 1, 2025"
        }
        response = client.post("/api/eventlist/", json=incomplete_event, headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        assert response.status_code == 400 

    def test_delete_event(self,client, access_token_admin):
        event = self.new_event.copy()

        response = client.post("/api/eventlist/", json= event, headers={"Authorization": f"Bearer {access_token_admin}"})
        
        assert response.status_code == 201
        event_id = response.get_json()["event_id"]

        response = client.delete(f"/api/eventlist/{event_id}", headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        assert response.status_code == 200
        assert f"Event {event_id} deleted successfully." in response.get_json()["message"]
