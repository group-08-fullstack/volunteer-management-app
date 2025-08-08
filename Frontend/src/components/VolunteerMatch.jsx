import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';
import { History, Settings, Calendar, MapPin, Users, AlertCircle, FileText, Clock, User, Award, Phone, Mail, UserCheck, ClipboardCheck } from 'lucide-react';
import { createNotification } from '../helpers/notificationHelpers';
import { checkTokenTime } from "../helpers/authHelpers";

// Notification helper
async function sendNotification(data) {
  const newNotification = {
    receiver: data.volunteer.email,
    message: `New event assigned: ${data.event.name}`,
    date: new Date().toISOString().split('T')[0],
    read: false
  };
  await createNotification(newNotification);
  alert(`Notification sent to ${data.volunteer.email}`);
}


export default function VolunteerMatch() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);

const extraLinks = [
  {
    className: "nav-button",
    link: "/eventmanagement",
    logo: <Settings size={16} />,
    text: "Event Management"
  },
  {
    className: "nav-button",
    link: "/volunteermatch",
    logo: <UserCheck size={16} />,
    text: "Volunteer Matching"
  },
  {
    className: "nav-button",
    link: "/EventReview",
    logo: <ClipboardCheck size={16} />,
    text: "Event Review"
  },
];

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('access_token');
      await checkTokenTime();

      try {
        setLoading(true);

        // Only fetch events initially
        const eventsResponse = await fetch('http://localhost:5000/api/matching/match/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events.');
        }

        const eventsData = await eventsResponse.json();
        console.log('Events received:', eventsData.events?.length || 0);

        setEvents(eventsData.events || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Fetch volunteers when event is selected
  const handleEventSelect = async (eventId) => {
    if (!eventId) {
      setSelectedEvent(null);
      setFilteredVolunteers([]);
      setSelectedVolunteer(null);
      return;
    }

    const event = events.find(e => e.id === parseInt(eventId));
    setSelectedEvent(event);
    setSelectedVolunteer(null);
    setMatchResult(null);

    if (!event) return;

    try {
      setLoadingVolunteers(true);
      const token = sessionStorage.getItem('access_token');

      console.log(`Fetching volunteers for event ${event.id}`);

      // Fetch filtered volunteers from backend
      const volunteersResponse = await fetch(`http://localhost:5000/api/matching/volunteers/${event.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!volunteersResponse.ok) {
        throw new Error('Failed to fetch volunteers for this event.');
      }

      const volunteersData = await volunteersResponse.json();
      console.log('Volunteer data received:', volunteersData);
      
      setFilteredVolunteers(volunteersData.volunteers || []);
      
      // Update the selected event with current volunteers_needed count
      if (volunteersData.volunteers_needed !== undefined) {
        setSelectedEvent(prev => ({
          ...prev,
          volunteers_needed: volunteersData.volunteers_needed,
          is_fully_staffed: volunteersData.is_fully_staffed || false
        }));
      }

    } catch (error) {
      console.error('Error fetching volunteers:', error);
      alert('Error fetching volunteers: ' + error.message);
      setFilteredVolunteers([]);
    } finally {
      setLoadingVolunteers(false);
    }
  };

  const handleVolunteerSelect = (volunteerEmail) => {
    const volunteer = filteredVolunteers.find(v => v.email === volunteerEmail);
    setSelectedVolunteer(volunteer);
  };

  const handleFinalize = async () => {
    if (!selectedEvent) {
      alert('No event selected for finalization.');
      return;
    }

    if (!confirm(`Are you sure you want to finalize "${selectedEvent.event_name}"? This action cannot be undone.`)) {
      return;
    }

    const token = sessionStorage.getItem('access_token');
    await checkTokenTime();

    if (!token) {
      alert('You are not authenticated. Please log in.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/matching/finalize/${selectedEvent.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        alert('Error: ' + (errData.message || response.statusText));
        return;
      }

      const data = await response.json();
      alert(`Event "${selectedEvent.event_name}" has been successfully finalized!`);
      
      // Reset the page after successful finalization
      setTimeout(() => {
        setSelectedEvent(null);
        setSelectedVolunteer(null);
        setFilteredVolunteers([]);
        setMatchResult(null);
        // Refresh events list
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      alert('Failed to finalize event: ' + error.message);
    }
  };

  const handleMatch = async () => {
    if (!selectedVolunteer || !selectedEvent) {
      alert('Please select both an event and a volunteer.');
      return;
    }

    const token = sessionStorage.getItem('access_token');
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
          event_name: selectedEvent.event_name
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        alert('Error: ' + (errData.message || response.statusText));
        return;
      }

      const data = await response.json();
      sendNotification(data);
      setMatchResult({ volunteer: data.volunteer, event: data.event });
      
      // Reset the page after successful match
      setTimeout(() => {
        setSelectedEvent(null);
        setSelectedVolunteer(null);
        setFilteredVolunteers([]);
        setMatchResult(null);
      }, 1500); // Wait 1.5 seconds to show success message, then reset
      
    } catch (error) {
      alert('Failed to match volunteer: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Parse the date as local date to avoid timezone issues
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // Create date using local timezone
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const day = parseInt(parts[2]);
        const date = new Date(year, month, day);
        
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // Fallback to original method if parsing fails
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <>
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />
        <div className="volunteer-match-container">
          <div className="loading-message">Loading events...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .volunteer-match-container {
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
          padding: 2rem;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.875rem;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }

        .step-container {
          margin-bottom: 2rem;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background-color: white;
          cursor: pointer;
        }

        .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .event-info, .volunteer-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: #f8fafc;
          border-radius: 0.375rem;
          border-left: 3px solid #3b82f6;
        }

        .info-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .info-value {
          font-size: 0.875rem;
          color: #111827;
          font-weight: 500;
        }

        .urgency-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .urgency-low {
          background-color: #d1fae5;
          color: #065f46;
        }

        .urgency-medium {
          background-color: #fef3c7;
          color: #92400e;
        }

        .urgency-high {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .description-box {
          grid-column: 1 / -1;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          padding: 1rem;
          margin-top: 1rem;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .skill-tag {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background-color: #dbeafe;
          color: #1e40af;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .assign-button {
          padding: 0.75rem 2rem;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: background-color 0.2s;
          margin-top: 1rem;
        }

        .assign-button:hover:not(:disabled) {
          background-color: #059669;
        }

        .assign-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .no-volunteers-message {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 2rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
          border: 1px dashed #d1d5db;
        }

        .loading-message {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .success-message {
          background-color: #d1fae5;
          color: #065f46;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-top: 1rem;
          border: 1px solid #a7f3d0;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .volunteer-match-container {
            background-color: #111827 !important;
            color: #f9fafb !important;
          }

          .page-title {
            color: #f9fafb !important;
          }

          .step-title {
            color: #f9fafb !important;
          }

          .card {
            background-color: #1f2937 !important;
            border-color: #374151 !important;
          }

          .form-label {
            color: #e5e7eb !important;
          }

          .form-select {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: #f9fafb !important;
          }

          .info-item {
            background-color: #374151 !important;
          }

          .info-value {
            color: #f9fafb !important;
          }

          .description-box {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: #f9fafb !important;
          }

          .no-volunteers-message {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: #d1d5db !important;
          }
        }

        @media (max-width: 768px) {
          .volunteer-match-container {
            padding: 1rem;
          }

          .event-info, .volunteer-info {
            grid-template-columns: 1fr;
          }

          .info-item {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }
        }
      `}</style>

      <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />

      <div className="volunteer-match-container">
        <div className="main-content">
          <div className="page-header">
            <Users color="#3b82f6" size={32} />
            <h1 className="page-title">Volunteer Matching</h1>
          </div>

          {/* Step 1: Select Event */}
          <div className="step-container">
            <div className="step-header">
              <div className="step-number">1</div>
              <h2 className="step-title">Select Event</h2>
            </div>
            <div className="card">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Choose Event (Pending Status Only)
                </label>
                <select
                  value={selectedEvent ? selectedEvent.id : ''}
                  onChange={(e) => handleEventSelect(e.target.value)}
                  className="form-select"
                >
                  <option value="">--Select Event--</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.event_name} - {formatDate(event.date)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvent && (
                <div className="event-info">
                  <div className="info-item">
                    <Calendar size={16} color="#3b82f6" />
                    <div>
                      <div className="info-label">Date</div>
                      <div className="info-value">{formatDate(selectedEvent.date)}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <MapPin size={16} color="#3b82f6" />
                    <div>
                      <div className="info-label">Location</div>
                      <div className="info-value">{selectedEvent.location_name}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <MapPin size={16} color="#3b82f6" />
                    <div>
                      <div className="info-label">State</div>
                      <div className="info-value">{selectedEvent.state}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <Clock size={16} color="#3b82f6" />
                    <div>
                      <div className="info-label">Duration</div>
                      <div className="info-value">{selectedEvent.event_duration} hours</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <Users size={16} color="#3b82f6" />
                    <div>
                      <div className="info-label">Volunteers Needed</div>
                      <div className="info-value">{selectedEvent.volunteers_needed}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <AlertCircle size={16} color="#3b82f6" />
                    <div>
                      <div className="info-label">Urgency</div>
                      <div className="info-value">
                        <span className={`urgency-badge urgency-${selectedEvent.urgency.toLowerCase()}`}>
                          {selectedEvent.urgency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.required_skills && selectedEvent.required_skills.length > 0 && (
                    <div className="info-item" style={{gridColumn: '1 / -1'}}>
                      <Award size={16} color="#3b82f6" />
                      <div style={{width: '100%'}}>
                        <div className="info-label">Required Skills</div>
                        <div className="skills-list">
                          {selectedEvent.required_skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.event_description && (
                    <div className="description-box">
                      <div className="info-label">Description</div>
                      <div className="info-value">{selectedEvent.event_description}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Select Volunteer or Show Matched Volunteers */}
          {selectedEvent && (
            <div className="step-container">
              <div className="step-header">
                <div className="step-number">2</div>
                <h2 className="step-title">
                  {selectedEvent.is_fully_staffed ? 'Matched Volunteers' : 'Select Volunteer'}
                </h2>
              </div>
              <div className="card">
                {loadingVolunteers ? (
                  <div className="loading-message">Loading volunteers...</div>
                ) : selectedEvent.is_fully_staffed ? (
                  // Show matched volunteers when event is fully staffed
                  <>
                    <div className="success-message">
                      <h3>✅ Event Fully Staffed!</h3>
                      <p>This event has all required volunteers assigned ({filteredVolunteers.length} volunteers).</p>
                    </div>
                    
                    <h4 style={{marginTop: '1.5rem', marginBottom: '1rem', color: '#374151'}}>
                      Assigned Volunteers:
                    </h4>
                    
                    {filteredVolunteers.map((volunteer, index) => (
                      <div key={volunteer.email} className="volunteer-info" style={{marginBottom: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem'}}>
                        <div className="info-item">
                          <User size={16} color="#3b82f6" />
                          <div>
                            <div className="info-label">Name</div>
                            <div className="info-value">{volunteer.fullName}</div>
                          </div>
                        </div>

                        <div className="info-item">
                          <Mail size={16} color="#3b82f6" />
                          <div>
                            <div className="info-label">Email</div>
                            <div className="info-value">{volunteer.email}</div>
                          </div>
                        </div>

                        <div className="info-item">
                          <MapPin size={16} color="#3b82f6" />
                          <div>
                            <div className="info-label">Location</div>
                            <div className="info-value">{volunteer.city}, {volunteer.state}</div>
                          </div>
                        </div>

                        <div className="info-item">
                          <AlertCircle size={16} color="#3b82f6" />
                          <div>
                            <div className="info-label">Status</div>
                            <div className="info-value">{volunteer.participation_status}</div>
                          </div>
                        </div>

                        {volunteer.skills && volunteer.skills.length > 0 && (
                          <div className="info-item" style={{gridColumn: '1 / -1'}}>
                            <Award size={16} color="#3b82f6" />
                            <div style={{width: '100%'}}>
                              <div className="info-label">Skills</div>
                              <div className="skills-list">
                                {volunteer.skills.map((skill, skillIndex) => (
                                  <span key={skillIndex} className="skill-tag">
                                    {skill.label || skill.value || skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : filteredVolunteers.length === 0 ? (
                  <div className="no-volunteers-message">
                    <p>No volunteers found for this event.</p>
                    <p>Volunteers must be in the same state ({selectedEvent.state}) and available on {formatDate(selectedEvent.date)}.</p>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <User size={16} />
                        Choose Volunteer (Same State & Available on Event Date)
                        <span style={{marginLeft: '0.5rem', color: '#6b7280'}}>
                          ({selectedEvent.volunteers_needed} volunteers still needed)
                        </span>
                      </label>
                      <select
                        value={selectedVolunteer ? selectedVolunteer.email : ''}
                        onChange={(e) => handleVolunteerSelect(e.target.value)}
                        className="form-select"
                      >
                        <option value="">--Select Volunteer--</option>
                        {filteredVolunteers.map((volunteer) => (
                          <option key={volunteer.email} value={volunteer.email}>
                            {volunteer.fullName} (Age: {calculateAge(volunteer.dateOfBirth)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedVolunteer && (
                      <div className="volunteer-info">
                        <div className="info-item">
                          <User size={16} color="#3b82f6" />
                          <div>
                            <div className="info-label">Name</div>
                            <div className="info-value">{selectedVolunteer.fullName}</div>
                          </div>
                        </div>

                        <div className="info-item">
                          <Clock size={16} color="#3b82f6" />
                          <div>
                            <div className="info-label">Age</div>
                            <div className="info-value">{calculateAge(selectedVolunteer.dateOfBirth)} years old</div>
                          </div>
                        </div>

                        <div className="info-item">
                          <Mail size={16} color="#3b82f6" />
                          <div>
                            <div className="info-label">Email</div>
                            <div className="info-value">{selectedVolunteer.email}</div>
                          </div>
                        </div>

                        {selectedVolunteer.phoneNumber && (
                          <div className="info-item">
                            <Phone size={16} color="#3b82f6" />
                            <div>
                              <div className="info-label">Phone</div>
                              <div className="info-value">{selectedVolunteer.phoneNumber}</div>
                            </div>
                          </div>
                        )}

                        <div className="info-item">
                          <MapPin size={16} color="#3b82f6" />
                          <div>
                            <div className="info-label">Location</div>
                            <div className="info-value">{selectedVolunteer.city}, {selectedVolunteer.state}</div>
                          </div>
                        </div>

                        {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
                          <div className="info-item" style={{gridColumn: '1 / -1'}}>
                            <Award size={16} color="#3b82f6" />
                            <div style={{width: '100%'}}>
                              <div className="info-label">Skills</div>
                              <div className="skills-list">
                                {selectedVolunteer.skills.map((skill, index) => (
                                  <span key={index} className="skill-tag">
                                    {skill.label || skill.value || skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Assign Volunteer or Finalize Event */}
          {selectedEvent && (
            <div className="step-container">
              <div className="step-header">
                <div className="step-number">3</div>
                <h2 className="step-title">
                  {selectedEvent.is_fully_staffed ? 'Finalize Event' : 'Assign Volunteer'}
                </h2>
              </div>
              <div className="card">
                {selectedEvent.is_fully_staffed ? (
                  <>
                    <p>All volunteers have been assigned to <strong>{selectedEvent.event_name}</strong>.</p>
                    <p>Are you ready to finalize this event? This will mark it as completed and remove it from the pending events list.</p>
                    <button onClick={handleFinalize} className="assign-button" style={{backgroundColor: '#f59e0b'}}>
                      Finalize Event
                    </button>
                  </>
                ) : selectedVolunteer ? (
                  <>
                    <p>Ready to assign <strong>{selectedVolunteer.fullName}</strong> to <strong>{selectedEvent.event_name}</strong>?</p>
                    <button onClick={handleMatch} className="assign-button">
                      Assign Volunteer to Event
                    </button>

                    {matchResult && (
                      <div className="success-message">
                        <h3>✅ Match Successful!</h3>
                        <p><strong>{matchResult.volunteer.name}</strong> has been successfully assigned to <strong>{matchResult.event.name}</strong>.</p>
                        <p>A notification has been sent to the volunteer.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p>Select a volunteer above to assign them to this event.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}