from api import profileForm

class TestGetProfileForm:

    def test_get(self,client, access_token_volunteer):
        response = client.get(f"/api/profile/", headers={"Authorization": f"Bearer {access_token_volunteer}"})
        # The user should not exist yet
        assert response.status_code == 404

    def test_unauthorized(self,client):
        response = client.get(f"/api/profile/")
        assert response.status_code == 500


class TestPostProfileForm:

    def test_post(self,client, access_token_volunteer):
        profile_data = {
        "fullName": "John Smith",
        "address1": "123 Main Street",
        "address2": "Apt 2B",
        "city": "Springfield",
        "state": "CA",
        "zip": "90210",
        "skills": [
            {"value": "bilingual", "label": "Bilingual"},
            {"value": "first_aid", "label": "First Aid Certified"}
        ],
        "phoneNumber" : "1234567890",
        "dateOfBirth": "1990-01-01",
        "preferences": "Prefer weekend events and working with children",
        "availability": ["2025-07-15", "2025-07-20", "2025-07-25"],
        "createdAt": "2025-07-10T10:00:00Z",
        "updatedAt": "2025-07-10T10:00:00Z"
    }
        response = client.post(
            f"/api/profile/",
            headers={"Authorization": f"Bearer {access_token_volunteer}"},
            json=profile_data
        )
        assert response.status_code == 201
        # Try and receive user from database
        response = client.get(f"/api/profile/", headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert response.status_code == 200

    def test_unauthorized(self,client):
        profile_data = {
        "fullName": "John Smith",
        "address1": "123 Main Street",
        "address2": "Apt 2B",
        "city": "Springfield",
        "state": "CA",
        "zip": "90210",
        "skills": [
            {"value": "bilingual", "label": "Bilingual"},
            {"value": "first_aid", "label": "First Aid Certified"}
        ],
        "preferences": "Prefer weekend events and working with children",
        "availability": ["2025-07-15", "2025-07-20", "2025-07-25"],
        "createdAt": "2025-07-10T10:00:00Z",
        "updatedAt": "2025-07-10T10:00:00Z"
    }
        response = client.post(
            f"/api/profile/",
            json=profile_data
        )
        assert response.status_code == 500

class TestValidation:
    valid_profile = {
        "fullName": "John Smith",
        "address1": "123 Main Street",
        "address2": "Apt 2B",
        "city": "Springfield",
        "state": "CA",
        "zip": "90210",
        "skills": [
            {"value": "bilingual", "label": "Bilingual"},
            {"value": "first_aid", "label": "First Aid Certified"}
        ],
        "phoneNumber" : "1234567890",
        "dateOfBirth": "1990-01-01",
        "preferences": "Prefer weekend events and working with children",
        "availability": ["2025-07-15", "2025-07-20", "2025-07-25"],
        "createdAt": "2025-07-10T10:00:00Z",
        "updatedAt": "2025-07-10T10:00:00Z"
    }

    def test_missing_data(self):
        profile_data = {}
        response = profileForm.Profile._validate_profile_data(self,profile_data)
        assert response['error'] == "Missing JSON body"
    
    def test_missing_fullName(self):
        profile_data = self.valid_profile.copy()
        profile_data.pop("fullName", None)
        response = profileForm.Profile._validate_profile_data(self,profile_data)
        assert response['error'] == "Missing required field: fullName"
    
    def test_empty_full_name(self):
        profile_data = self.valid_profile.copy()
        profile_data["fullName"] = "  "  # Only whitespace
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "Full name must be a non-empty string"

    def test_full_name_too_long(self):
        profile_data = self.valid_profile.copy()
        profile_data["fullName"] = "A" * 51
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "Full name must be 50 characters or less"
    
    def test_empty_address1(self):
        profile_data = self.valid_profile.copy()
        profile_data["address1"] = ""
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "Address 1 must be a non-empty string"
    
    def test_address1_too_long(self):
        profile_data = self.valid_profile.copy()
        profile_data["address1"] = "A" * 101
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "Address 1 must be 100 characters or less"
    
    def test_address2_not_string(self):
        profile_data = self.valid_profile.copy()
        profile_data["address2"] = 12345
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "Address 2 must be a string"

    def test_address2_too_long(self):
        profile_data = self.valid_profile.copy()
        profile_data["address2"] = "B" * 101
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "Address 2 must be 100 characters or less"
    
    def test_empty_city(self):
        profile_data = self.valid_profile.copy()
        profile_data["city"] = " "
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "City must be a non-empty string"
   
    def test_invalid_state(self):
        profile_data = self.valid_profile.copy()
        profile_data["state"] = ""
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert "State must be a non-empty string" in response['error']
    
    def test_invalid_zip_format(self):
        profile_data = self.valid_profile.copy()
        profile_data["zip"] = "ABC123"
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "Zip code must be in format 12345 or 12345-6789"
   
    def test_skills_not_list(self):
        profile_data = self.valid_profile.copy()
        profile_data["skills"] = "notalist"
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "Skills must be an array"
   
    def test_skill_missing_fields(self):
        profile_data = self.valid_profile.copy()
        profile_data["skills"] = [{"value": "bilingual"}]  # Missing "label"
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "Each skill must be an object with 'value' and 'label' properties"
    
    def test_no_skill_value(self):
        profile_data = self.valid_profile.copy()
        profile_data["skills"] = []
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert "At least one skill must be selected" in response['error']
    
    def test_availability_not_list(self):
        profile_data = self.valid_profile.copy()
        profile_data["availability"] = "2025-07-15"
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert response['error'] == "Availability must be an array"
    
    def test_invalid_availability_date_format(self):
        profile_data = self.valid_profile.copy()
        profile_data["availability"] = ["15-07-2025"]
        response = profileForm.Profile._validate_profile_data(self, profile_data)
        assert "Invalid date format" in response['error']

    
class TestPutProfileForm:
    valid_profile = {
        "fullName": "Doe Smith",
        "address1": "123 Main Street",
        "address2": "Apt 2B",
        "city": "Springfield",
        "state": "CA",
        "zip": "90210",
        "skills": [
            {"value": "bilingual", "label": "Bilingual"},
            {"value": "first_aid", "label": "First Aid Certified"}
        ],
        "phoneNumber" : "1234567890",
        "dateOfBirth": "1990-01-01",
        "preferences": "Prefer weekend events and working with children",
        "availability": ["2025-07-15", "2025-07-20", "2025-07-25"],
        "createdAt": "2025-07-10T10:00:00Z",
        "updatedAt": "2025-07-10T10:00:00Z"
    }
    def test_put(self,client, access_token_volunteer):
        # Create new account first
        profile_data = self.valid_profile
        response = client.post(
            f"/api/profile/",
            headers={"Authorization": f"Bearer {access_token_volunteer}"},
            json=profile_data
        )
        assert response.status_code == 201
       
        updated_account = self.valid_profile.copy()
        updated_account['fullName'] = "New name"
        response = client.put(
            f"/api/profile/", 
            headers={"Authorization": f"Bearer {access_token_volunteer}"},
            json=updated_account)
        assert response.status_code == 200

    def test_unauthorized(self,client):
        response = client.put(f"/api/profile/")
        assert response.status_code == 500

    def test_no_profile(self,access_token_volunteer,client):
        response = client.put(
            f"/api/profile/", 
            headers={"Authorization": f"Bearer {access_token_volunteer}"},
            json= self.valid_profile)
        assert response.status_code == 404

class TestDeleteProfileform:
    valid_profile = {
       "fullName": "John Smith",
        "address1": "123 Main Street",
        "address2": "Apt 2B",
        "city": "Springfield",
        "state": "CA",
        "zip": "90210",
        "skills": [
            {"value": "bilingual", "label": "Bilingual"},
            {"value": "first_aid", "label": "First Aid Certified"}
        ],
        "phoneNumber" : "1234567890",
        "dateOfBirth": "1990-01-01",
        "preferences": "Prefer weekend events and working with children",
        "availability": ["2025-07-15", "2025-07-20", "2025-07-25"],
        "createdAt": "2025-07-10T10:00:00Z",
        "updatedAt": "2025-07-10T10:00:00Z"
    }
    def test_delete(self,access_token_volunteer,client):
        # Create new account first
        profile_data = self.valid_profile.copy()
        response = client.post(
            f"/api/profile/",
            headers={"Authorization": f"Bearer {access_token_volunteer}"},
            json=profile_data
        )
        assert response.status_code == 201
        response = client.delete(
                f"/api/profile/", 
                headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert response.status_code == 200

    def test_unauthorized(self,client):
        response = client.delete(f"/api/profile/")
        assert response.status_code == 500


class TestProfileSkills():
    def test_get(self,client, access_token_volunteer):
        response = client.get(f"/api/profile/skills/", headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert response.status_code == 200

class TestProfileStates():
    def test_get(self,client, access_token_volunteer):
        response = client.get(f"/api/profile/states/", headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert response.status_code == 200


