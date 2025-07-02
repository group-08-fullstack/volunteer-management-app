import React, { useState } from 'react';
import { Calendar, MapPin, Users, X, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';

export default function EventManagementPage() {
  const navigate = useNavigate();

  const [removeMode, setRemoveMode] = useState(false);

  const extraLinks = [
    {
      className: "home-button",
      link: "/home",
      //logo: <Home size={18} />,
      //text: "Home"
    }
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
    <NavigationBar extraLinks={extraLinks} />
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto', backgroundColor: '#f9fafb' }}>
      {/* Header with icon, title and buttons aligned right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Calendar color="#10b981" size={24} style={{ marginRight: '0.75rem' }} />
          <h2 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>Events Management</h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleCreateEvent} style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}>
            Create Event
          </button>
          <button onClick={() => setRemoveMode(!removeMode)} style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}>
            {removeMode ? 'Cancel' : 'Remove Event'}
          </button>
        </div>
      </div>

      {/* Upcoming Events List */}
      <div>
        {events.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No upcoming events.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map(event => (
            <div
              key={event.id}
              onClick={() => {
                if (!removeMode) alert(`You are entering ${event.event} event editing page`);
              }}
              style={{
                position: 'relative',
                borderLeft: '4px solid #10b981',
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s ease-in-out',
                cursor: removeMode ? 'default' : 'pointer',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '0.25rem' }}>
                {event.event}
              </h4>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>{event.date}</span>
                  <span>{event.time}</span>
                </div>
                <div style={{
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#ef4444'
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );

}
