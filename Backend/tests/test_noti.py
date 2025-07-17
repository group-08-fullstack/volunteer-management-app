
class TestNotifications:

    def test_getNotification(self,client, access_token):
        response = client.get("/api/notification/", headers={"Authorization": f"Bearer {access_token}"})
        assert response.status_code == 200

    def test_postNotification(self,client, user, access_token):
        notification = {"message": "Edit profile Reminder", "date": "7/10/2025", "read": False, "id": 5}
        response = client.post(
            f"/api/notification/?receiverId={user['email']}",
            headers={"Authorization": f"Bearer {access_token}"},
            json=notification
        )
        assert response.status_code == 201

    
    def test_delteteNotification(self,client,access_token):
        notiId = "5"
        response = client.delete(
            f"/api/notification/?notiId={notiId}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
        assert response.status_code == 202

    # def test_patchNotification(self,client,access_token):
    #     notiId = "0"
    #     response = client.patch(
    #         f"/api/notification/?notiId={notiId}",
    #         headers={"Authorization": f"Bearer {access_token}"},\
    #         json={"read" : True}
    #     )
    
    #     assert response.status_code == 200

