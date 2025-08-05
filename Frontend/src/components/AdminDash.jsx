import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';
import { Bell, User, LogOut, Calendar, Clock, MapPin, Users, Settings, UserCheck, History, ChevronDown, ClipboardCheck } from 'lucide-react';
import { 
  getAdminDashboard,
  getTopVolunteers,
  getUpcomingEvents,
  getAdminStatistics 
} from '../helpers/adminhelpers';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Admin Manager');
  const [notifications, setNotifications] = useState(0);
  const [sortBy, setSortBy] = useState('events'); // 'events' or 'rating'
  const [topVolunteers, setTopVolunteers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [statistics, setStatistics] = useState({
    totalVolunteers: 0,
    upcomingEvents: 0,
    eventsToFinalize: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);

  // Load admin dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load overview data from backend
        const dashboardData = await getAdminDashboard();
        
        // Update state with backend data
        setAdminName(dashboardData.admin_info.name);
        setNotifications(dashboardData.admin_info.notifications);
        //setTopVolunteers(dashboardData.top_volunteers);
        setUpcomingEvents(dashboardData.upcoming_events);
        setStatistics(dashboardData.statistics);
        handleSortChange("events");
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle sort change and reload data
  const handleSortChange = async (newSortBy) => {
    setSortBy(newSortBy);
    try {
      const volunteers = await getTopVolunteers(newSortBy, 5);
      setTopVolunteers(volunteers);
    } catch (error) {
      console.error('Error updating volunteer sort:', error);
      // Keep existing data if sort fails
    }
  };

  // Helper function to format date for display
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to format time for display
  const formatEventTime = (startTime, endTime) => {
    const formatTime = (timeString) => {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const handleEventManagement = () => {
    navigate('/eventmanagement');
  };

  // Array containing props to be sent to navigationbar component
const extraLinks = [
  {
    className: "nav-button",
    link: "/eventmanagement",
    logo: <Settings size={16} />,
    text: "Event Management"
  },
  {
    className: "nav-button",
    link: "/volunteermatch",
    logo: <UserCheck size={16} />,
    text: "Volunteer Matching"
  },
  {
    className: "nav-button",
    link: "/EventReview",
    logo: <ClipboardCheck size={16} />,
    text: "Event Review"
  },
];

  // Loading state
  if (loading) {
    return (
      <div className="admin-dashboard">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"}/>
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
        .admin-dashboard {
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
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
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .card-title-section {
          display: flex;
          align-items: center;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
          margin-left: 0.75rem;
        }

        .sort-dropdown {
          position: relative;
        }

        .sort-select {
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background-color: white;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMuNSA1LjI1TDcgOC43NUwxMC41IDUuMjUiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
        }

        .content-section {
          margin-bottom: 1rem;
        }

        .item-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .volunteer-item, .event-item {
          border-left: 4px solid;
          padding-left: 1rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }

        .volunteer-item {
          border-left-color: #3b82f6;
        }

        .event-item {
          border-left-color: #10b981;
        }

        .item-title {
          font-weight: 500;
          color: #111827;
          margin: 0;
        }

        .item-details {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .item-details-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .item-details-row.with-margin {
          margin-top: 0.25rem;
        }

        .item-detail-with-icon {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .expertise-text {
          font-weight: 500;
        }

        .view-all-button {
          color: #3b82f6;
          background: none;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
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
          .admin-dashboard {
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

          .sort-select {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: #f9fafb !important;
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

      <div className="admin-dashboard">
        
        {/* Navigation bar imported from Navigation.jsx */}
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"}/>
        

        {/* Main Content */}
        <div className="main-content">
          {/* Welcome Message */}
          <div className="welcome-section">
            <h2 className="welcome-title">Welcome, Administrator!</h2>
            <p className="welcome-subtitle">Manage your volunteer community and events</p>
            {error && (
              <div className="error-message">
                {error} - Using fallback data
              </div>
            )}
          </div>

          {/* Dashboard Tiles */}
          <div className="dashboard-grid">
            {/* Top Volunteers Tile */}
            <div className="card">
              <div className="card-header">
                <div className="card-title-section">
                  <Users color="#3b82f6" size={24} />
                  <h3 className="card-title">Top Volunteers</h3>
                </div>

                {/* Sort Dropdown */}
                <div className="sort-dropdown">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select"
                  >
                    <option value="events">Sort by Events</option>
                    <option value="rating">Sort by Rating</option>
                  </select>
                </div>
              </div>

              <div className="content-section">
                <div className="item-list">
                  {topVolunteers.map((volunteer) => (
                    <div key={volunteer.id} className="volunteer-item">
                      <h4 className="item-title">{volunteer.name}</h4>
                      <div className="item-details">
                        <div className="item-details-row">
                          <span>{volunteer.events} events</span>
                          <span>⭐ {volunteer.rating}</span>
                          <span>{volunteer.totalHours} hours</span>
                        </div>
                        <div className="item-details-row with-margin">
                          <span className="expertise-text">
                            Skills: {volunteer.expertise}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => navigate('/volunteers')} className="view-all-button">
                View All Volunteers →
              </button>
            </div>

            {/* Upcoming Events Tile */}
            <div className="card">
              <div className="card-header">
                <div className="card-title-section">
                  <Calendar color="#10b981" size={24} />
                  <h3 className="card-title">Upcoming Events</h3>
                </div>
              </div>

              <div className="content-section">
                <div className="item-list">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="event-item">
                      <h4 className="item-title">{event.event}</h4>
                      <div className="item-details">
                        <div className="item-details-row">
                          <span>{formatEventDate(event.date)}</span>
                          <span>{formatEventTime(event.time, event.endTime)}</span>
                        </div>
                        <div className="item-details-row with-margin">
                          <div className="item-detail-with-icon">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                          </div>
                          <div className="item-detail-with-icon">
                            <Users size={14} />
                            <span>{event.volunteers} Volunteers Needed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleEventManagement} className="view-all-button green">
                Manage Events →
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number blue">{statistics.totalVolunteers}</div>
              <div className="stat-label">Total Volunteers</div>
            </div>

            <div className="stat-card">
              <div className="stat-number green">{statistics.upcomingEvents}</div>
              <div className="stat-label">Upcoming Events</div>
            </div>

            <div className="stat-card">
              <div className="stat-number purple">{statistics.eventsToFinalize}</div>
              <div className="stat-label">Events to be Finalized</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
