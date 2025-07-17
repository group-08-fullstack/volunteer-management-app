
class TestGetNotifications:

    def test_getNotification(self,client, access_token,user):
        response = client.get(f"/api/notification/?user{user['email']}", headers={"Authorization": f"Bearer {access_token}"})
        assert response.status_code == 200

    def test_getNotification_unauthorized(self,client, access_token,user):
        response = client.get(f"/api/notification/?user{user['email']}")
        assert response.status_code == 500

    def test_getNotification_no_user(self,client, access_token,user):
        response = client.get(f"/api/notification/", headers={"Authorization": f"Bearer {access_token}"})
        assert response.status_code == 200

class TestPostNotifications:
    def test_postNotification(self,client, user, access_token):
        notification = {"message": "Edit profile Reminder", "date": "7/10/2025", "read": False}
        response = client.post(
            f"/api/notification/?receiverId={user['email']}",
            headers={"Authorization": f"Bearer {access_token}"},
            json=notification
        )
        assert response.status_code == 201
    def test_postNotification_unauthorized(self,client, user, access_token):
        notification = {"message": "Edit profile Reminder", "date": "7/10/2025", "read": False}
        response = client.post(
            f"/api/notification/?receiverId={user['email']}",
            json=notification
        )
        assert response.status_code == 500
    def test_postNotification_no_Id(self,client, user, access_token):
        notification = {"message": "Edit profile Reminder", "date": "7/10/2025", "read": False}
        response = client.post(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token}"},
            json=notification
        )
        assert response.status_code == 400
    def test_postNotification_required_fields(self,client, user, access_token):
        notification = {"date": "7/10/2025", "read": False}
        response = client.post(
            f"/api/notification/?receiverId={user['email']}",
            headers={"Authorization": f"Bearer {access_token}"},
            json=notification
        )
        assert response.status_code == 400

    def test_postNotification_correct_message_type(self,client, user, access_token):
        notification = {"message": False, "date": "7/10/2025", "read": False}
        response = client.post(
            f"/api/notification/?receiverId={user['email']}",
            headers={"Authorization": f"Bearer {access_token}"},
            json=notification
        )
        assert response.status_code == 400
    def test_postNotification_correct_data_type(self,client, user, access_token):
        notification = {"message": "Edit profile Reminder", "date": 7/10/2025, "read": False}
        response = client.post(
            f"/api/notification/?receiverId={user['email']}",
            headers={"Authorization": f"Bearer {access_token}"},
            json=notification
        )
        assert response.status_code == 400
    def test_postNotification_correct_read_type(self,client, user, access_token):
        notification = {"message": "Edit profile Reminder", "date": "7/10/2025", "read": "False"}
        response = client.post(
            f"/api/notification/?receiverId={user['email']}",
            headers={"Authorization": f"Bearer {access_token}"},
            json=notification
        )
        assert response.status_code == 400
    


class TestDeleteNotifications:
    def test_delteteNotification(self,client,access_token):
        notiId = "5"
        response = client.delete(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
        assert response.status_code == 200
    def test_delteteNotification_unauthorized(self,client,access_token):
        notiId = "5"
        response = client.delete(
            f"/api/notification/?notiId={notiId}"
        )
    
        assert response.status_code == 500

    def test_delteteNotification_no_id(self,client,access_token):
        notiId = "5"
        response = client.delete(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
        assert response.status_code == 400
    def test_delteteNotification_id_notDigit(self,client,access_token):
        notiId = "five"
        response = client.delete(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
        assert response.status_code == 400

class TestPatchNotifications:
    def test_patchNotification(self,client,access_token):
        notiId = "0"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token}"},
            json={"read" : True}
        )
    
        assert response.status_code == 200

    def test_patchNotification_unauthorized(self,client,access_token):
        notiId = "0"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            json={"read" : True}
        )
    
        assert response.status_code == 500

    def test_patchNotification_no_id(self,client,access_token):
        notiId = "0"
        response = client.patch(
            f"/api/notification/",
            headers={"Authorization": f"Bearer {access_token}"},
            json={"read" : True}
        )
    
        assert response.status_code == 400

    def test_patchNotification_id_notDigit(self,client,access_token):
        notiId = "zero"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token}"},
            json={"read" : True}
        )
    
        assert response.status_code == 400

    def test_patchNotification_no_data(self,client,access_token):
        notiId = "0"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    
        assert response.status_code == 415

    def test_patchNotification_read_notBool(self,client,access_token):
        notiId = "0"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token}"},\
            json={"read" : "True"}
        )
    
        assert response.status_code == 400

    def test_patchNotification_notification_not_found(self,client,access_token):
        notiId = "10"
        response = client.patch(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token}"},\
            json={"read" : True}
        )
    
        assert response.status_code == 404

