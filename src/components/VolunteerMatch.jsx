import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VolunteerMatch() {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [matchedEvents, setMatchedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setVolunteers([]); // Empty until backend integration
    setEvents([]);     // Empty until backend integration
  }, []);

  useEffect(() => {
    if (selectedVolunteer) {
      const matched = events.filter(ev =>
        ev.requiredSkills?.some(skill => selectedVolunteer.skills.includes(skill))
      );
      setMatchedEvents(matched);
    } else {
      setMatchedEvents([]);
    }
    setSelectedEvent(null);
  }, [selectedVolunteer, events]);

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

    alert('Volunteer matched successfully!');
    navigate('/history');
  };

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

      {/* Volunteer dropdown */}
      <label style={labelStyle}>
        Select Volunteer:
        <select
          value={selectedVolunteer ? selectedVolunteer.email : ''}
          onChange={(e) =>
            setSelectedVolunteer(volunteers.find(v => v.email === e.target.value) || null)
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

      {/* Matched Events dropdown (always enabled) */}
      <label style={labelStyle}>
        Matched Event:
        <select
          value={selectedEvent ? selectedEvent.name : ''}
          onChange={(e) =>
            setSelectedEvent(matchedEvents.find(ev => ev.name === e.target.value) || null)
          }
          style={inputStyle}
        >
          <option value="">--Select Event--</option>
          {matchedEvents.length > 0 ? (
            matchedEvents.map((ev) => (
              <option key={ev.name} value={ev.name}>
                {ev.name}
              </option>
            ))
          ) : (
            <option disabled>No matching events</option>
          )}
        </select>
      </label>

      {/* Match button */}
      <button
        onClick={handleMatch}
        style={buttonStyle}
        disabled={!selectedVolunteer || !selectedEvent}
      >
        Match Volunteer
      </button>
    </div>
  );
}
