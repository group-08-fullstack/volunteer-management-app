/*
  Logic for these functions is incomplete due to no backend implementation.
  Each function will eventually make API calls to Flask backend endpoints
  to retrieve or modify the corresponding notification data.
*/


// Create a notification
export async function createNotification(senderId, receiverId, eventName, eventDate, message){
    return null;
}


// Get all notifications for a user
export async function getUserNotifications(receiverId){
   
    const response = await fetch("http://127.0.0.1:5000/api/notification/", {
        method: "GET"
    });

    const parsed = await response.json();

    return parsed;
}


// Mark as read/unread
export async function markNotificationAsRead(notificationId){
    return null;
}

export async function markNotificationAsUnread(notificationId){
    return null;
}


// Delete a notification
export async function deleteNotification(notificationId) {
    const response = await fetch("http://127.0.0.1:5000/api/notification/", {
        method: "DELETE"
    });

    const parsed = await response.json();
    console.log(parsed);
}


// Get the count of unread notifications
export async function getUnreadCount(receiverId){
    return null;
}
