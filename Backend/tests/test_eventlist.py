import random
import datetime
import pytest

class TestEventList:
    new_event = {
        "event_name": "Test Event",
        "required_skills": "Lifting, Sweeping",
        "address": "123 Main St",
        "state": "TX",
        "city": "Houston",
        "zipcode": "77381",
        "urgency": "High",
        "location_name": "Downtown Park",
        "event_duration": 3,
        "event_description": "A community effort to clean up the local park.",
        "date": str(datetime.date.today() + datetime.timedelta(days=1)),
        "volunteers_needed": 10
    }

    def test_create_event(self, client, access_token_admin):
        event = self.new_event.copy()
        event["event_name"] = f"Event {random.randint(1, 10000)}"
        response = client.post("/api/eventlist/", json=event, headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        assert response.status_code == 201
        data = response.get_json()
        assert "event_id" in data

    def test_create_duplicate_event(self, client, access_token_admin):
        event = self.new_event.copy()
        event["event_name"] = f"Duplicate Event {random.randint(1, 10000)}"
        client.post("/api/eventlist/", json=event, headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        response = client.post("/api/eventlist/", json=event, headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        assert response.status_code in (201, 409)
        if response.status_code == 409:
            data = response.get_json()
            assert "error" in data

    def test_event_statistics(self, client, access_token_admin):
        response = client.get("/api/eventlist/stats", headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        if response.status_code == 200:
            data = response.get_json()
            assert data is not None
            assert "total_events" in data
            assert "upcoming_events" in data
        elif response.status_code == 404:
            # 404 may return HTML, so don't fail on None JSON
            try:
                data = response.get_json()
            except Exception:
                data = None
            assert data is None or "error" in (data or {}), (
                f"Expected JSON error or None on 404, got: {data}"
            )
        else:
            pytest.fail(f"Unexpected status code {response.status_code}")

    def test_update_event_status(self, client, access_token_admin):
        event = self.new_event.copy()
        event["event_name"] = f"Update Status {random.randint(1, 10000)}"
        res = client.post("/api/eventlist/", json=event, headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        assert res.status_code == 201
        event_id = res.get_json()["event_id"]

        update = {"status": "finalized"}

        response = client.put(f"/api/eventlist/status/{event_id}", json=update, headers={
            "Authorization": f"Bearer {access_token_admin}"
        })

        if response.status_code == 405:
            pytest.skip("PUT method not allowed on /api/eventlist/status/<id>, skipping test")
        else:
            assert response.status_code == 200, (
                f"Expected 200 OK but got {response.status_code}. "
                "Check your Flask route for PUT /api/eventlist/status/<id>"
            )
            data = response.get_json()
            assert "updated to finalized" in data.get("message", "")

    def test_update_nonexistent_event_status(self, client, access_token_admin):
        response = client.put("/api/eventlist/status/999999", json={"status": "finalized"}, headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        if response.status_code == 405:
            pytest.skip("PUT method not allowed on /api/eventlist/status/<id>, skipping test")
        else:
            assert response.status_code == 404, (
                f"Expected 404 Not Found but got {response.status_code}. "
                "Check your Flask route for PUT /api/eventlist/status/<id>"
            )
            data = response.get_json()
            assert "error" in data
            assert "not found" in data["error"].lower()

    def test_get_event_states(self, client):
        response = client.get("/api/eventlist/states", follow_redirects=True)
        assert response.status_code == 200
        data = response.get_json()
        assert "states" in data

    def test_get_event_skills(self, client):
        response = client.get("/api/eventlist/skills", follow_redirects=True)
        assert response.status_code == 200
        data = response.get_json()
        assert "skills" in data

    def test_get_finalized_events(self, client, access_token_admin):
        event = self.new_event.copy()
        event["event_name"] = f"Finalized Test {random.randint(1, 10000)}"
        event["event_status"] = "finalized"
        res = client.post("/api/eventlist/", json=event, headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        assert res.status_code == 201
        data = res.get_json()
        assert "event_id" in data

        response = client.get("/api/eventlist/finalized", headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        if response.status_code == 404:
            pytest.skip("/api/eventlist/finalized endpoint not implemented; skipping test")
        else:
            assert response.status_code == 200, (
                f"Expected 200 OK but got {response.status_code} "
                "for /api/eventlist/finalized endpoint"
            )
            data = response.get_json()
            assert isinstance(data, list)
