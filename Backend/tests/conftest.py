import pytest
import random
from api.app import app

# All of these fixtures are the "setup" phase of the unit tests

@pytest.fixture
def client():
    return app.test_client()

@pytest.fixture
def user_admin():
    # Generate random user test email
    rand_int = random.randint(1, 10000)
    return {"email": f"test{str(rand_int)}", "password": "test", "role": "admin"}

@pytest.fixture
def user_volunteer():
    # Generate random user test email
    rand_int = random.randint(1, 10000)
    return {"email": f"test{str(rand_int)}", "password": "test", "role": "volunteer"}

@pytest.fixture
def access_token_admin(client, user_admin):
    register_response = client.post("/api/auth/register/", json=user_admin)
    assert register_response.status_code == 201
    login_response = client.post("/api/auth/login/", json=user_admin)
    assert login_response.status_code == 200
    login_data = login_response.get_json()
    return login_data['tokens']['access_token']

@pytest.fixture
def access_token_volunteer(client, user_volunteer):
    register_response = client.post("/api/auth/register/", json=user_volunteer)
    assert register_response.status_code == 201
    login_response = client.post("/api/auth/login/", json=user_volunteer)
    assert login_response.status_code == 200
    login_data = login_response.get_json()
    return login_data['tokens']['access_token']