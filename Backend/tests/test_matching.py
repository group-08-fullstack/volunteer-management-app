class TestMatching:
    def test_match_unauthorized(self,client):
        payload = {
            "volunteer_email": "alice@yahoo.com",
            "event_name": "Food Drive"
        }
        response = client.post("/api/matching/match/", json=payload)    
        assert response.status_code in (401, 500)


    def test_match_missing_fields(self,client, access_token_admin):
        payload = {
            "volunteer_email": "alice@yahoo.com",
            
        }
        response = client.post("/api/matching/match/", json=payload, headers={
            "Authorization": f"Bearer {access_token_admin}"
        })
        assert response.status_code == 400
        json_data = response.get_json()
        message = json_data.get("message")
        
        if isinstance(message, dict):
            error_msgs = message.values()
            assert any("required" in str(err).lower() for err in error_msgs)
        else:
            assert message and "required" in str(message).lower()

    def test_match_invalid_json(self,client, access_token_admin):
        response = client.post("/api/matching/match/", data="notjson", headers={
            "Authorization": f"Bearer {access_token_admin}",
            "Content-Type": "application/json"
        })
        assert response.status_code in (400, 415)
