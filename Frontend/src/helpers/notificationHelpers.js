/*
  Logic for these functions is incomplete due to no backend implementation.
  Each function will eventually make API calls to Flask backend endpoints
  to retrieve or modify the corresponding notification data.
*/


// Create a notification
export async function createNotification(receiverId,data){
     const response = await fetch(`http://127.0.0.1:5000/api/notification/?receiverId=${receiverId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(data)
    });

    
    return null;
}


// Get all notifications for a user
export async function getUserNotifications(receiverId){
   
    const response = await fetch("http://127.0.0.1:5000/api/notification/", {
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
    const response = await fetch(`http://127.0.0.1:5000/api/notification/?notiId=${notificationId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`

        },
        body : JSON.stringify({ "read": !data["read"] })
    });

    const parsed = await response.json();
    console.log(parsed);
}



// Delete a notification
export async function deleteNotification(notificationId) {
    const response = await fetch(`http://127.0.0.1:5000/api/notification/?notiId=${notificationId}`, {
        method: "DELETE",
         headers: {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    const parsed = await response.json();
}


// Get the count of unread notifications
export async function getUnreadCount(receiverId){
    return null;
}
