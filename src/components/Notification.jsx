import { useState,  useEffect } from 'react';
import { createNotification,
    deleteNotification,
    getUserNotifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    deleteNotification,
    getUnreadCount } from '../helpers/notificationHelpers.js';


export default function Notificationbutton() {
    // State to track whether the dropdown menu is visible
    const [showDropDown, setShowDropDown] = useState(false);

    // Arrow function to toggle the dropdown visibility/ change the state of showDropDown
    const toggleDropdown = () => {


            setShowDropDown(!showDropDown);
        };


    // Render the notification button and dropdown menu
    return (
        <div>
        {/* Notification button that toggles dropdown on click */}
        {/* Bell emoji from https://emojipedia.org/bell */}
        <button onClick={toggleDropdown}>🔔</button>


        {/* Conditionally render the dropdown if showDropDown is true */}
        {showDropDown && (
            <div style={{ background: 'lightgray' }}>
                <div> Notifications Displayed here</div>
           
            </div>
        )}
        </div>
    );
}



