import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Calendar, Clock, MapPin, Users } from 'lucide-react';
import NotificationButton from './Notification';
import NavigationBar from './Navigation';
import { 
  getVolunteerDashboard,
  getRecentVolunteerHistory,
  getNextUpcomingEvents,
  formatEventDate,
  formatEventTime 
} from '../helpers/volunteerhelpers';
import './VolunteerDash.css';

export default function VolunteerDashboard() {
  const [volunteerName, setVolunteerName] = useState('Loading...');
  const [notifications, setNotifications] = useState(0);
  const [volunteerHistory, setVolunteerHistory] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [statistics, setStatistics] = useState({
    total_hours: 0,
    events_completed: 0,
    upcoming_events: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const extraLinks = [];

  // Load volunteer dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load overview data from backend
        const dashboardData = await getVolunteerDashboard();
        
        // Update state with backend data
        setVolunteerName(dashboardData.volunteer_info.name);
        setVolunteerHistory(dashboardData.recent_history);
        setUpcomingEvents(dashboardData.upcoming_events);
        setStatistics(dashboardData.statistics);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleVolunteerMatching = () => {
    navigate("/volunteerhistory");
  };

  const handleViewAllEvents = () => {
    navigate("/ViewAllEvents");
  };

  // Helper function to format date for display (fallback for older date format)
  const formatDisplayDate = (dateString) => {
    try {
      if (dateString.includes('T')) {
        return formatEventDate(dateString);
      } else {
        // Handle legacy format like "March 15, 2025"
        return dateString;
      }
    } catch (error) {
      return dateString; // Return as-is if formatting fails
    }
  };

  // Helper function to format time for display (fallback for older time format)
  const formatDisplayTime = (timeString, endTimeString) => {
    try {
      if (timeString && timeString.includes(':') && !timeString.includes(' ')) {
        // New format: "14:00:00"
        return formatEventTime(timeString, endTimeString);
      } else {
        // Legacy format: "2:00 PM - 5:00 PM"
        return timeString;
      }
    } catch (error) {
      return timeString; // Return as-is if formatting fails
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="volunteer-dashboard">
        <NavigationBar extraLinks={extraLinks} title={"Volunteer Portal"}/>
        <div className="main-content">
          <div className="welcome-section">
            <h2 className="welcome-title">Loading Dashboard...</h2>
            <p className="welcome-subtitle">Please wait while we load your data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .volunteer-dashboard {
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
        }

        .navbar {
          width: 100%;
          background-color: white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid #e5e7eb;
        }

        .navbar-container {
          width: 100%;
          padding: 0 2rem;
        }

        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 4rem;
        }

        .navbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          color: #6b7280;
          background: none;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-button:hover {
          color: #111827;
          background-color: #f3f4f6;
        }

        .notification-button {
          position: relative;
          padding: 0.5rem;
          color: #6b7280;
          background: none;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
        }

        .notification-button:hover {
          color: #111827;
          background-color: #f3f4f6;
        }

        .main-content {
          width: 100%;
          padding: 2rem;
        }

        .welcome-section {
          margin-bottom: 2rem;
        }

        .welcome-title {
          font-size: 1.875rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
          color: #6b7280;
          margin: 0;
        }

        .error-message {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
        }

        .card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
          margin-left: 0.75rem;
        }

        .content-section {
          margin-bottom: 1rem;
        }

        .item-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item, .event-item {
          border-left: 4px solid;
          padding-left: 1rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }

        .history-item {
          border-left-color: #3b82f6;
        }

        .event-item {
          border-left-color: #10b981;
        }

        .item-title {
          font-weight: 500;
          color: #111827;
          margin: 0;
          margin-bottom: 0.25rem;
        }

        .item-details {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .item-details-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .item-details-row.with-margin {
          margin-top: 0.5rem;
        }

        .item-detail-with-icon {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .view-all-button {
          color: #3b82f6;
          background: none;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
          width: 100%;
          text-align: left;
        }

        .view-all-button:hover {
          color: #1d4ed8;
        }

        .view-all-button.green {
          color: #10b981;
        }

        .view-all-button.green:hover {
          color: #059669;
        }

        .stats-grid {
          margin-top: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          text-align: center;
        }

        .stat-number {
          font-size: 1.875rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-number.blue {
          color: #3b82f6;
        }

        .stat-number.green {
          color: #10b981;
        }

        .stat-number.purple {
          color: #8b5cf6;
        }

        .stat-label {
          color: #6b7280;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .volunteer-dashboard {
            background-color: #111827 !important;
            color: #f9fafb !important;
          }

          .welcome-title {
            color: #f9fafb !important;
          }

          .welcome-subtitle {
            color: #d1d5db !important;
          }

          .card, .stat-card {
            background-color: #1f2937 !important;
            border: 1px solid #374151 !important;
          }

          .card-title, .item-title {
            color: #f9fafb !important;
          }

          .item-details {
            color: #d1d5db !important;
          }

          .stat-label {
            color: #d1d5db !important;
          }

          .error-message {
            background-color: #fee2e2 !important;
            color: #dc2626 !important;
          }
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .navbar-content {
            flex-direction: column;
            gap: 1rem;
            height: auto;
            padding: 1rem 0;
          }
          
          .main-content {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="volunteer-dashboard">

        {/* Navigation bar imported from Navigation.jsx */}
        <NavigationBar extraLinks={extraLinks} title={"Volunteer Portal"}/>

        {/* Main Content */}
        <div className="main-content">
          {/* Welcome Message */}
          <div className="welcome-section">
            <h2 className="welcome-title">Welcome, {volunteerName}!</h2>
            <p className="welcome-subtitle">Ready to make a difference today?</p>
            {error && (
              <div className="error-message">
                {error} - Using fallback data
              </div>
            )}
          </div>

          {/* Dashboard Tiles */}
          <div className="dashboard-grid">
            {/* Volunteer History Tile */}
            <div className="card">
              <div className="card-header">
                <Clock color="#3b82f6" size={24} />
                <h3 className="card-title">Volunteer History</h3>
              </div>
              
              <div className="content-section">
                <div className="item-list">
                  {volunteerHistory.map((item) => (
                    <div key={item.id} className="history-item">
                      <h4 className="item-title">{item.event}</h4>
                      <div className="item-details">
                        <div className="item-details-row">
                          <span>{formatDisplayDate(item.date)}</span>
                          <span>{item.hours} hours</span>
                        </div>
                        <div className="item-details-row with-margin">
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
              
              <button className="view-all-button" onClick={handleVolunteerMatching}>
                View All History →
              </button>
            </div>

            {/* Upcoming Events Tile */}
            <div className="card">
              <div className="card-header">
                <Calendar color="#10b981" size={24} />
                <h3 className="card-title">Upcoming Events</h3>
              </div>
              
              <div className="content-section">
                <div className="item-list">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="event-item">
                      <h4 className="item-title">{event.event}</h4>
                      <div className="item-details">
                        <div className="item-details-row">
                          <span>{formatDisplayDate(event.date)}</span>
                          <span>{formatDisplayTime(event.time, event.endTime)}</span>
                        </div>
                        <div className="item-details-row with-margin">
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
              
              <button className="view-all-button green" onClick={handleViewAllEvents}>
                View All Events →
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number blue">{statistics.total_hours}</div>
              <div className="stat-label">Total Hours Volunteered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number green">{statistics.events_completed}</div>
              <div className="stat-label">Events Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number purple">{statistics.upcoming_events}</div>
              <div className="stat-label">Upcoming Events</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}