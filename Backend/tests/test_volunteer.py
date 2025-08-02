import pytest
from unittest.mock import patch


@pytest.fixture
def auth_headers_volunteer(access_token_volunteer):
    return {"Authorization": f"Bearer {access_token_volunteer}"}


# Helper to mock DB cursor.fetchone/fetchall responses
class DummyCursor:
    def __init__(self, fetchone_responses=None, fetchall_responses=None):
        self._fetchone_responses = fetchone_responses or []
        self._fetchall_responses = fetchall_responses or []
        self._fetchone_index = 0
        self._fetchall_index = 0
        self.closed = False

    def execute(self, query, params=None):
        pass

    def fetchone(self):
        if self._fetchone_index < len(self._fetchone_responses):
            result = self._fetchone_responses[self._fetchone_index]
            self._fetchone_index += 1
            return result
        return None

    def fetchall(self):
        if self._fetchall_index < len(self._fetchall_responses):
            result = self._fetchall_responses[self._fetchall_index]
            self._fetchall_index += 1
            return result
        return []

    def close(self):
        self.closed = True


class DummyConn:
    def cursor(self):
        return self.cursor_instance

    def close(self):
        pass


# Tests for VolunteerDashboard
@patch("api.volunteer.get_db")
def test_dashboard_success(mock_get_db, client, auth_headers_volunteer):
    # Mock DB returns
    dummy_cursor = DummyCursor(
        fetchone_responses=[
            {"user_id": 1},  # user_id from usercredentials
            {"full_name": "Test Volunteer", "date_of_birth": None, "phone_number": None, "city": None, "state_name": None},  # profile
            {"events_completed": 5, "total_hours": 12.5},  # stats
            {"upcoming_count": 2}  # upcoming count
        ],
        fetchall_responses=[
            [  # recent_history
                {
                    "id": 101,
                    "event": "Cleanup",
                    "date": None,
                    "hours": 3,
                    "location": "Park",
                    "participation_status": "Volunteered",
                    "performance": 4.5,
                }
            ],
            [  # upcoming_events
                {
                    "id": 201,
                    "event": "Food Drive",
                    "date": None,
                    "event_duration": 3,
                    "location": "Community Center",
                    "volunteers_needed": 10,
                    "event_status": "Open",
                    "participation_status": "Registered",
                }
            ]
        ],
    )
    dummy_conn = DummyConn()
    dummy_conn.cursor_instance = dummy_cursor
    mock_get_db.return_value = dummy_conn

    response = client.get("/api/volunteer/dashboard/", headers=auth_headers_volunteer)
    assert response.status_code == 200
    json_data = response.json
    assert "volunteer_info" in json_data
    assert json_data["volunteer_info"]["name"] == "Test Volunteer"
    assert "recent_history" in json_data
    assert "upcoming_events" in json_data


@patch("api.volunteer.get_db")
def test_dashboard_user_not_found(mock_get_db, client, auth_headers_volunteer):
    dummy_cursor = DummyCursor(fetchone_responses=[None])
    dummy_conn = DummyConn()
    dummy_conn.cursor_instance = dummy_cursor
    mock_get_db.return_value = dummy_conn

    response = client.get("/api/volunteer/dashboard/", headers=auth_headers_volunteer)
    assert response.status_code == 404
    assert "error" in response.json


@patch("api.volunteer.get_db")
def test_history_all(mock_get_db, client, auth_headers_volunteer):
    dummy_cursor = DummyCursor(
        fetchone_responses=[
            {"user_id": 1}
        ],
        fetchall_responses=[
            [
                {
                    "id": 1,
                    "event": "Event 1",
                    "date": None,
                    "hours": 3,
                    "location": "Loc",
                    "description": "Desc",
                    "status": "Volunteered",
                    "rating": 5,
                    "notes": ""
                },
                {
                    "id": 2,
                    "event": "Event 2",
                    "date": None,
                    "hours": 2,
                    "location": None,
                    "description": "Desc2",
                    "status": "Registered",
                    "rating": None,
                    "notes": "Some note"
                }
            ]
        ],
    )
    dummy_conn = DummyConn()
    dummy_conn.cursor_instance = dummy_cursor
    mock_get_db.return_value = dummy_conn

    response = client.get("/api/volunteer/history/", headers=auth_headers_volunteer)
    assert response.status_code == 200
    assert "history" in response.json
    assert len(response.json["history"]) == 2


@patch("api.volunteer.get_db")
def test_upcoming_events_filtered(mock_get_db, client, auth_headers_volunteer):
    dummy_cursor = DummyCursor(
        fetchone_responses=[
            {"user_id": 1},
            {"current_volunteers": 5},
        ],
        fetchall_responses=[
            [
                {
                    "id": 1,
                    "event": "Event 1",
                    "date": None,
                    "event_duration": 2,
                    "location": "Loc",
                    "description": "Desc",
                    "volunteers_needed": 10,
                    "event_status": "Open",
                    "participation_status": "Registered",
                }
            ]
        ],
    )
    dummy_conn = DummyConn()
    dummy_conn.cursor_instance = dummy_cursor
    mock_get_db.return_value = dummy_conn

    response = client.get("/api/volunteer/events/", headers=auth_headers_volunteer)
    assert response.status_code == 200
    assert "events" in response.json
    assert response.json["events"][0]["volunteers"] == 5
    assert response.json["events"][0]["maxVolunteers"] == 10


@patch("api.volunteer.get_db")
def test_profile_success(mock_get_db, client, auth_headers_volunteer):
    dummy_cursor = DummyCursor(
        fetchone_responses=[
            {"user_id": 1},
            {"full_name": "John Doe", "city": "CityX", "state_name": "StateY", "preferences": "Pref1"},
            {"events_completed": 4, "total_hours": 20, "average_rating": 4.2},
        ],
        fetchall_responses=[
            [{"skill_name": "First Aid"}, {"skill_name": "Cooking"}]
        ]
    )
    dummy_conn = DummyConn()
    dummy_conn.cursor_instance = dummy_cursor
    mock_get_db.return_value = dummy_conn

    response = client.get("/api/volunteer/profile/", headers=auth_headers_volunteer)
    assert response.status_code == 200
    json_data = response.json
    assert "volunteer_info" in json_data
    assert "skills" in json_data["volunteer_info"]
    assert "First Aid" in json_data["volunteer_info"]["skills"]


@patch("api.volunteer.get_db")
def test_event_detail_found(mock_get_db, client, auth_headers_volunteer):
    dummy_cursor = DummyCursor(
        fetchone_responses=[
            {
                "id": 1,
                "event": "Event 1",
                "date": None,
                "event_duration": 2,
                "location": "Loc",
                "description": "Desc",
                "volunteers_needed": 10,
                "event_status": "Open",
                "urgency": "High",
                "required_skills": "Skill1,Skill2"
            },
            {"current_volunteers": 3},
            {"user_id": 1},
            {"participation_status": "Registered"}
        ]
    )
    dummy_conn = DummyConn()
    dummy_conn.cursor_instance = dummy_cursor
    mock_get_db.return_value = dummy_conn

    response = client.get("/api/volunteer/events/1/", headers=auth_headers_volunteer)
    assert response.status_code == 200
    assert response.json["id"] == 1
    assert "participation_status" in response.json


@patch("api.volunteer.get_db")
def test_event_detail_not_found(mock_get_db, client, auth_headers_volunteer):
    dummy_cursor = DummyCursor(
        fetchone_responses=[None]
    )
    dummy_conn = DummyConn()
    dummy_conn.cursor_instance = dummy_cursor
    mock_get_db.return_value = dummy_conn

    response = client.get("/api/volunteer/events/999/", headers=auth_headers_volunteer)
    assert response.status_code == 404
    assert "error" in response.json


