import React, { useState, useEffect } from 'react';
import { MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';
import { checkTokenTime } from '../helpers/authHelpers';

export default function ViewAllEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

    async function fetchEvents() {
      try {
        await checkTokenTime(); 

        const response = await fetch("http://localhost:5000/api/eventlist/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch events or unauthorized");
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>Error loading events: {error}</p>;

  return (
    <>
      <style>{`
        .view-all-event-container {
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
        .no-events-message {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
          padding: 2rem;
        }
      `}</style>

      <div className="view-all-event-container">
        <NavigationBar extraLinks={[]} title={"Upcoming Events"} />

        <div className="main-content">
          <h2 style={{ paddingBottom: '20px', textAlign: 'center' }}>
            Check out the latest events to help your community
          </h2>

          <div className="events-container">
            {events.length === 0 ? (
              <div className="no-events-message">No upcoming events.</div>
            ) : (
              <div className="events-list">
                {events.map(event => (
                  <div
                    key={event.id}
                    className="event-item"
                    onClick={() => navigate(`/event/${event.id}`)}                   >
                    <h4 className="event-title">{event.event_name}</h4>
                    <div className="event-details">
                      <div className="event-details-row">
                        <span>{event.date}</span>
                        <span>{event.event_duration} hrs</span>
                      </div>
                      <div className="event-details-row">
                        <div className="event-detail-with-icon">
                          <MapPin size={14} />
                          <span>{`${event.location_name}, ${event.city}, ${event.state}`}</span>
                        </div>
                        <div className="event-detail-with-icon">
                          <Users size={14} />
                          <span>{event.volunteers_needed} volunteers</span>
                        </div>
                      </div>
                    </div>
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
