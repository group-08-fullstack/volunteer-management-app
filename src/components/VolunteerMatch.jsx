import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper function to send notification
function sendNotification(email, message) {
  const notifications = JSON.parse(localStorage.getItem(`notifications_${email}`) || '[]');
  notifications.push({ message, timestamp: new Date().toISOString() });
  localStorage.setItem(`notifications_${email}`, JSON.stringify(notifications));
}

export default function VolunteerMatch() {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const navigate = useNavigate();

  // Load volunteers and events
  useEffect(() => {
    const savedVolunteers = JSON.parse(localStorage.getItem('profiles') || '[]');
    setVolunteers(savedVolunteers);

    const savedEvents = JSON.parse(localStorage.getItem('events') || '[]');
    setEvents(savedEvents);
  }, []);

  // Match selected volunteer
  const handleMatch = () => {
    if (!selectedVolunteer || !selectedEvent) {
      alert('Please select both a volunteer and an event.');
      return;
    }

    const participationKey = `participation_${selectedVolunteer.email}`;
    const currentParticipation = JSON.parse(localStorage.getItem(participationKey) || '[]');

    currentParticipation.push({
      name: selectedEvent.name,
      description: selectedEvent.description,
      location: selectedEvent.location,
      requiredSkills: selectedEvent.requiredSkills || [],
      urgency: selectedEvent.urgency || '',
      eventDate: selectedEvent.date || '',
      status: 'Matched'
    });

    localStorage.setItem(participationKey, JSON.stringify(currentParticipation));

    // Notify the volunteer
    sendNotification(
      selectedVolunteer.email,
      `You have been matched to the event: ${selectedEvent.name}`
    );

    alert('Volunteer matched and notified successfully!');
   
    navigate('/adminDash');
  };

  // Styles
  const containerStyle = {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '30px',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    fontFamily: 'Segoe UI, sans-serif'
  };

  const labelStyle = {
    marginTop: '15px',
    fontWeight: 'bold',
    display: 'block'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    marginTop: '20px',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <h2>Volunteer Match</h2>

      <label style={labelStyle}>
        Select Volunteer:
        <select
          value={selectedVolunteer ? selectedVolunteer.email : ''}
          onChange={(e) =>
            setSelectedVolunteer(volunteers.find(v => v.email === e.target.value))
          }
          style={inputStyle}
        >
          <option value="">--Select Volunteer--</option>
          {volunteers.map((vol) => (
            <option key={vol.email} value={vol.email}>
              {vol.name} ({vol.email})
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Select Event:
        <select
          value={selectedEvent ? selectedEvent.name : ''}
          onChange={(e) =>
            setSelectedEvent(events.find(ev => ev.name === e.target.value))
          }
          style={inputStyle}
        >
          <option value="">--Select Event--</option>
          {events.map((ev) => (
            <option key={ev.name} value={ev.name}>
              {ev.name}
            </option>
          ))}
        </select>
      </label>

      <button onClick={handleMatch} style={buttonStyle}>
        Match Volunteer
      </button>
    </div>
  );
}
