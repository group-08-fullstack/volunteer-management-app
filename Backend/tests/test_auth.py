import pytest
from flask_jwt_extended import decode_token

def test_register_success(client, user_admin):
    response = client.post("/api/auth/register/", json=user_admin)
    assert response.status_code == 201
    assert response.get_json()["message"] == "Registration successful!"


def test_register_duplicate_verified(client, user_admin):
    """Test duplicate registration with verified user - hits lines 47"""
    # First register the user
def test_register_duplicate_verified(client, user_admin):
    """Test duplicate registration with verified user - hits lines 47"""
    # First register the user
    client.post("/api/auth/register/", json=user_admin)
    
    # Try to register again (user already exists and is verified)
    response = client.post("/api/auth/register/", json=user_admin)
    assert response.status_code == 400
    assert "already exists and is verified" in response.get_json()["message"]


def test_register_duplicate_unverified(client, user_admin):
    """Test duplicate registration with unverified user - hits lines 49-50"""
    # Create user in database but don't verify
    response = client.post("/api/auth/register/", json=user_admin)
    
    # Manually set verification to 0 to test unverified path
    from api.db import get_db
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE verification_codes SET verified = 0 WHERE email = %s", (user_admin["email"],))
    conn.commit()
    cursor.close()
    conn.close()
    
    # Try to register again
    response = client.post("/api/auth/register/", json=user_admin)
    assert response.status_code == 400
    assert "not verified" in response.get_json()["message"]


def test_register_missing_fields(client):
    """Test registration with missing required fields"""
    response = client.post("/api/auth/register/", json={"email": "no_password@example.com"})
    assert response.status_code == 400


def test_register_database_error(client, user_admin, monkeypatch):
    """Test database error during registration - hits exception handling"""
    def mock_get_db():
        raise Exception("Database connection failed")
    
    monkeypatch.setattr("api.auth.db.get_db", mock_get_db)
    response = client.post("/api/auth/register/", json=user_admin)
    assert response.status_code == 500


def test_login_success(client, user_admin):
    client.post("/api/auth/register/", json=user_admin)
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
    except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data["tokens"]
    assert "refresh_token" in data["tokens"]
    assert "user" in data


def test_login_user_not_exist(client):
    """Test login with non-existent user - hits lines 108-110"""
    non_existent_user = {
        "email": "nonexistent@example.com",
        "password": "password",
        "role": "admin"
    }
    response = client.post("/api/auth/login/", json=non_existent_user)
    assert response.status_code == 401
    assert "Account does not exist" in response.get_json()["message"]


def test_login_unverified_account(client, user_admin):
    """Test login with unverified account - hits lines 104-105"""
    # Register user
    client.post("/api/auth/register/", json=user_admin)
    
    # Set verification to 0
    from api.db import get_db
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE verification_codes SET verified = 0 WHERE email = %s", (user_admin["email"],))
    conn.commit()
    cursor.close()
    conn.close()
    
    # Try to login
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 200  # Based on your code, it returns 200 but with message
    assert "Account not verified" in response.get_json()["message"]


def test_login_wrong_password(client, user_admin):
    """Test login with wrong password - hits lines 106-107"""
    client.post("/api/auth/register/", json=user_admin)
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
    except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()
    user_admin['password'] = "wrongpass"
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 401
    assert "Invalid login information" in response.get_json()["message"]


def test_login_wrong_role(client, user_admin):
    """Test login with wrong role - hits lines 106-107"""
    client.post("/api/auth/register/", json=user_admin)
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
    except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()
    user_admin['role'] = "volunteer" if user_admin['role'] == "admin" else "admin"
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 401
    assert "Invalid login information" in response.get_json()["message"]


def test_login_database_error(client, user_admin, monkeypatch):
    """Test database error during login"""
    def mock_get_db():
        raise Exception("Database connection failed")
    
    monkeypatch.setattr("api.auth.db.get_db", mock_get_db)
    response = client.post("/api/auth/login/", json=user_admin)
    assert response.status_code == 500


def test_refresh_token(client, user_admin):
    client.post("/api/auth/register/", json=user_admin)
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
    except Exception as e:
            conn.rollback()
            return {"error": str(e)}, 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()
    login = client.post("/api/auth/login/", json=user_admin)
    refresh_token = login.get_json()["tokens"]["refresh_token"]

    response = client.post(
        "/api/auth/refresh/",
        headers={"Authorization": f"Bearer {refresh_token}"}
    )
    assert response.status_code == 200
    assert "access_token" in response.get_json()


def test_delete_account_success(client, access_token_admin):
    """Test successful account deletion - hits lines 131-163"""
    response = client.delete(
        "/api/auth/delete/",
        headers={"Authorization": f"Bearer {access_token_admin}"}
    )
    assert response.status_code == 200
    assert "deleted successfully" in response.get_json()["message"]


def test_delete_account_user_not_found(client):
    """Test delete account with invalid token - hits lines 141"""
    # Create a fake token that doesn't correspond to any user
    from flask_jwt_extended import create_access_token
    fake_token = create_access_token(identity="nonexistent@example.com")
    
    response = client.delete(
        "/api/auth/delete/",
        headers={"Authorization": f"Bearer {fake_token}"}
    )
    assert response.status_code == 404
    assert "User not found" in response.get_json()["message"]


def test_delete_account_database_error(client, access_token_admin, monkeypatch):
    """Test database error during account deletion - hits lines 155-158"""
    def mock_get_db():
        raise Exception("Database connection failed")
    
    monkeypatch.setattr("api.auth.db.get_db", mock_get_db)
    response = client.delete(
        "/api/auth/delete/",
        headers={"Authorization": f"Bearer {access_token_admin}"}
    )
    assert response.status_code == 500


def test_email_verification_new_email(client):
    """Test email verification for new email - hits lines 169-222"""
    test_email = {"email": "test@example.com", "password": "dummy", "role": "admin"}
    
    with patch('api.auth.smtplib.SMTP_SSL') as mock_smtp:
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        
        response = client.post("/api/auth/verification/", json=test_email)
        assert response.status_code == 200
        assert "Verification code sent successfully" in response.get_json()["message"]


def test_email_verification_existing_email(client):
    """Test email verification for existing email - hits lines 179-180"""
    test_email = {"email": "existing@example.com", "password": "dummy", "role": "admin"}
    
    # First send verification
    with patch('api.auth.smtplib.SMTP_SSL') as mock_smtp:
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        client.post("/api/auth/verification/", json=test_email)
    
    # Send again to same email
    response = client.post("/api/auth/verification/", json=test_email)
    assert response.status_code == 200
    assert "A code has already been issued" in response.get_json()["message"]


def test_email_verification_database_error(client, monkeypatch):
    """Test database error during email verification"""
    def mock_get_db():
        raise Exception("Database connection failed")
    
    monkeypatch.setattr("api.auth.db.get_db", mock_get_db)
    test_email = {"email": "test@example.com", "password": "dummy", "role": "admin"}
    response = client.post("/api/auth/verification/", json=test_email)
    assert response.status_code == 500


def test_email_verification_smtp_error(client):
    """Test SMTP error during email sending - hits lines 220-221"""
    test_email = {"email": "test@example.com", "password": "dummy", "role": "admin"}
    
    with patch('api.auth.smtplib.SMTP_SSL') as mock_smtp:
        mock_smtp.side_effect = Exception("SMTP connection failed")
        
        response = client.post("/api/auth/verification/", json=test_email)
        assert response.status_code == 500


def test_email_code_confirmation_valid(client):
    """Test email code confirmation with valid code - hits lines 229-263"""
    test_email = {"email": "confirm@example.com", "password": "dummy", "role": "admin"}
    
    # First send verification to get a code
    with patch('api.auth.smtplib.SMTP_SSL') as mock_smtp:
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        client.post("/api/auth/verification/", json=test_email)
    
    # Get the code from database
    from api.db import get_db
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT code FROM verification_codes WHERE email = %s", (test_email["email"],))
    result = cursor.fetchone()
    code = result["code"]
    cursor.close()
    conn.close()
    
    # Confirm with correct code
    confirmation_data = {"email": test_email["email"], "code": code}
    response = client.post("/api/auth/confirmation/", json=confirmation_data)
    assert response.status_code == 200
    assert "Verified" in response.get_json()["message"]


def test_email_code_confirmation_invalid(client):
    """Test email code confirmation with invalid code - hits lines 254-255"""
    test_email = {"email": "invalid@example.com", "password": "dummy", "role": "admin"}
    
    # First send verification
    with patch('api.auth.smtplib.SMTP_SSL') as mock_smtp:
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        client.post("/api/auth/verification/", json=test_email)
    
    # Confirm with wrong code
    confirmation_data = {"email": test_email["email"], "code": 9999}
    response = client.post("/api/auth/confirmation/", json=confirmation_data)
    assert response.status_code == 400
    assert "Invalid code" in response.get_json()["message"]


def test_email_code_confirmation_database_error(client, monkeypatch):
    """Test database error during code confirmation"""
    def mock_get_db():
        raise Exception("Database connection failed")
    
    monkeypatch.setattr("api.auth.db.get_db", mock_get_db)
    confirmation_data = {"email": "test@example.com", "code": 1234}
    response = client.post("/api/auth/confirmation/", json=confirmation_data)
    assert response.status_code == 500


def test_email_code_confirmation_update_error(client, monkeypatch):
    """Test database error during verification update - hits lines 248-250"""
    test_email = {"email": "update_error@example.com", "password": "dummy", "role": "admin"}
    
    # First send verification
    with patch('api.auth.smtplib.SMTP_SSL') as mock_smtp:
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        client.post("/api/auth/verification/", json=test_email)
    
    # Get the code
    from api.db import get_db
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT code FROM verification_codes WHERE email = %s", (test_email["email"],))
    result = cursor.fetchone()
    code = result["code"]
    cursor.close()
    conn.close()
    
    # Mock database to fail on UPDATE
    call_count = [0]
    original_get_db = db.get_db
    
    def mock_get_db_selective():
        call_count[0] += 1
        if call_count[0] == 2:  # Fail on second call (UPDATE)
            raise Exception("Database update failed")
        return original_get_db()
    
    monkeypatch.setattr("api.auth.db.get_db", mock_get_db_selective)
    
    confirmation_data = {"email": test_email["email"], "code": code}
    response = client.post("/api/auth/confirmation/", json=confirmation_data)
    assert response.status_code == 500


def test_invalid_json_data(client):
    """Test endpoints with invalid JSON data"""
    # Test register with invalid data
    response = client.post("/api/auth/register/", json={"email": "test@example.com"})  # Missing required fields
    assert response.status_code == 400
    
    # Test login with invalid data  
    response = client.post("/api/auth/login/", json={"email": "test@example.com"})  # Missing required fields
    assert response.status_code == 400


def test_edge_case_email_formats(client):
    """Test various email formats"""
    # Test uppercase email (should be converted to lowercase)
    user_upper = {
        "email": "TEST@EXAMPLE.COM",
        "password": "password123", 
        "role": "admin"
    }
    
    response = client.post("/api/auth/register/", json=user_upper)
    assert response.status_code == 201
    
    # Test login with same email in different case
    user_lower = {
        "email": "test@example.com",
        "password": "password123",
        "role": "admin" 
    }
    
    response = client.post("/api/auth/login/", json=user_lower)
    assert response.status_code == 200