import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';
import { Calendar, MapPin, Users, X, Home, LogOut, UserCheck, User, History } from 'lucide-react';


// notification
function sendNotification(email, message) {
  alert(`Notification to ${email}: ${message}`);
}

export default function VolunteerMatch() {
  const navigate = useNavigate();

  const volunteers = [
    { email: 'alice@yahoo.com', name: 'Alice Johnson' },
    { email: 'bob@yahoo.com', name: 'Bob Smith' },
    { email: 'carol@yahoo.com', name: 'Carol Williams' }
  ];

  const events = [
    {
      name: 'Food Drive',
      description: 'Help distribute food to those in need',
      location: 'Community Center',
      requiredSkills: ['Food Handling', 'Communication'],
      urgency: 'High',
      date: '2025-08-15'
    },
    {
      name: 'Animal Shelter Support',
      description: 'Assist with animal care and adoption events',
      location: 'Animal Shelter',
      requiredSkills: ['Animal Handling'],
      urgency: 'Medium',
      date: '2025-09-01'
    }
  ];

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

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  const handleMatch = () => {
    if (!selectedVolunteer || !selectedEvent) {
      alert('Please select both a volunteer and an event.');
      return;
    }

    sendNotification(
      selectedVolunteer.email,
      `You have been matched to the event: ${selectedEvent.name}`
    );

    setMatchResult({
      volunteer: selectedVolunteer,
      event: selectedEvent
    });
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

  const resultBoxStyle = {
    marginTop: '30px',
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#eef',
    lineHeight: '1.6'
  };

  return (
    <>
      {/* Naviagation bar imported from Navigation.jsx */}
      <NavigationBar extraLinks={extraLinks} title={"Admin Portal"}/>

      <div style={containerStyle}>
        <h2>Volunteer Match</h2>

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
                {vol.name}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Select Event:
          <select
            value={selectedEvent ? selectedEvent.name : ''}
            onChange={(e) =>
              setSelectedEvent(events.find(ev => ev.name === e.target.value) || null)
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

        {matchResult && (
          <div style={resultBoxStyle}>
            <h3>Match Result</h3>
            <p><strong>Volunteer:</strong> {matchResult.volunteer.name} ({matchResult.volunteer.email})</p>
            <p><strong>Event:</strong> {matchResult.event.name}</p>
            <p><strong>Description:</strong> {matchResult.event.description}</p>
            <p><strong>Date:</strong> {matchResult.event.date}</p>
            <p><strong>Location:</strong> {matchResult.event.location}</p>
            <p><strong>Urgency:</strong> {matchResult.event.urgency}</p>
          </div>
        )}
      </div>
    </>
  );
}
