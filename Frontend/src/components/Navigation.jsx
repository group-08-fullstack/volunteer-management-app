import { useNavigate } from 'react-router-dom';
import NotificationButton from './Notification';
import './Navigation.css';
import { Calendar, MapPin, Users, Home, LogOut, UserCheck, User, History } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

/* Instructions for setting up:

    1. Import NavigationBar from './Navigation'
    2. Place '<NavigationBar extraLinks={[] , title = "String"} />' into return body
*/

/* Instructions for providing extraLinks as a prop:

   - extraLinks must follow this format:

     const extraLinks = [
       {
         className: "home-button",          // CSS class for styling
         link: "/home",                     // Path to navigate to
         logo: <Home size={18} />,          // lucide-react icon component
         text: "Home"                       // Label displayed next to the icon
       },
       ...
     ];

    - Note: pass extralink as [] if no addtional links are needed 

    - Note: 'logo' should be a JSX element imported from lucide-react within this file, 
    e.g., import { Home } from "lucide-react";

    - Note: logo and text fields can be null

    - Also, make sure to define CSS styles for each className 
    (e.g., 'home-button') in Navigation.css

*/





// Component that returns a navigation bar
export default function NavigationBar({ extraLinks, title }) {
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Get the user data from localStorage to determine which dashboard to link to


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const role = localStorage.getItem("user_role");

    // Function to handle logout
    const handleLogout = () => {
        // Clear any authentication tokens or user data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');

        // Navigate to login page
        navigate('/login');
    };



    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-content">
                    <div>
                        <h1 className="navbar-title">{title}</h1>
                    </div>

                    <div className="navbar-actions">
                        {/* Create additional links provided as props*/}
                        {
                            extraLinks.map((element, index) => (
                                <button key={index} className={element.className} onClick={() => navigate(element.link)}>
                                    {element.logo}
                                    <span className={element.className + "-text"}>{element.text}</span>
                                </button>
                            ))
                        }

                        {/* Home button */}
                        <button
                            onClick={() => role == "volunteer" ? navigate("/volunteerdash") : navigate("/admindash")}
                            className="home-button"
                        >
                            <Home size={20} />
                        </button>

                        {/* Notifications */}
                        {/* Imported from Notification.jsx */}
                        <NotificationButton />

                        {/* Account */}
                        <div className="dropdown-container" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="icon-button"
                            >
                                <User size={20} />
                            </button>
                            {dropdownOpen && (
                                <div className="dropdown-menu">
                                    {role === "volunteer" && (
                                        <button onClick={() => navigate("/profile")}>Profile</button>
                                    )}
                                    <button onClick={() => alert("Delete account clicked!")}>Delete Account</button>
                                </div>
                            )}
                        </div>





                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            <LogOut size={18} />
                            <span className="logout-text">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}