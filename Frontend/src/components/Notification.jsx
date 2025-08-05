import { useState,  useEffect } from 'react';
import {Bell, RefreshCcw } from 'lucide-react';
import './Notification.css';
import { deleteNotification,
    getUserNotifications,
    FlipReadStatus,
    } from '../helpers/notificationHelpers.js';



export default function Notificationbutton() {
    // State to track whether the dropdown menu is visible
    const [showDropDown, setShowDropDown] = useState(false);
    // State to track amount of unread notifications
    const [unreadCount, setUnreadCount] = useState(0);
    // State to hold user notifications
    const [notifications, setNotifications] = useState([]);


    
    // Function to fetch the latest notifications from the backend when the refresh button is clicked
    async function refreshFunction(){

        // Make api call to backend endpoint to retrieve all user notifications
        let data = await getUserNotifications();

        setNotifications(data); // update notification state

        // Count unread notifications where read === false
        const unreadAmnt = data.filter(notification => !notification.read).length;

        setUnreadCount(unreadAmnt); // update unread count state
    };


     // Run refreshFunction once on mount to fetch initial data
        useEffect(() => {
            refreshFunction();
        }, []);

    
    // Function to toggle the read/unread state of a notification and update unread count
    const toggleRead = (id) => {
        setNotifications(prev => {
            // For each element determine if its the desired one
            const updated = prev.map(notification => {
                if (notification.notification_id === id) {
                    // Change read status with backend API call
                    FlipReadStatus(id, notification);

                    // Return updated notification. 
                    // In other words, return the notification with every attribute the same but the read attribute
                    return { ...notification, read: !notification.read };
                }

                // If not the desired notification keep the same
                return notification;
            });

        // Update unread count after toggling
        setUnreadCount(updated.filter(notification => !notification.read).length);

        return updated;
        });

    }   


   // Function to delete a notification. Filter out the desired notification
    async function handleDelete(id) {
        try {
            await deleteNotification(id); // Delete on backend

            setNotifications((prev) => {
                // Grab notification the deleted notification
                const notification = prev.find((n) => n.notification_id === id);

                // Update UI by filtering out the deleted notification
                const updated = prev.filter((n) => n.notification_id !== id);

                // Update unread count only if the deleted notification was unread
                if (notification && !notification.read) {
                    setUnreadCount(unreadCount - 1);
                }

                return updated;
            });
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    }


    // Arrow function to toggle the dropdown visibility/change the state of showDropDown
    const toggleDropdown = () => {
            setShowDropDown(!showDropDown);
        };
    

    // Render the notification button and dropdown menu
    return (
        <div className="notification-container" style={{ position: 'relative', display: 'inline-block' }}>
        {/* Notification button that toggles dropdown on click */}
        {/* Bell emoji from https://emojipedia.org/bell */}
        <button onClick={toggleDropdown} className="bell-button" ><Bell size={20} /></button>
         
         {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount}
                  </span>
            )}


        {/* Conditionally render the dropdown if showDropDown is true */}
        {showDropDown && (
            <div className='dropdown-div'>
            
                {/* Refresh button */}
                <button className='refresh-button' onClick={refreshFunction}> <RefreshCcw size={15}/></button>

                {/* Div container to hold notifications */}
                   <div className='notification-div'>
                        {notifications.length === 0 ? (
                            <p className="empty-message">No notifications, check back later.</p>
                        ) : (
                            notifications.toReversed().map((notification) => (
                                <NotificationItem
                                    key={notification.notification_id}
                                    data={notification}
                                    onToggleRead={() => toggleRead(notification.notification_id)}
                                    onDelete={() => handleDelete(notification.notification_id)}
                                />
                            ))
                        )}
                    </div>

            </div>
        )}
        </div>

    );
}

// Function that returns a NotificationItem which represents a single notification and all its available user actions
function NotificationItem({data, onToggleRead, onDelete}){
   
    return(
        <div key={data.notification_id} className="notification-item">
            <p>{data.message}</p>
            <small>{data.date}</small>

            <div className="notification-read-toggle">
                <label className="notification-label">Read</label>
                <input
                    className="notification-checkbox"
                    type="checkbox"
                    checked={data.read}
                    onChange={onToggleRead}
                />
            </div>

            <button className="notification-delete" onClick={onDelete}>Delete</button>

        </div>
    )


}

