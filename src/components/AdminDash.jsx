import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationButton from './Notification'
import NavigationBar from './Navigation';;
import { Bell, User, LogOut, Calendar, Clock, MapPin, Users, Settings, UserCheck, History, ChevronDown } from 'lucide-react';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Admin Manager');
  const [notifications, setNotifications] = useState(5);
  const [sortBy, setSortBy] = useState('events'); // 'events' or 'rating'
  const navigate = useNavigate();
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);//xxx

  // Sample data for top volunteers
  const topVolunteers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      events: 12,
      rating: 4.7,
      totalHours: 48,
      expertise: 'Community Outreach'
    },
    {
      id: 2,
      name: 'Michael Chen',
      events: 10,
      rating: 4.8,
      totalHours: 42,
      expertise: 'Environmental'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      events: 9,
      rating: 4.9,
      totalHours: 36,
      expertise: 'Youth Programs'
    },
  ];

  // Sort volunteers based on selected criteria
  const sortedVolunteers = [...topVolunteers].sort((a, b) => {
    if (sortBy === 'events') {
      return b.events - a.events;
    } else {
      return b.rating - a.rating;
    }
  });

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

  // Array containg props to be sent to navigationbar component
  const extraLinks = [
  {
    className: "nav-button",          // CSS class for styling
    link: "/createevent",                     // Path to navigate to
    logo:  <Settings size={16} />,          // lucide-react icon component
    text: "Event Management"                       // Label displayed next to the icon
  },
    {
    className: "nav-button",          // CSS class for styling
    link: "/volunteermatch",                     // Path to navigate to
    logo:  <UserCheck size={16} />,          // lucide-react icon component
    text: "Volunteer Matching"                       // Label displayed next to the icon
  },
    {
    className: "nav-button",          // CSS class for styling
    link: null,                     // Path to navigate to
    logo:  <History size={16} />,          // lucide-react icon component
    text: " Event History"                       // Label displayed next to the icon
  },
];

  const handleLogout = () => {
    // Clear any authentication tokens or user data
    // localStorage.removeItem('authToken');
    // localStorage.removeItem('userData');
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

  const handleEventManagement = () => {
    navigate('/createevent')
  };

  const handleVolunteerMatching = () => {
    navigate('/volunteermatch');
  };

  const handleEventHistory = () => {
    alert('Event History - Navigate to event history page');
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

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

          .navbar {
            background-color: #1f2937 !important;
            border-bottom: 1px solid #374151 !important;
          }

          .navbar-title {
            color: #f9fafb !important;
          }

          .nav-button {
            color: #d1d5db !important;
          }

          .nav-button:hover {
            color: #f9fafb !important;
            background-color: #374151 !important;
          }

          .notification-button {
            color: #d1d5db !important;
          }

          .notification-button:hover {
            color: #f9fafb !important;
            background-color: #374151 !important;
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
        
        {/* Naviagation bar imported from Navigation.jsx */}
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"}/>
        

      {/* Main Content */}
      <div style={{ width: '100%', padding: '2rem' }}>
        {/* Welcome Message */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Welcome, {adminName}!
          </h2>
          <p style={{ color: '#6b7280' }}>
            Manage your volunteer community and events
          </p>
        </div>

        {/* Dashboard Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '2rem'
        }}>
          {/* Top Volunteers Tile */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Users style={{ marginRight: '0.75rem' }} color="#3b82f6" size={24} />
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  Top Volunteers
                </h3>
              </div>

              {/* Sort Dropdown */}
              <div style={{ position: 'relative' }}>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  style={{
                    padding: '0.5rem 2rem 0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMuNSA1LjI1TDcgOC43NUwxMC41IDUuMjUiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center'
                  }}
                >
                  <option value="events">Sort by Events</option>
                  <option value="rating">Sort by Rating</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {sortedVolunteers.map((volunteer) => (
                  <div key={volunteer.id} style={{
                    borderLeft: '4px solid #3b82f6',
                    paddingLeft: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem'
                  }}>
                    <h4 style={{ fontWeight: '500', color: '#111827' }}>
                      {volunteer.name}
                    </h4>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <span>{volunteer.events} events</span>
                        <span>⭐ {volunteer.rating}</span>
                        <span>{volunteer.totalHours} hours</span>
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <span style={{ fontWeight: '500' }}>
                          Expertise: {volunteer.expertise}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => alert('View all volunteers')}
              style={{
                color: '#3b82f6',
                background: 'none',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
            >
              View All Volunteers →
            </button>
          </div>

          {/* Upcoming Events Tile */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <Calendar style={{ marginRight: '0.75rem' }} color="#10b981" size={24} />
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827'
              }}>
                Upcoming Events
              </h3>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {upcomingEvents.map((event) => (
                  <div key={event.id} style={{
                    borderLeft: '4px solid #10b981',
                    paddingLeft: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem'
                  }}>
                    <h4 style={{ fontWeight: '500', color: '#111827' }}>
                      {event.event}
                    </h4>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <span>{event.date}</span>
                        <span>{event.time}</span>
                      </div>
                      <div style={{
                        marginTop: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Users size={14} />
                          <span>{event.volunteers} volunteers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => alert('View all events')}
              style={{
                color: '#10b981',
                background: 'none',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#059669'}
              onMouseLeave={(e) => e.target.style.color = '#10b981'}
            >
              Manage Events →
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: '#3b82f6'
            }}>
              156
            </div>
            <div style={{ color: '#6b7280' }}>Total Volunteers</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: '#10b981'
            }}>
              8
            </div>
            <div style={{ color: '#6b7280' }}>Upcoming Events</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: '#8b5cf6'
            }}>
              5
            </div>
            <div style={{ color: '#6b7280' }}>Events to be Finalized</div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
