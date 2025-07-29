class TestGetVolHistory:

    def test_get(self,client,access_token):
        response = client.get(f"/api/history/", headers={"Authorization": f"Bearer {access_token}"})
        assert response.status_code == 200

    def test_get_unauthorized(self,client):
        response = client.get(f"/api/history/")
        assert response.status_code == 500

class TestPostVolHistory:
    def test_post(self,client,access_token):
        data = {
            "eventName": "Community Park Cleanup",
            "eventDescription": "Join us for a day of cleaning and beautifying the neighborhood park. Volunteers will help with trash pickup, light landscaping, and painting benches.",
            "location": "Greenwood Community Park, 123 Elm St, Springfield",
            "requiredSkills": ["Gardening", "Teamwork", "Painting"],
            "urgency": {"text": "High", "numeric": 2},
            "eventDate": "2025-07-10",
            "participationStatus": {"text": "Registered", "numeric": 1}
        }
        response = client.post(f"/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
        assert response.status_code == 201 

    def test_post_unauthorized(self,client):
        response = client.post(f"/api/history/")
        assert response.status_code == 500

    def test_post_no_data(self,client,access_token):
        response = client.post(f"/api/history/", headers={"Authorization": f"Bearer {access_token}"})
        assert response.status_code == 415

    def test_post_missing_field_eventName(self, client, access_token):
        data = {
            # "eventName": "Missing name",
            "eventDescription": "Some desc",
            "location": "Somewhere",
            "requiredSkills": ["Skill"],
            "urgency": {"text": "High", "numeric": 1},
            "eventDate": "2025-07-10",
            "participationStatus": {"text": "Going", "numeric": 1}
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
        assert response.status_code == 400

    def test_post_missing_field_eventDes(self, client, access_token):
            data = {
                "eventName": "Missing name",
                #"eventDescription": "Some desc",
                "location": "Somewhere",
                "requiredSkills": ["Skill"],
                "urgency": {"text": "High", "numeric": 1},
                "eventDate": "2025-07-10",
                "participationStatus": {"text": "Going", "numeric": 1}
            }
            response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
            assert response.status_code == 400

    def test_post_missing_field_location(self, client, access_token):
            data = {
                "eventName": "Missing name",
                "eventDescription": "Some desc",
                #"location": "Somewhere",
                "requiredSkills": ["Skill"],
                "urgency": {"text": "High", "numeric": 1},
                "eventDate": "2025-07-10",
                "participationStatus": {"text": "Going", "numeric": 1}
            }
            response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
            assert response.status_code == 400

    def test_post_missing_field_reqSkills(self, client, access_token):
            data = {
                "eventName": "Missing name",
                "eventDescription": "Some desc",
                "location": "Somewhere",
                #"requiredSkills": ["Skill"],
                "urgency": {"text": "High", "numeric": 1},
                "eventDate": "2025-07-10",
                "participationStatus": {"text": "Going", "numeric": 1}
            }
            response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
            assert response.status_code == 400
    def test_post_missing_field_urgency(self, client, access_token):
            data = {
                "eventName": "Missing name",
                "eventDescription": "Some desc",
                "location": "Somewhere",
                "requiredSkills": ["Skill"],
                #"urgency": {"text": "High", "numeric": 1},
                "eventDate": "2025-07-10",
                "participationStatus": {"text": "Going", "numeric": 1}
            }
            response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
            assert response.status_code == 400

    def test_post_missing_field_eventDate(self, client, access_token):
            data = {
                "eventName": "Missing name",
                "eventDescription": "Some desc",
                "location": "Somewhere",
                "requiredSkills": ["Skill"],
                "urgency": {"text": "High", "numeric": 1},
                #"eventDate": "2025-07-10",
                "participationStatus": {"text": "Going", "numeric": 1}
            }
            response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
            assert response.status_code == 400

    def test_post_missing_field_pStatus(self, client, access_token):
            data = {
                "eventName": "Missing name",
                "eventDescription": "Some desc",
                "location": "Somewhere",
                "requiredSkills": ["Skill"],
                "urgency": {"text": "High", "numeric": 1},
                "eventDate": "2025-07-10",
                #"participationStatus": {"text": "Going", "numeric": 1}
            }
            response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
            assert response.status_code == 400

    def test_post_invalid_type_eventName(self, client, access_token):
        data = {
            "eventName": 123,  # Invalid type
            "eventDescription": "Some desc",
            "location": "Somewhere",
            "requiredSkills": ["Skill"],
            "urgency": {"text": "High", "numeric": 1},
            "eventDate": "2025-07-10",
            "participationStatus": {"text": "Going", "numeric": 1}
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
        assert response.status_code == 400
    def test_post_invalid_type_eventDes(self, client, access_token):
        data = {
            "eventName": "Test event" , 
            "eventDescription": 0,
            "location": "Somewhere",
            "requiredSkills": ["Skill"],
            "urgency": {"text": "High", "numeric": 1},
            "eventDate": "2025-07-10",
            "participationStatus": {"text": "Going", "numeric": 1}
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
        assert response.status_code == 400         
    def test_post_invalid_type_location(self, client, access_token):
        data = {
            "eventName": "Test event" , 
            "eventDescription": "Some desc",
            "location": 0,
            "requiredSkills": ["Skill"],
            "urgency": {"text": "High", "numeric": 1},
            "eventDate": "2025-07-10",
            "participationStatus": {"text": "Going", "numeric": 1}
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
        assert response.status_code == 400        

    def test_post_invalid_type_skills(self, client, access_token):
        data = {
            "eventName": "Test event" , 
            "eventDescription": "Some desc",
            "location": "Somewhere",
            "requiredSkills": 0,
            "urgency": {"text": "High", "numeric": 1},
            "eventDate": "2025-07-10",
            "participationStatus": {"text": "Going", "numeric": 1}
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
        assert response.status_code == 400    

    def test_post_invalid_type_urgency(self, client, access_token):
        data = {
            "eventName": "Test event" , 
            "eventDescription": "Some desc",
            "location": "Somewhere",
            "requiredSkills": ["Skill"],
            "urgency":0,
            "eventDate": "2025-07-10",
            "participationStatus": {"text": "Going", "numeric": 1}
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
        assert response.status_code == 400    

    def test_post_invalid_type_eventDate(self, client, access_token):
        data = {
            "eventName": "Test event" , 
            "eventDescription": "Some desc",
            "location": "Somewhere",
            "requiredSkills": ["Skill"],
            "urgency": {"text": "High", "numeric": 1},
            "eventDate": 0,
            "participationStatus": {"text": "Going", "numeric": 1}
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
        assert response.status_code == 500     

    def test_post_invalid_type_pstatus(self, client, access_token):
        data = {
            "eventName": "Test event" , 
            "eventDescription": "Some desc",
            "location": "Somewhere",
            "requiredSkills": ["Skill"],
            "urgency": {"text": "High", "numeric": 1},
            "eventDate": "2025-07-10",
            "participationStatus": 0
        }
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token}"}, json=data)
        assert response.status_code == 400              


              
                  
              
        