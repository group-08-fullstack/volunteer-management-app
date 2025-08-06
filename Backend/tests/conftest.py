import pytest
from api.app import create_app 
from api import config
from api.db import get_db
import uuid

# Helper function to clear test database
def clear_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SET FOREIGN_KEY_CHECKS=0;") #Turn off foreign key rule while truncating tables
    cursor.execute("SHOW TABLES;")
    tables = cursor.fetchall()
    
    for table in tables:
        table_name = list(table.values())[0] if isinstance(table, dict) else table[0]
        cursor.execute(f"TRUNCATE TABLE `{table_name}`;")
    
    cursor.execute("SET FOREIGN_KEY_CHECKS=1;") # Turn foreign keys rule on
    conn.commit()
    cursor.close()
    conn.close()

# All of these fixtures are the "setup" phase of the unit tests

@pytest.fixture
def client():
    app = create_app(config.TestConfig)

    with app.app_context():
        clear_db()   # Clear DB immediately before using the client
        
        with app.test_client() as client:  
            yield client         


@pytest.fixture(autouse=True)
def clear_database_before_each_test(client):
    with client.application.app_context():
        clear_db()          

@pytest.fixture
def user_admin(client):
    email = f"test{uuid.uuid4()}@example.com"
    return {"email": email, "password": "test", "role": "admin"}

@pytest.fixture
def user_volunteer(client):
    email = f"test{uuid.uuid4()}@example.com"
    return {"email": email, "password": "test", "role": "volunteer"}


@pytest.fixture
def access_token_admin(client, user_admin):
    register_response = client.post("/api/auth/register/", json=user_admin)
    # Manually insert verficaiton code and set verified to true
    with client.application.app_context():
        conn = get_db()
        cursor = conn.cursor()

        code = 1111
        verified = 1 # True
        email = user_admin["email"]
    
    try:
        cursor.execute(
            "INSERT INTO verification_codes (email, code, verified) VALUES (%s, %s, %s)",
            (email, code, verified)
        )
        conn.commit()
    except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Failed to insert verification code: {e}")
    finally:
        cursor.close()
        conn.close()
    assert register_response.status_code == 201
    login_response = client.post("/api/auth/login/", json=user_admin)
    assert login_response.status_code == 200
    login_data = login_response.get_json()
    return login_data['tokens']['access_token']

@pytest.fixture
def access_token_volunteer(client, user_volunteer):
    register_response = client.post("/api/auth/register/", json=user_volunteer)
        # Manually insert verficaiton code and set verified to true
    with client.application.app_context():
        conn = get_db()
        cursor = conn.cursor()

        code = 1111
        verified = 1 # True
        email = user_volunteer["email"]
    
    try:
        cursor.execute(
            "INSERT INTO verification_codes (email, code, verified) VALUES (%s, %s, %s)",
            (email, code, verified)
        )
        conn.commit()
    except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Failed to insert verification code: {e}")
    finally:
        cursor.close()
        conn.close()
    assert register_response.status_code == 201
    login_response = client.post("/api/auth/login/", json=user_volunteer)
    assert login_response.status_code == 200
    login_data = login_response.get_json()
    return login_data['tokens']['access_token']
