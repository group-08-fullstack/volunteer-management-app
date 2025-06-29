import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Calendar, Clock, MapPin, Users } from 'lucide-react';
import './VolunteerDash.css';

export default function VolunteerDashboard() {
  const [volunteerName, setVolunteerName] = useState('Sarah Johnson');
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();

  // Sample data for demonstration
  const volunteerHistory = [
    {
      id: 1,
      event: 'Community Food Drive',
      date: 'March 15, 2025',
      hours: 4,
      location: 'Downtown Community Center'
    },
    {
      id: 2,
      event: 'Beach Cleanup',
      date: 'March 8, 2025',
      hours: 3,
      location: 'Sunset Beach'
    },
    {
      id: 3,
      event: 'Animal Shelter Help',
      date: 'February 28, 2025',
      hours: 5,
      location: 'Happy Paws Shelter'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      event: 'Senior Center Visit',
      date: 'July 5, 2025',
      time: '2:00 PM - 5:00 PM',
      location: 'Golden Years Senior Center',
      volunteers: 8
    },
    {
      id: 2,
      event: 'Park Restoration',
      date: 'July 12, 2025',
      time: '9:00 AM - 1:00 PM',
      location: 'Riverside Park',
      volunteers: 15
    },
    {
      id: 3,
      event: 'Youth Mentoring',
      date: 'July 18, 2025',
      time: '4:00 PM - 6:00 PM',
      location: 'Community Youth Center',
      volunteers: 5
    }
  ];

  const handleLogout = () => {
    // Clear any authentication tokens or user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Navigate to login page
    navigate('/login');
  };

  const handleNotificationClick = () => {
    alert(`You have ${notifications} new notifications`);
  };

  const handleAccountClick = () => {
    alert('Account settings');
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div>
              <h1 className="navbar-title">Volunteer Portal</h1>
            </div>
            
            <div className="navbar-actions">
              {/* Notifications */}
              <button
                onClick={handleNotificationClick}
                className="icon-button"
              >
                <Bell size={20} />
                {notifications > 0 && (
                  <span className="notification-badge">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Account */}
              <button
                onClick={handleAccountClick}
                className="icon-button"
              >
                <User size={20} />
              </button>

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

      {/* Main Content */}
      <div className="main-content">
        {/* Welcome Message */}
        <div className="welcome-section">
          <h2 className="welcome-title">
            Welcome, {volunteerName}!
          </h2>
          <p className="welcome-subtitle">Ready to make a difference today?</p>
        </div>

        {/* Dashboard Tiles */}
        <div className="dashboard-grid">
          {/* Volunteer History Tile */}
          <div className="card">
            <div className="card-header">
              <Clock className="card-icon" color="#3b82f6" size={24} />
              <h3 className="card-title">Volunteer History</h3>
            </div>
            
            <div className="card-content">
              <div className="item-list">
                {volunteerHistory.map((item) => (
                  <div key={item.id} className="item history">
                    <h4 className="item-title">{item.event}</h4>
                    <div className="item-details">
                      <div className="item-detail-row">
                        <span>{item.date}</span>
                        <span>{item.hours} hours</span>
                      </div>
                      <div className="item-detail-row with-margin">
                        <div className="item-detail-with-icon">
                          <MapPin size={14} />
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="view-all-button">
              View All History →
            </button>
          </div>

          {/* Upcoming Events Tile */}
          <div className="card">
            <div className="card-header">
              <Calendar className="card-icon" color="#10b981" size={24} />
              <h3 className="card-title">Upcoming Events</h3>
            </div>
            
            <div className="card-content">
              <div className="item-list">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="item event">
                    <h4 className="item-title">{event.event}</h4>
                    <div className="item-details">
                      <div className="item-detail-row">
                        <span>{event.date}</span>
                        <span>{event.time}</span>
                      </div>
                      <div className="item-detail-row with-margin">
                        <div className="item-detail-with-icon">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                        <div className="item-detail-with-icon">
                          <Users size={14} />
                          <span>{event.volunteers} volunteers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="view-all-button green">
              View All Events →
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number blue">24</div>
            <div className="stat-label">Total Hours Volunteered</div>
          </div>
          <div className="stat-card">
            <div className="stat-number green">7</div>
            <div className="stat-label">Events Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number purple">3</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
        </div>
      </div>
    </div>
  );
}