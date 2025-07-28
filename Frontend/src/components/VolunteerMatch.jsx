import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';
import { History, Settings } from 'lucide-react';
import { createNotification } from '../helpers/notificationHelpers';
import { checkTokenTime } from "../helpers/authHelpers";

// Notification helper
async function sendNotification(email, data, message) {
  const newNotification = {
    receiver: data.volunteer.email,
    message: `New event assigned: ${data.event.name}`,
    date: data.event.date,
    read: false
  };
  await createNotification(newNotification);
  alert(`Notification to ${email}: ${message}`);
}

export default function VolunteerMatch() {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  const extraLinks = [
    {
      className: "nav-button",
      link: "/eventmanagement",
      logo: <Settings size={16} />,
      text: "Event Management"
    },
    {
      className: "nav-button",
      link: "/eventhistory",
      logo: <History size={16} />,
      text: " Event History"
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      await checkTokenTime();

      try {
        const response = await fetch('http://localhost:5000/api/matching/match/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch volunteers/events.');
        }

        const data = await response.json();
        setVolunteers(data.volunteers);
        setEvents(data.events);
      } catch (error) {
        alert('Error fetching data: ' + error.message);
      }
    };

    fetchData();
  }, []);

  const handleMatch = async () => {
    if (!selectedVolunteer || !selectedEvent) {
      alert('Please select both a volunteer and an event.');
      return;
    }

    const token = localStorage.getItem('access_token');
    await checkTokenTime();

    if (!token) {
      alert('You are not authenticated. Please log in.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/matching/match/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          volunteer_email: selectedVolunteer.email,
          event_name: selectedEvent.name
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        alert('Error: ' + (errData.message || response.statusText));
        return;
      }

      const data = await response.json();
      sendNotification(data.volunteer.email, data, `You have been matched to the event: ${data.event.name}`);
      setMatchResult({ volunteer: data.volunteer, event: data.event });
    } catch (error) {
      alert('Failed to match volunteer: ' + error.message);
    }
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
