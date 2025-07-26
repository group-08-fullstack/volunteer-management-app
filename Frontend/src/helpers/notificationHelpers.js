import {checkTokenTime} from "../helpers/authHelpers"


// Create a notification
export async function createNotification(data){
    // First validate that user JWT token is still vaild
    await checkTokenTime();

    await fetch(`http://127.0.0.1:5000/api/notification/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(data)
    });
}


// Get all notifications for a user
export async function getUserNotifications(){
    // First validate that user JWT token is still vaild
    await checkTokenTime();
   
    const response = await fetch(`http://127.0.0.1:5000/api/notification/`, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    const parsed = await response.json();

    return parsed;
}


// Mark as read/unread
export async function FlipReadStatus(notificationId,data){

    // First validate that user JWT token is still vaild
    await checkTokenTime();

    const response = await fetch(`http://127.0.0.1:5000/api/notification/?notiId=${notificationId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`

        },
        body : JSON.stringify({ "read": !data["read"] })
    });
}



// Delete a notification
export async function deleteNotification(notificationId) {

    console.log(typeof notificationId);
    // First validate that user JWT token is still vaild
    await checkTokenTime();

    const response = await fetch(`http://127.0.0.1:5000/api/notification/?notiId=${notificationId}`, {
        method: "DELETE",
         headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        }
    });
}

