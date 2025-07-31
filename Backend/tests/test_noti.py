
class TestGetNotifications:

    def test_get(self,client, access_token_admin):
        response = client.get(f"/api/notification/", headers={"Authorization": f"Bearer {access_token_admin}"})
        assert response.status_code == 200

    def test__unauthorized(self,client, access_token_admin):
        response = client.get(f"/api/notification/")
        assert response.status_code == 500

    # def test__no_user_admin(self,client, access_token_admin):
    #     response = client.get(f"/api/notification/", headers={"Authorization": f"Bearer {access_token_admin}"})
    #     assert response.status_code == 200

class TestPostNotifications:
    def test_post(self,client, user_admin, access_token_admin):
        notification = {"receiver" : user_admin['email'], "message": "Edit profile Reminder", "date": "2025-10-7", "read": False}
        response = client.post(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token_admin}"},
            json=notification
        )
        assert response.status_code == 201

    def test__unauthorized(self,client, user_admin):
        notification = {"reciever" : user_admin['email'], "message": "Edit profile Reminder", "date": "7/10/2025", "read": False}
        response = client.post(
            f"/api/notification/",
            json=notification
        )
        assert response.status_code == 500

    def test__required_fields_receiver(self,client, access_token_admin):
        notification = {"message": "Edit profile Reminder", "date": "7/10/2025", "read": False}
        response = client.post(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token_admin}"},
            json=notification
        )
        assert response.status_code == 400

    def test__correct_receiver_type(self,client, user_admin, access_token_admin):
        notification = {"receiver" : False,"message": False, "date": "7/10/2025", "read": False}
        response = client.post(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token_admin}"},
            json=notification
        )
        assert response.status_code == 400

    def test__correct_message_type(self,client, user_admin, access_token_admin):
        notification = {"receiver" : user_admin['email'],"message": False, "date": "7/10/2025", "read": False}
        response = client.post(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token_admin}"},
            json=notification
        )
        assert response.status_code == 400

    def test__correct_data_type(self,client, user_admin, access_token_admin):
        notification = {"receiver" : user_admin['email'],"message": "Edit profile Reminder", "date": 2025-10-7, "read": False}
        response = client.post(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token_admin}"},
            json=notification
        )
        assert response.status_code == 400

    def test__correct_read_type(self,client, user_admin, access_token_admin):
        notification = {"receiver" : user_admin['email'],"message": "Edit profile Reminder", "date": "7/10/2025", "read": "Not"}
        response = client.post(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token_admin}"},
            json=notification
        )
        assert response.status_code == 400
    


class TestDeleteNotifications:
    def test_delete(self,client,access_token_admin):
        notiId = "5"
        response = client.delete(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token_admin}"}
        )
    
        assert response.status_code == 200
    def test__unauthorized(self,client):
        notiId = "5"
        response = client.delete(
            f"/api/notification/?notiId={notiId}"
        )
    
        assert response.status_code == 500

    def test__no_id(self,client,access_token_admin):
        notiId = "5"
        response = client.delete(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token_admin}"}
        )
    
        assert response.status_code == 400
    def test__id_notDigit(self,client,access_token_admin):
        notiId = "five"
        response = client.delete(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token_admin}"}
        )
    
        assert response.status_code == 400

class TestPatchNotifications:
    def test_patch(self,client,access_token_admin):
        notiId = "0"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token_admin}"},
            json={"read" : True}
        )
    
        assert response.status_code == 200

    def test__unauthorized(self,client):
        notiId = "0"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            json={"read" : True}
        )
    
        assert response.status_code == 500

    def test__no_id(self,client,access_token_admin):
        notiId = "0"
        response = client.patch(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token_admin}"},
            json={"read" : True}
        )
    
        assert response.status_code == 400

    def test__id_notDigit(self,client,access_token_admin):
        notiId = "zero"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token_admin}"},
            json={"read" : True}
        )
    
        assert response.status_code == 400

    def test__no_data(self,client,access_token_admin):
        notiId = "0"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token_admin}"},
        )
    
        assert response.status_code == 415

    def test__read_notBool(self,client,access_token_admin):
        notiId = "0"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token_admin}"},\
            json={"read" : "True"}
        )
    
        assert response.status_code == 400

    # def test__notification_not_found(self,client,access_token_admin):
    #     notiId = "10"
    #     response = client.patch(
    #         f"/api/notification/?notiId={notiId}",
    #         headers={"Authorization": f"Bearer {access_token_admin}"},\
    #         json={"read" : True}
    #     )
    
    #     assert response.status_code == 404

