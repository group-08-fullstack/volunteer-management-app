class TestGetVolHistory:

    def test_get(self,client,user_volunteer,access_token_volunteer):
        response = client.get(f"/api/history/", headers={"Authorization": f"Bearer {access_token_volunteer}"})
        assert response.status_code == 200

    def test_get_unauthorized(self,client):
        response = client.get(f"/api/history/")
        assert response.status_code == 500

class TestPostVolHistory:
    valid_data = {
         "event_id" : 2,
         "volunteer_email" : "",
         "participation_status" : "Registered"
    }

    def test_post(self,client,access_token_admin,access_token_volunteer,user_volunteer):
        data = self.valid_data.copy()
        data["volunteer_email"] = user_volunteer["email"]
        response = client.post(f"/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"}, json=data)
        assert response.status_code == 201 

    def test_post_unauthorized(self,client):
        response = client.post(f"/api/history/")
        assert response.status_code == 500

    def test_post_no_data(self,client,access_token_admin):
        response = client.post(f"/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"})
        assert response.status_code == 415

    def test_post_missing_field_pStatus(self, client, access_token_admin):
            data = self.valid_data.copy()
            data["participation_status"] = None
            response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"}, json=data)
            assert response.status_code == 400

    def test_post_invalid_type_pstatus(self, client, access_token_admin):
        data = self.valid_data.copy()
        data["participation_status"] = 0
        response = client.post("/api/history/", headers={"Authorization": f"Bearer {access_token_admin}"}, json=data)
        assert response.status_code == 400              


              
                  
              
        