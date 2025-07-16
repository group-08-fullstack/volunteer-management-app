import pytest
import random
from api.app import app

# All of these fixtures are the "setup" phase of the unit tests

@pytest.fixture
def client():
    return app.test_client()

@pytest.fixture
def user():
    rand_int = random.randint(1, 10000)
    return {"email": f"test{str(rand_int)}", "password": "test", "role": "admin"}

@pytest.fixture
def access_token(client, user):
    register_response = client.post("/api/auth/register/", json=user)
    assert register_response.status_code == 201
    login_response = client.post("/api/auth/login/", json=user)
    assert login_response.status_code == 200
    login_data = login_response.get_json()
    return login_data['tokens']['access_token']