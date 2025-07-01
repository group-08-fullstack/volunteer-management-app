import { useNavigate } from 'react-router-dom'; 
import { Calendar, MapPin, Users } from 'lucide-react';

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

export default function EventManagementPage() {
  const navigate = useNavigate();

  const handleCreateEvent = () => {
    navigate('/createevent');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto', backgroundColor: '#f9fafb' }}>
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
          <button style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}>
            Remove Event
          </button>

          <button style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'orange',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}>
            Edit Event
          </button>
        </div>
      </div>

      {/* Upcoming Events List */}
      <div>
        {upcomingEvents.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No upcoming events.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {upcomingEvents.map(event => (
            <div key={event.id} style={{
              borderLeft: '4px solid #10b981',
              paddingLeft: '1rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem'
            }}>
              <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '0.25rem' }}>
                {event.event}
              </h4>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
