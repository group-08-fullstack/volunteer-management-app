import pytest


@pytest.fixture
def auth_headers_volunteer(access_token_volunteer):
    return {"Authorization": f"Bearer {access_token_volunteer}"}


def test_dashboard(client, auth_headers_volunteer):
    res = client.get("/api/volunteer/dashboard/", headers=auth_headers_volunteer)
    assert res.status_code == 200
    assert "volunteer_info" in res.json


def test_history_all(client, auth_headers_volunteer):
    res = client.get("/api/volunteer/history/", headers=auth_headers_volunteer)
    assert res.status_code == 200
    assert "history" in res.json


def test_history_filtered(client, auth_headers_volunteer):
    res = client.get("/api/volunteer/history/?status=Completed&limit=2", headers=auth_headers_volunteer)
    assert res.status_code == 200
    assert len(res.json["history"]) <= 2


def test_upcoming_all(client, auth_headers_volunteer):
    res = client.get("/api/volunteer/events/", headers=auth_headers_volunteer)
    assert res.status_code == 200
    assert "events" in res.json


def test_upcoming_filtered(client, auth_headers_volunteer):
    from api.volunteer import volunteer_dashboard_data
    for e in volunteer_dashboard_data["upcoming_events"]:
        e["registration_status"] = "Available"
    res = client.get("/api/volunteer/events/?status=Available", headers=auth_headers_volunteer)
    assert res.status_code == 200
    assert all(e["registration_status"] == "Available" for e in res.json["events"])


def test_profile(client, auth_headers_volunteer):
    res = client.get("/api/volunteer/profile/", headers=auth_headers_volunteer)
    assert res.status_code == 200
    assert "achievements" in res.json


def test_event_detail_found(client, auth_headers_volunteer):
    res = client.get("/api/volunteer/events/1/", headers=auth_headers_volunteer)
    assert res.status_code == 200
    assert "id" in res.json


def test_event_detail_not_found(client, auth_headers_volunteer):
    res = client.get("/api/volunteer/events/999/", headers=auth_headers_volunteer)
    assert res.status_code == 404
    assert "error" in res.json


def test_register_event_success(client, auth_headers_volunteer):
    from api.volunteer import volunteer_dashboard_data
    event = volunteer_dashboard_data["upcoming_events"][0]
    event["registration_status"] = "Available"
    event["volunteers"] = 2
    event["maxVolunteers"] = 10

    res = client.post(f"/api/volunteer/events/{event['id']}/register/", headers=auth_headers_volunteer)
    assert res.status_code == 200
    assert res.json["event"]["registration_status"] == "Registered"


def test_register_event_already_registered(client, auth_headers_volunteer):
    from api.volunteer import volunteer_dashboard_data
    event = volunteer_dashboard_data["upcoming_events"][1]
    event["registration_status"] = "Registered"
    event["volunteers"] = 2
    event["maxVolunteers"] = 10

    res = client.post(f"/api/volunteer/events/{event['id']}/register/", headers=auth_headers_volunteer)
    assert res.status_code == 400
    assert "Already registered" in res.json["error"]


def test_register_event_full(client, auth_headers_volunteer):
    from api.volunteer import volunteer_dashboard_data
    event = volunteer_dashboard_data["upcoming_events"][2]
    event["registration_status"] = "Available"
    event["volunteers"] = event["maxVolunteers"] = 10

    res = client.post(f"/api/volunteer/events/{event['id']}/register/", headers=auth_headers_volunteer)
    assert res.status_code == 400
    assert "Event is full" in res.json["error"]


def test_unregister_event_success(client, auth_headers_volunteer):
    from api.volunteer import volunteer_dashboard_data
    event = volunteer_dashboard_data["upcoming_events"][3]
    event["registration_status"] = "Registered"
    event["volunteers"] = 3

    res = client.delete(f"/api/volunteer/events/{event['id']}/register/", headers=auth_headers_volunteer)
    assert res.status_code == 200
    assert "Successfully unregistered" in res.json["message"]


def test_unregister_event_not_registered(client, auth_headers_volunteer):
    from api.volunteer import volunteer_dashboard_data
    event = volunteer_dashboard_data["upcoming_events"][4]
    event["registration_status"] = "Available"
    event["volunteers"] = 2

    res = client.delete(f"/api/volunteer/events/{event['id']}/register/", headers=auth_headers_volunteer)
    assert res.status_code == 400
    assert "Not registered" in res.json["error"]
