import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, X, UserCheck, Settings, History, Star, ChevronLeft, ChevronRight, ClipboardCheck, BarChart3, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';
import { createNotification } from '../helpers/notificationHelpers';
import { checkTokenTime } from "../helpers/authHelpers";

// Notification helper
async function sendNotification(volunteer, event_id) {
  const token = sessionStorage.getItem("access_token");
  await checkTokenTime();

  // Grab event via id
  const response = await fetch(`http://localhost:5000/api/eventlist/${event_id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
  
  if (!response.ok) {
    throw new Error("Failed to fetch event details");
  }


  const selectedEvent = await response.json();

  const newNotification = {
    receiver: volunteer.email,
    message: `Assigned Event Deleted: ${selectedEvent.event_name}`,
    date: selectedEvent.date,
    read: false
  };
  await createNotification(newNotification);
  alert(`Notification sent to ${volunteer.email}`);
}

export default function EventManagementPage() {
  const [removeMode, setRemoveMode] = useState(false);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10);

  // Filter and sort state
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const navigate = useNavigate();

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
    loadEvents();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [events, statusFilter, sortBy, sortOrder]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortBy, sortOrder]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("access_token");
      await checkTokenTime();

      const response = await fetch("http://localhost:5000/api/eventlist/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      console.log('Loaded events:', data);

      setEvents(data.events || data || []);

    } catch (error) {
      console.error("Failed to fetch events:", error);
      setError("Failed to load events. You may need to log in again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...events];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => {
        const eventStatus = (event.event_status || 'pending').toLowerCase();
        return eventStatus === statusFilter.toLowerCase();
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'name') {
        aValue = (a.event_name || '').toLowerCase();
        bValue = (b.event_name || '').toLowerCase();
      } else if (sortBy === 'date') {
        aValue = new Date(a.date || '1970-01-01');
        bValue = new Date(b.date || '1970-01-01');
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleEventEditing = (eventId) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleCreateReport = () => {
  navigate('/eventreport');
};

  const handleRemoveEvent = async (eventId) => {
    const confirmed = window.confirm('Are you sure you want to remove this event?');
    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("access_token");
      await checkTokenTime();

      let response  = await fetch(`http://localhost:5000/api/eventreview/${eventId}/volunteers`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await response.json();
      const volunteers = data.volunteers || []; 

      //const volunteers = data["volunteers"];

      if (volunteers.length > 0) {
        for(let volunteer = 0; volunteer < volunteers.length; volunteer++){
          sendNotification(volunteers[volunteer],eventId);
        }
      }


      response = await fetch(`http://localhost:5000/api/eventlist/${eventId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setEvents(events.filter(event => event.id !== eventId));
      alert("Event deleted successfully!");


    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        const date = new Date(year, month, day);

        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

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

  const formatSkills = (skills) => {
    if (!skills) return 'No skills specified';
    if (Array.isArray(skills)) {
      return skills.join(', ');
    }
    return skills;
  };

  const getStatusColor = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
        return '#fbbf24'; // Yellow
      case 'finalized':
        return '#3b82f6'; // Blue
      case 'completed':
        return '#10b981'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  // Pagination calculations
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="event-management-container">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />
        <div className="main-content">
          <div className="loading-message">Loading events...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-management-container">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />
        <div className="main-content">
          <div className="error-message">
            {error}
            <button onClick={loadEvents} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        .report-button {
          background-color: #3b82f6;
          color: white;
        }

        .report-button:hover {
          background-color: #2563eb;
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

        .filters-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background-color: white;
          cursor: pointer;
          min-width: 140px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .results-info {
          font-size: 0.875rem;
          color: #6b7280;
          margin-left: auto;
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
          border-left: 4px solid;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
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

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .event-title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .event-title {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: white;
        }

        .event-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          color: #3b82f6;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
        }

        .edit-button:hover {
          background-color: #eff6ff;
        }

        .urgency-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-left: 0.5rem;
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

        .event-details {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .event-details-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.25rem;
          flex-wrap: wrap;
        }

        .event-detail-with-icon {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .event-description {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.4;
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

        .loading-message, .error-message {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .error-message {
          color: #ef4444;
        }

        .retry-button {
          margin-left: 1rem;
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .retry-button:hover {
          background-color: #1d4ed8;
        }

        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
          padding: 1rem;
        }

        .pagination-button {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          background-color: white;
          color: #374151;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .pagination-button:hover:not(:disabled) {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }

        .pagination-button.active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 1rem;
        }

        @media (max-width: 768px) {
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

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }

          .event-details-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .pagination-container {
            flex-wrap: wrap;
            gap: 0.25rem;
          }

          .pagination-info {
            order: -1;
            width: 100%;
            text-align: center;
            margin-bottom: 1rem;
          }
        }
          /* Dark mode support */
@media (prefers-color-scheme: dark) {
  .event-management-container {
    background-color: #111827 !important;
    color: #f9fafb !important;
  }

  .events-container {
    background-color: #1f2937 !important;
    border: 1px solid #374151 !important;
  }

  .event-item {
    background-color: #374151 !important;
  }

  .event-item:hover {
    background-color: #4b5563 !important;
  }

  .event-title {
    color: #f9fafb !important;
  }

  .event-details {
    color: #d1d5db !important;
  }

  .event-description {
    color: #e5e7eb !important;
  }

  .page-title {
    color: #f9fafb !important;
  }

  .filter-label {
    color: #e5e7eb !important;
  }

  .filter-select {
    background-color: #374151 !important;
    border-color: #4b5563 !important;
    color: #f9fafb !important;
  }

  .pagination-button {
    background-color: #374151 !important;
    border-color: #4b5563 !important;
    color: #f9fafb !important;
  }

  .pagination-button:hover:not(:disabled) {
    background-color: #4b5563 !important;
  }

  .pagination-button.active {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: white !important;
  }

  .no-events-message, .loading-message {
    color: #d1d5db !important;
  }

  .results-info, .pagination-info {
    color: #d1d5db !important;
  }

  .error-message {
    color: #ef4444 !important;
  }

  .retry-button {
    background-color: #3b82f6 !important;
    color: white !important;
  }

  .retry-button:hover {
    background-color: #1d4ed8 !important;
  }
}
      `}</style>

      <div className="event-management-container">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />

        <div className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-title-section">
              <Calendar color="#10b981" size={32} />
              <h2 className="page-title">Event Management</h2>
            </div>

            <div className="page-actions">
              <button onClick={handleCreateEvent} className="action-button create-button">
                Create Event
              </button>
              <button onClick={handleCreateReport} className="action-button report-button">
                <BarChart3 size={16} />
                Create Report
              </button>
              <button
                onClick={() => setRemoveMode(!removeMode)}
                className={`action-button remove-button ${removeMode ? 'cancel' : ''}`}
              >
                {removeMode ? 'Cancel' : 'Remove Event'}
              </button>
            </div>
          </div>

          {/* Filters and Sort Section */}
          <div className="filters-section">
            <div className="filter-group">
              <label className="filter-label">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="finalized">Finalized</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Date</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="asc">
                  {sortBy === 'date' ? 'Oldest' : 'A to Z'}
                </option>
                <option value="desc">
                  {sortBy === 'date' ? 'Newest' : 'Z to A'}
                </option>
              </select>
            </div>

            <div className="results-info">
              Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
            </div>
          </div>

          {/* Events Container */}
          <div className="events-container">
            {currentEvents.length === 0 ? (
              <div className="no-events-message">
                {filteredEvents.length === 0 && events.length > 0 ? (
                  <>No events match your current filters.</>
                ) : (
                  <>
                    No events found. <br />
                    <button onClick={handleCreateEvent} className="create-button action-button" style={{ marginTop: '1rem' }}>
                      Create Your First Event
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="events-list">
                {currentEvents.map(event => (
                  <div
                    key={event.id}
                    className={`event-item ${removeMode ? 'remove-mode' : ''}`}
                    style={{
                      borderLeftColor: getStatusColor(event.event_status)
                    }}
                  >
                    <div className="event-header">
                      <div className="event-title-section">
                        <h4 className="event-title">{event.event_name || event.eventname || event.event}</h4>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(event.event_status)
                          }}
                        >
                          {event.event_status || 'Pending'}
                        </span>
                        {event.urgency && (
                          <span className={`urgency-badge urgency-${event.urgency.toLowerCase()}`}>
                            {event.urgency}
                          </span>
                        )}
                      </div>

                      {!removeMode && (
                        <div className="event-actions">
                          <button
                            onClick={() => handleEventEditing(event.id)}
                            title="Edit this event"
                            className="edit-button"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="event-details">
                      <div className="event-details-row">
                        <span><strong>Date:</strong> {formatDate(event.date)}</span>
                        {event.event_duration && (
                          <span><strong>Duration:</strong> {event.event_duration} hours</span>
                        )}
                      </div>

                      <div className="event-details-row">
                        <div className="event-detail-with-icon">
                          <MapPin size={14} />
                          <span>{event.location_name || event.location || event.city}</span>
                        </div>
                        {event.state && (
                          <span><strong>State:</strong> {event.state}</span>
                        )}
                        {event.zipcode && (
                          <span><strong>Zip:</strong> {event.zipcode}</span>
                        )}
                        {event.volunteers_needed && (
                          <span><strong>Volunteers Needed:</strong> {event.volunteers_needed}</span>
                        )}
                      </div>

                      {event.required_skills && (
                        <div className="event-details-row">
                          <span><strong>Required Skills:</strong> {formatSkills(event.required_skills)}</span>
                        </div>
                      )}

                      {event.event_description && (
                        <div className="event-description">
                          <strong>Description:</strong> {event.event_description}
                        </div>
                      )}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  <ChevronRight size={16} />
                </button>

                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}