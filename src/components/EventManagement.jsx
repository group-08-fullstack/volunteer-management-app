import React, { useState } from 'react';
import { Calendar, MapPin, Users, X,UserCheck, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';

export default function EventManagementPage() {
  const [removeMode, setRemoveMode] = useState(false);
  const navigate = useNavigate();


  // Array containing props to be sent to navigationbar component
  const extraLinks = [
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
  const [events, setEvents] = useState([
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
  ]);

  const handleCreateEvent = () => {
    navigate('/createevent');
  };

  const handleRemoveEvent = (id) => {
    const confirmed = window.confirm('Are you sure you want to remove this event?');
    if (confirmed) {
      setEvents(events.filter(event => event.id !== id));
    }
  };



  return (
    <>
      <style>{`
        .event-management-container {
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
        }

        .main-content {
          width: 100%;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .page-title-section {
          display: flex;
          align-items: center;
        }

        .page-title {
          font-size: 1.875rem;
          font-weight: bold;
          color: #111827;
          margin: 0;
          margin-left: 0.75rem;
        }

        .page-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .create-button {
          background-color: #10b981;
          color: white;
        }

        .create-button:hover {
          background-color: #059669;
        }

        .remove-button {
          background-color: #ef4444;
          color: white;
        }

        .remove-button:hover {
          background-color: #dc2626;
        }

        .remove-button.cancel {
          background-color: #6b7280;
        }

        .remove-button.cancel:hover {
          background-color: #4b5563;
        }

        .events-container {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .event-item {
          position: relative;
          border-left: 4px solid #10b981;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }

        .event-item:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          background-color: #f3f4f6;
        }

        .event-item.remove-mode {
          cursor: default;
        }

        .event-title {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }

        .event-details {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .event-details-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.25rem;
        }

        .event-detail-with-icon {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .remove-event-button {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          color: #ef4444;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
        }

        .remove-event-button:hover {
          background-color: #fef2f2;
        }

        .no-events-message {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .navbar-content {
            flex-direction: column;
            gap: 1rem;
            height: auto;
            padding: 1rem 0;
          }
          
          .main-content {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .page-actions {
            justify-content: center;
          }
        }
      `}</style>

      <div className="event-management-container">
        {/* Navbar */}
        {/* Naviagation bar imported from Navigation.jsx */}
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"}/>

        {/* Main Content */}
        <div className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-title-section">
              <Calendar color="#10b981" size={32} />
              <h2 className="page-title">Events Management</h2>
            </div>

            <div className="page-actions">
              <button onClick={handleCreateEvent} className="action-button create-button">
                Create Event
              </button>
              <button 
                onClick={() => setRemoveMode(!removeMode)} 
                className={`action-button remove-button ${removeMode ? 'cancel' : ''}`}
              >
                {removeMode ? 'Cancel' : 'Remove Event'}
              </button>
            </div>
          </div>

          {/* Events Container */}
          <div className="events-container">
            {events.length === 0 ? (
              <div className="no-events-message">No upcoming events.</div>
            ) : (
              <div className="events-list">
                {events.map(event => (
                  <div
                    key={event.id}
                    onClick={() => {
                      if (!removeMode) alert(`You are entering ${event.event} event editing page`);
                    }}
                    className={`event-item ${removeMode ? 'remove-mode' : ''}`}
                  >
                    <h4 className="event-title">{event.event}</h4>
                    <div className="event-details">
                      <div className="event-details-row">
                        <span>{event.date}</span>
                        <span>{event.time}</span>
                      </div>
                      <div className="event-details-row">
                        <div className="event-detail-with-icon">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                        <div className="event-detail-with-icon">
                          <Users size={14} />
                          <span>{event.volunteers} volunteers</span>
                        </div>
                      </div>
                    </div>

                    {removeMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveEvent(event.id);
                        }}
                        title="Remove this event"
                        className="remove-event-button"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}