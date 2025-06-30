import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationButton from './Notification';
import { Bell, User, LogOut, Calendar, Clock, MapPin, Users, Settings, UserCheck, History, ChevronDown } from 'lucide-react';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Admin Manager');
  const [notifications, setNotifications] = useState(5);
  const [sortBy, setSortBy] = useState('events'); // 'events' or 'rating'
  const navigate = useNavigate();

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
    alert('Event Management - Navigate to event management page');
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navbar */}
      <nav style={{ 
        width: '100%', 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        borderBottom: '1px solid #e5e7eb' 
      }}>
        <div style={{ width: '100%', padding: '0 2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            height: '4rem' 
          }}>
            <div>
              <h1 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827' 
              }}>
                Admin Portal
              </h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Admin Navigation Buttons */}
              <button
                onClick={handleEventManagement}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#111827';
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6b7280';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <Settings size={16} />
                Event Management
              </button>

              <button
                onClick={handleVolunteerMatching}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#111827';
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6b7280';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <UserCheck size={16} />
                Volunteer Matching
              </button>

              <button
                onClick={handleEventHistory}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#111827';
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6b7280';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <History size={16} />
                Event History
              </button>

              {/* Notifications */}
              {/* Imported from Notification.jsx */}
              <NotificationButton />

              {/* Account */}
              <button
                onClick={handleAccountClick}
                style={{
                  position: 'relative',
                  padding: '0.5rem',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#111827';
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6b7280';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <User size={20} />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#111827';
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6b7280';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <LogOut size={18} />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

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
  );
}
