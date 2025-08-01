import datetime
import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from flask_jwt_extended import JWTManager

from api.matching import MatchVolunteer, FilteredVolunteers, FinalizeEvent, VolunteerEventAssignments


class DummyCursor:
    def __init__(self):
        self.execute_calls = []
        self.fetchone_returns = []
        self.fetchall_returns = []
        self.current_fetchone_index = 0
        self.current_fetchall_index = 0
        self.rowcount = 1
        self.closed = False

    def execute(self, query, params=None):
        self.execute_calls.append((query, params))

    def fetchone(self):
        if self.current_fetchone_index < len(self.fetchone_returns):
            ret = self.fetchone_returns[self.current_fetchone_index]
            self.current_fetchone_index += 1
            return ret
        return None

    def fetchall(self):
        if self.current_fetchall_index < len(self.fetchall_returns):
            ret = self.fetchall_returns[self.current_fetchall_index]
            self.current_fetchall_index += 1
            return ret
        return []

    def close(self):
        self.closed = True


class DummyConnection:
    def __init__(self, cursor):
        self._cursor = cursor
        self.committed = False
        self.rolled_back = False
        self.closed = False

    def cursor(self):
        return self._cursor

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def close(self):
        self.closed = True


@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    JWTManager(app)

    from flask_restful import Api
    api = Api(app)
    api.add_resource(MatchVolunteer, '/matchvolunteer')
    api.add_resource(FilteredVolunteers, '/filteredvolunteers/<int:event_id>')
    api.add_resource(FinalizeEvent, '/finalizeevent/<int:event_id>')
    api.add_resource(VolunteerEventAssignments, '/volunteereventassignments')

    return app


@pytest.fixture
def client(app):
    return app.test_client()


@patch('api.matching.db.get_db')
def test_get_pending_events_success(mock_get_db, client):
    dummy_events = [
        {
            'event_id': 1,
            'event_name': 'Test Event',
            'required_skills': 'skill1, skill2',
            'address': '123 Main St',
            'state': 'CA',
            'city': 'LA',
            'zipcode': '90001',
            'urgency': 'High',
            'location_name': 'Test Location',
            'event_duration': '2 hours',
            'event_description': 'Desc',
            'date': '2025-08-01',
            'volunteers_needed': 5,
            'event_status': 'Pending'
        }
    ]
    dummy_cursor = DummyCursor()
    dummy_cursor.fetchall_returns = [dummy_events]
    dummy_conn = DummyConnection(dummy_cursor)
    mock_get_db.return_value = dummy_conn

    with client.application.app_context():
        with client.application.test_request_context():
            from flask_jwt_extended import create_access_token
            access_token = create_access_token(identity="testuser")

    response = client.get('/matchvolunteer', headers={'Authorization': f'Bearer {access_token}'})

    if response.status_code != 200:
        print("ERROR RESPONSE DATA:", response.data.decode())
    assert response.status_code == 200

    data = response.get_json()
    assert "events" in data
    assert len(data["events"]) == 1
    assert data["events"][0]["event_name"] == "Test Event"
    # Make sure skills parsed into list
    assert data["events"][0]["required_skills"] == ["skill1", "skill2"]


@patch('api.matching.db.get_db')
def test_post_match_volunteer_success(mock_get_db, client):
    volunteer_row = {
        'user_id': 1,
        'email': 'volunteer@example.com',
        'full_name': 'Test Volunteer',
        'date_of_birth': None,
        'phone_number': '1234567890',
        'city': 'Los Angeles',
        'state_name': 'CA'
    }
    event_row = {
        'event_id': 2,
        'event_name': 'Test Event',
        'event_description': 'Desc',
        'date': '2025-08-01',
        'location_name': 'Loc',
        'urgency': 'High',
        'state': 'CA',
        'event_status': 'Pending',
        'volunteers_needed': 3
    }
    availability_rows = [{'date_available': '2025-08-01'}]

    dummy_cursor = DummyCursor()
    # We expect several fetchone and fetchall calls in sequence:
    # 1. fetchone -> volunteer_row
    # 2. fetchone -> event_row
    # 3. fetchall -> availability_rows
    # Further inserts/updates -> return None

    dummy_cursor.fetchone_returns = [volunteer_row, event_row, None, None]
    dummy_cursor.fetchall_returns = [availability_rows]
    dummy_conn = DummyConnection(dummy_cursor)

    def execute_side_effect(query, params=None):
        dummy_cursor.execute_calls.append((query, params))
        return None

    dummy_cursor.execute = MagicMock(side_effect=execute_side_effect)

    mock_get_db.return_value = dummy_conn

    with client.application.app_context():
        with client.application.test_request_context():
            from flask_jwt_extended import create_access_token
            access_token = create_access_token(identity="testuser")

    response = client.post('/matchvolunteer', json={
        "volunteer_email": "volunteer@example.com",
        "event_name": "Test Event"
    }, headers={'Authorization': f'Bearer {access_token}'})

    if response.status_code != 200:
        print("ERROR RESPONSE DATA:", response.data.decode())
    assert response.status_code == 200

    data = response.get_json()
    assert "message" in data
    assert "volunteer" in data
    assert data["volunteer"]["email"] == "volunteer@example.com"
    assert "event" in data
    assert data["event"]["name"] == "Test Event"


@patch('api.matching.db.get_db')
def test_filtered_volunteers_pending(mock_get_db, client):
    event_row = {
        'date': '2025-08-01',
        'state': 'CA',
        'volunteers_needed': 2
    }
    volunteer_rows = [
        {
            'email': 'vol1@example.com',
            'full_name': 'Volunteer One',
            'date_of_birth': None,
            'phone_number': '1234567890',
            'address1': 'Addr1',
            'city': 'LA',
            'state_name': 'CA',
            'zipcode': '90001',
            'preferences': '',
            'user_id': 1
        }
    ]
    dummy_cursor = DummyCursor()
    dummy_cursor.fetchone_returns = [event_row]
    dummy_cursor.fetchall_returns = [volunteer_rows]
    dummy_conn = DummyConnection(dummy_cursor)
    mock_get_db.return_value = dummy_conn

    with client.application.app_context():
        with client.application.test_request_context():
            from flask_jwt_extended import create_access_token
            access_token = create_access_token(identity="testuser")

    response = client.get('/filteredvolunteers/1', headers={'Authorization': f'Bearer {access_token}'})

    if response.status_code != 200:
        print("ERROR RESPONSE DATA:", response.data.decode())
    assert response.status_code == 200

    data = response.get_json()
    assert "volunteers" in data
    assert isinstance(data["volunteers"], list)
    assert len(data["volunteers"]) == 1
    assert data["volunteers"][0]["email"] == "vol1@example.com"


@patch('api.matching.db.get_db')
def test_finalize_event_success(mock_get_db, client):
    dummy_cursor = DummyCursor()
    dummy_conn = DummyConnection(dummy_cursor)
    mock_get_db.return_value = dummy_conn

    with client.application.app_context():
        with client.application.test_request_context():
            from flask_jwt_extended import create_access_token
            access_token = create_access_token(identity="testuser")

    response = client.post('/finalizeevent/1', headers={'Authorization': f'Bearer {access_token}'})

    if response.status_code != 200:
        print("ERROR RESPONSE DATA:", response.data.decode())
    assert response.status_code == 200

    data = response.get_json()
    assert "message" in data
    assert "successfully finalized" in data["message"].lower()


@patch('api.matching.db.get_db')
def test_volunteer_event_assignments_success(mock_get_db, client):
    assignment_rows = [
        {
            'event_id': 1,
            'volunteer_id': 2,
            'participation_status': 'Registered',
            'email': 'vol@example.com',                  # Use key matching DB output
            'volunteer_name': 'Volunteer Test',
            'event_name': 'Test Event',
            'event_date': datetime.date(2025, 8, 1),    # date object, not string
            'location_name': 'Loc',
            'urgency': 'High'
        }
    ]
    dummy_cursor = DummyCursor()
    dummy_cursor.fetchall_returns = [assignment_rows]
    dummy_conn = DummyConnection(dummy_cursor)
    mock_get_db.return_value = dummy_conn

    with client.application.app_context():
        with client.application.test_request_context():
            from flask_jwt_extended import create_access_token
            access_token = create_access_token(identity="testuser")

    response = client.get('/volunteereventassignments', headers={'Authorization': f'Bearer {access_token}'})

    if response.status_code != 200:
        try:
            print("ERROR RESPONSE JSON:", response.get_json())
        except Exception:
            print("ERROR RESPONSE DATA:", response.data.decode())

    assert response.status_code == 200

    data = response.get_json()
    assert "assignments" in data
    assert len(data["assignments"]) == 1
    # The API likely converts DB key 'email' to 'volunteer_email' in JSON output
    assert data["assignments"][0]["volunteer_email"] == "vol@example.com"
