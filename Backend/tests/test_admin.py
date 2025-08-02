import pytest
from unittest.mock import patch, MagicMock
from flask_jwt_extended import create_access_token
from api.admin import convert_decimal


@pytest.fixture
def access_token(client):
    with client.application.app_context():
        with client.application.test_request_context():
            return create_access_token(identity="admin@example.com")


# Auto patch get_db in api.admin for all tests to mock DB access
@pytest.fixture(autouse=True)
def patch_get_db():
    with patch("api.admin.get_db") as mocked_get_db:
        yield mocked_get_db


# convert_decimal tests
from decimal import Decimal

def test_convert_decimal_basic_types():
    assert convert_decimal(Decimal('1.23')) == 1.23
    assert convert_decimal([Decimal('2.5'), Decimal('3.5')]) == [2.5, 3.5]
    assert convert_decimal({'a': Decimal('4.5')}) == {'a': 4.5}
    assert convert_decimal('string') == 'string'


def test_admin_dashboard_success(client, access_token, patch_get_db):
    cursor_mock = MagicMock()
    fetchone_side_effects = [
        {'total': 10},
        {'upcoming': 2},
        {'to_finalize': 3},
        {'completed': 5},
        {'total_events': 20},
        {'new_vols': 4},
        {'event_participation': 7},
        {'total_hours': 100},
        {'avg_rating': 4.5}
    ]
    cursor_mock.fetchone.side_effect = fetchone_side_effects
    cursor_mock.fetchall.side_effect = [
        [{
            'id': 1, 'name': 'Alice', 'events': 3, 'rating': 4.2,
            'totalHours': 6, 'expertise': 'First Aid, Cooking'
        }],
        [{
            'id': 101, 'event': 'Charity Run', 'date': '2025-08-10',
            'location': 'Central Park', 'event_duration': 3,
            'volunteers': 10, 'event_status': 'Pending', 'urgency': 'High'
        }]
    ]
    patch_get_db.return_value.cursor.return_value = cursor_mock

    resp = client.get("/api/admin/dashboard/", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["statistics"]["totalVolunteers"] == 10
    assert data["top_volunteers"][0]["name"] == "Alice"
    assert data["upcoming_events"][0]["event"] == "Charity Run"


def test_admin_volunteers_sorting(client, access_token, patch_get_db):
    cursor_mock = MagicMock()
    patch_get_db.return_value.cursor.return_value = cursor_mock
    cursor_mock.fetchall.return_value = [
        {'id': 1, 'name': 'Alice', 'email': 'alice@example.com', 'events_attended': 3, 'rating': 4.5, 'total_hours': 10},
        {'id': 2, 'name': 'Bob', 'email': 'bob@example.com', 'events_attended': 5, 'rating': 4.0, 'total_hours': 15},
    ]
    cursor_mock.fetchone.side_effect = [
        {'expertise': 'Cooking'},
        {'expertise': 'First Aid'}
    ]

    resp = client.get("/api/admin/volunteers/?sort_by=events&order=desc", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['total'] == 2
    assert data['volunteers'][0]['name'] == 'Bob'


def test_admin_events_filter_limit(client, access_token, patch_get_db):
    cursor_mock = MagicMock()
    patch_get_db.return_value.cursor.return_value = cursor_mock
    cursor_mock.fetchall.return_value = [
        {'event_id': 1, 'event_name': 'Event1', 'date': '2025-08-01', 'event_status': 'Pending'},
        {'event_id': 2, 'event_name': 'Event2', 'date': '2025-08-02', 'event_status': 'Finalized'},
    ]

    resp = client.get("/api/admin/events/?status=upcoming&limit=2", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['total'] == 2
    assert data['events'][0]['event_id'] == 1


def test_admin_statistics(client, access_token, patch_get_db):
    cursor_mock = MagicMock()
    patch_get_db.return_value.cursor.return_value = cursor_mock
    cursor_mock.fetchone.side_effect = [
        {'total': 50},
        {'upcoming': 5},
        {'completed': 20}
    ]

    resp = client.get("/api/admin/statistics/", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['statistics']['totalVolunteers'] == 50


def test_admin_volunteer_detail_found(client, access_token, patch_get_db):
    cursor_mock = MagicMock()
    patch_get_db.return_value.cursor.return_value = cursor_mock
    cursor_mock.fetchone.return_value = {
        'id': 1, 'name': 'Alice', 'email': 'alice@example.com',
        'events_attended': 5, 'rating': 4.0, 'total_hours': 20,
        'expertise': 'Cooking, First Aid'
    }

    resp = client.get("/api/admin/volunteers/1/", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['id'] == 1
    assert data['name'] == 'Alice'


def test_admin_volunteer_detail_not_found(client, access_token, patch_get_db):
    cursor_mock = MagicMock()
    patch_get_db.return_value.cursor.return_value = cursor_mock
    cursor_mock.fetchone.return_value = None

    resp = client.get("/api/admin/volunteers/999/", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 404


def test_admin_event_detail_found(client, access_token, patch_get_db):
    cursor_mock = MagicMock()
    patch_get_db.return_value.cursor.return_value = cursor_mock
    cursor_mock.fetchone.return_value = {
        'event_id': 10, 'event_name': 'Cleanup', 'event_status': 'Pending', 'event_duration': 3
    }

    resp = client.get("/api/admin/events/10/", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['event_id'] == 10


def test_admin_event_detail_not_found(client, access_token, patch_get_db):
    cursor_mock = MagicMock()
    patch_get_db.return_value.cursor.return_value = cursor_mock
    cursor_mock.fetchone.return_value = None

    resp = client.get("/api/admin/events/999/", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 404


def test_admin_dashboard_database_error(client, access_token, patch_get_db):
    cursor_mock = MagicMock()
    cursor_mock.execute.side_effect = Exception("DB error")
    patch_get_db.return_value.cursor.return_value = cursor_mock

    resp = client.get("/api/admin/dashboard/", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 500
    data = resp.get_json()
    assert "error" in data
