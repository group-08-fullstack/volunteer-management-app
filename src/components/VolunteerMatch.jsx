import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';
import { Home } from 'lucide-react';

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
  const [matchedData, setMatchedData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedVolunteers = JSON.parse(localStorage.getItem('profiles') || '[]');
    const savedEvents = JSON.parse(localStorage.getItem('events') || '[]');

    const matches = savedVolunteers.map((vol) => {
      const participation = JSON.parse(localStorage.getItem(`participation_${vol.email}`) || '[]');
      return { ...vol, matches: participation };
    });

    setVolunteers(savedVolunteers);
    setEvents(savedEvents);
    setMatchedData(matches);
  };

  const handleMatch = () => {
    if (!selectedVolunteer || !selectedEvent) {
      alert('Please select both a volunteer and an event.');
      return;
    }

    const participationKey = `participation_${selectedVolunteer.email}`;
    const currentParticipation = JSON.parse(localStorage.getItem(participationKey) || '[]');

    if (currentParticipation.some(ev => ev.name === selectedEvent.name)) {
      alert('This volunteer is already matched to the selected event.');
      return;
    }

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

    sendNotification(
      selectedVolunteer.email,
      `You have been matched to the event: ${selectedEvent.name}`
    );

    alert('Volunteer matched successfully!');
    setSelectedVolunteer(null);
    setSelectedEvent(null);
    loadData();
  };

  const extraLinks = [
    { className: "match-home", link: "/adminDash", logo: <Home size={18} />, text: "Dashboard" },
  ];

  return (
    <>
      <NavigationBar extraLinks={extraLinks}/>

      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
        <h2>Match Volunteers</h2>

        <div style={{ marginTop: '20px' }}>
          <label><strong>Select Volunteer:</strong></label>
          <select
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            value={selectedVolunteer?.email || ''}
            onChange={(e) =>
              setSelectedVolunteer(volunteers.find(v => v.email === e.target.value))
            }
          >
            <option value="">-- Select Volunteer --</option>
            {volunteers.map((vol) => (
              <option key={vol.email} value={vol.email}>
                {vol.name}
              </option>
            ))}
          </select>

          <label style={{ marginTop: '15px' }}><strong>Select Event:</strong></label>
          <select
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            value={selectedEvent?.name || ''}
            onChange={(e) =>
              setSelectedEvent(events.find(ev => ev.name === e.target.value))
            }
          >
            <option value="">-- Select Event --</option>
            {events.map((ev) => (
              <option key={ev.name} value={ev.name}>
                {ev.name}
              </option>
            ))}
          </select>

          <button onClick={handleMatch} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
            Match Volunteer
          </button>
        </div>

        {selectedVolunteer && selectedEvent && (
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Profile Match Overview</h3>
            <p><strong>Volunteer:</strong> {selectedVolunteer.name}</p>
            <p><strong>Skills:</strong> {selectedVolunteer.skills?.map(s => s.value || s).join(', ') || 'N/A'}</p>

            <p><strong>Event:</strong> {selectedEvent.name}</p>
            <p><strong>Required Skills:</strong> {selectedEvent.requiredSkills?.join(', ') || 'N/A'}</p>
            <p><strong>Urgency:</strong> {selectedEvent.urgency || 'N/A'}</p>
            <p><strong>Date:</strong> {selectedEvent.date || 'N/A'}</p>
          </div>
        )}

        <hr style={{ margin: '40px 0' }} />

        <h3>All Volunteer Matches</h3>
        {matchedData.map((vol) => (
          <div key={vol.email} style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '20px', background: '#fff' }}>
            <strong>{vol.name}</strong>
            <p>{vol.skills?.map(s => s.value || s).join(', ') || 'None'}</p>
            {vol.matches.length > 0 ? (
              <ul style={{ paddingLeft: '20px' }}>
                {vol.matches.map((match, idx) => (
                  <li key={idx} style={{ marginBottom: '10px' }}>
                    <strong>Event:</strong> {match.name}<br />
                    <strong>Date:</strong> {match.eventDate}<br />
                    <strong>Description:</strong> {match.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'gray' }}>No events matched yet.</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
