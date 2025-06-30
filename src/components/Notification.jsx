import { useState,  useEffect } from 'react';
import {Bell, RefreshCcw } from 'lucide-react';
import './Notification.css';
import { createNotification,
    deleteNotification,
    getUserNotifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    getUnreadCount } from '../helpers/notificationHelpers.js';


export default function Notificationbutton() {
    // State to track whether the dropdown menu is visible
    const [showDropDown, setShowDropDown] = useState(false);
    // State to track amount of unread notifications
    const [unreadCount, setUnreadCount] = useState(0);
    // State to hold user notifications
    const [notifications, setNotifications] = useState([]);


    
    // Function to fetch the latest notifications from the backend when the refresh button is clicked
    async function refreshFunction(){

        // Make api call to backend endpoint
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
            const updated = prev.map(notification => {
                if (notification.id === id) {
                    // Call the appropriate helper function based on current read status
                    if (notification.read) {
                        markNotificationAsUnread(id);
                    } else {
                        markNotificationAsRead(id);
                    }

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
                    {/* For each element with notifications create a NotificationItem component*/}
                    {notifications.map((notification) => (
                        <NotificationItem key = {notification.id} data={notification}  onToggleRead={() => toggleRead(notification.id)}/>
                    ))}
                </div>

            </div>
        )}
        </div>

    );
}

function NotificationItem({data, onToggleRead}){
   
    return(
         <div key={data.id} className="notification-item">
            <p>{data.message}</p>
            <small>{data.date}</small>
            <label>
                <input
                type="checkbox"
                checked={data.read}
                onChange={onToggleRead}
                />
                Read/Unread
            </label>
        </div>
    )


}

