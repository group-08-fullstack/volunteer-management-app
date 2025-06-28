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
    return null;
}


// Mark as read/unread
export async function markNotificationAsRead(notificationId){
    return null;
}

export async function markNotificationAsUnread(notificationId){
    return null;
}


// Delete a notification
export async function deleteNotification(notificationId){
    return null;
}


// Get the count of unread notifications
export async function getUnreadCount(receiverId){
    return null;
}
