import { useState,  useEffect } from 'react';
import {Bell} from 'lucide-react';
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
    const [unreadCount, SetUnreadCount] = useState(5);

    // Arrow function to toggle the dropdown visibilit  y/ change the state of showDropDown
    const toggleDropdown = () => {


            setShowDropDown(!showDropDown);
        };


    // Render the notification button and dropdown menu
    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Notification button that toggles dropdown on click */}
        {/* Bell emoji from https://emojipedia.org/bell */}
        <button onClick={toggleDropdown} className="icon-button" ><Bell size={20} /></button>
         
         {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount}
                  </span>
            )}


        {/* Conditionally render the dropdown if showDropDown is true */}
        {showDropDown && (
            <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'white',
            border: '1px solid gray',
            padding: '10px',
            zIndex: 1000,
            width: '150px',             // fixed width
            boxShadow: '0 10px 8px rgba(0,0,0,0.1)', // Light shadow effect
            borderRadius: '25px' //  Rounded corners
            }}>

            <div style={{
                overflowY: 'auto',         // vertical scroll if needed
                overflowX: 'hidden',       // no side scroll
                maxHeight: '100px',        // triggers scrolling if too tall
                padding: '5px',
                whiteSpace: 'normal',
                wordBreak: 'break-word',   // fix for breaking long text
            }}>
                <div>Notification 1</div>
                <div>Notification 2</div>
                <div>Notification 3</div>
                <div>Notification 4</div>
                <div>Notification 5</div>
            </div>

            </div>
        )}
        </div>
    );
}


