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
    /* 
        This is filler code. Once the backend is complete this will be
        an API call to an endopoint. 
    */

    const exampleData = [
        { id: 1, message: "New Event assigned", date: "6/29/2025", read: false },
        { id: 2, message: "Event updated", date: "6/28/2025" , read: false },
        { id: 3, message: "Welcome!", date: "6/28/2025" , read: false },
    ];

    return exampleData;
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
