import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, X, UserCheck, Settings, History, Star, ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';
import { createNotification } from '../helpers/notificationHelpers';
import { checkTokenTime } from "../helpers/authHelpers";

// Notification helper
async function sendNotification(reviewingVolunteer,selectedEvent) {
  const newNotification = {
    receiver: reviewingVolunteer.email,
    message: `Performance feedback added: ${selectedEvent.eventName}`,
    date: new Date().toISOString().split('T')[0],
    read: false
  };
  await createNotification(newNotification);
  alert(`Notification sent to ${reviewingVolunteer.email}`);
}

export default function EventReviewPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10);
  const [reviewingVolunteer, setReviewingVolunteer] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    participationStatus: '',
    performance: 0,
    notes: ''
  });
  
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

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("access_token");
      await checkTokenTime();

      const response = await fetch("http://localhost:5000/api/eventreview/finalized", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events for review");
      }

      const data = await response.json();
      setEvents(data.events || []);

    } catch (error) {
      console.error("Failed to fetch events:", error);
      setError("Failed to load events for review.");
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteers = async (eventId) => {
    try {
      const token = sessionStorage.getItem("access_token");

      const response = await fetch(`http://localhost:5000/api/eventreview/${eventId}/volunteers`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch volunteers");
      }

      const data = await response.json();
      setVolunteers(data.volunteers || []);

    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
      alert("Failed to load volunteers for this event.");
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    loadVolunteers(event.id);
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
    setVolunteers([]);
    setReviewingVolunteer(null);
    loadEvents(); // Refresh the events list
  };

  const handleReviewVolunteer = (volunteer) => {
    setReviewingVolunteer(volunteer);
    setReviewForm({
      participationStatus: volunteer.participationStatus === 'Registered' ? '' : volunteer.participationStatus,
      performance: volunteer.performance || 0,
      notes: volunteer.notes || ''
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.participationStatus) {
      alert('Please select a participation status');
      return;
    }

    if (reviewForm.participationStatus === 'Volunteered' && (!reviewForm.performance || reviewForm.performance < 1 || reviewForm.performance > 5)) {
      alert('Please provide a valid performance rating (1-5 stars) for volunteers');
      return;
    }

    try {
      const token = sessionStorage.getItem("access_token");

      const response = await fetch(`http://localhost:5000/api/eventreview/${selectedEvent.id}/volunteer/${reviewingVolunteer.volunteerId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reviewForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      alert("Review submitted successfully!");
      sendNotification(reviewingVolunteer,selectedEvent);
      setReviewingVolunteer(null);
      loadVolunteers(selectedEvent.id); // Refresh volunteers list

    } catch (error) {
      console.error("Failed to submit review:", error);
      alert(`Failed to submit review: ${error.message}`);
    }
  };

  const handleCompleteEvent = async () => {
    const pendingCount = volunteers.filter(v => v.needsReview).length;
    
    if (pendingCount > 0) {
      alert(`You must review all volunteers before completing this event. ${pendingCount} reviews remaining.`);
      return;
    }

    const confirmed = window.confirm('Are you sure you want to mark this event as completed? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("access_token");

      const response = await fetch(`http://localhost:5000/api/eventreview/${selectedEvent.id}/complete`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete event");
      }

      alert("Event marked as completed successfully!");
      handleBackToEvents();

    } catch (error) {
      console.error("Failed to complete event:", error);
      alert(`Failed to complete event: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
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

const renderStars = (rating, interactive = false, onChange = null) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => {
        const isFilled = star <= rating; // Selected/filled state
        const isHovered = interactive && star <= hoverRating; // Hover state
        
        return (
          <Star
            key={star}
            size={20}
            className={`star ${interactive ? 'interactive' : ''}`}
            fill={isFilled ? '#fbbf24' : 'none'} // Only filled when selected
            stroke={isHovered || isFilled ? '#fbbf24' : '#d1d5db'} // Border highlight on hover or selected
            strokeWidth={2}
            onClick={interactive ? () => onChange(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              transition: 'fill 0.2s, stroke 0.2s'
            }}
          />
        );
      })}
    </div>
  );
};

  // Pagination calculations
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="event-review-container">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />
        <div className="main-content">
          <div className="loading-message">Loading events for review...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-review-container">
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
        .event-review-container {
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

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #6b7280;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .back-button:hover {
          background-color: #4b5563;
        }

        .events-container, .volunteers-container {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }

        .events-list, .volunteers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .event-item, .volunteer-item {
          border-left: 4px solid #8b5cf6;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .event-item:hover, .volunteer-item:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          background-color: #f3f4f6;
        }

        .volunteer-item.reviewed {
          border-left-color: #10b981;
        }

        .volunteer-item.needs-review {
          border-left-color: #f59e0b;
        }

        .event-header, .volunteer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .event-title, .volunteer-name {
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

        .status-finalized {
          background-color: #3b82f6;
        }

        .status-registered {
          background-color: #f59e0b;
        }

        .status-volunteered {
          background-color: #10b981;
        }

        .status-did-not-show {
          background-color: #ef4444;
        }

        .event-details, .volunteer-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .review-button, .complete-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .review-button {
          background-color: #3b82f6;
          color: white;
        }

        .review-button:hover {
          background-color: #1d4ed8;
        }

        .complete-button {
          background-color: #10b981;
          color: white;
        }

        .complete-button:hover {
          background-color: #059669;
        }

        .complete-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        .modal-close:hover {
          color: #111827;
          background-color: #f3f4f6;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-select, .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background-color: white;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          min-height: 80px;
          resize: vertical;
          font-family: inherit;
        }

        .star-rating {
          display: flex;
          gap: 0.25rem;
          margin-top: 0.5rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .cancel-button {
          padding: 0.75rem 1.5rem;
          background-color: #6b7280;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .cancel-button:hover {
          background-color: #4b5563;
        }

        .submit-button {
          padding: 0.75rem 1.5rem;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .submit-button:hover {
          background-color: #059669;
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

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .event-review-container {
            background-color: #111827 !important;
            color: #f9fafb !important;
          }

          .events-container, .volunteers-container {
            background-color: #1f2937 !important;
            border: 1px solid #374151 !important;
          }

          .event-item, .volunteer-item {
            background-color: #374151 !important;
          }

          .event-item:hover, .volunteer-item:hover {
            background-color: #4b5563 !important;
          }

          .event-title, .volunteer-name {
            color: #f9fafb !important;
          }

          .detail-item {
            color: #d1d5db !important;
          }

          .page-title {
            color: #f9fafb !important;
          }

          .modal-content {
            background-color: #1f2937 !important;
          }

          .modal-title {
            color: #f9fafb !important;
          }

          .form-label {
            color: #e5e7eb !important;
          }

          .form-select, .form-textarea {
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
          }

          .no-events-message, .loading-message {
            color: #d1d5db !important;
          }

          .modal-header {
            border-bottom-color: #374151 !important;
          }
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

          .event-details, .volunteer-details {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            flex-direction: column;
          }

          .pagination-container {
            flex-wrap: wrap;
            gap: 0.25rem;
          }
        }
      `}</style>

      <div className="event-review-container">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />

        <div className="main-content">
          {!selectedEvent ? (
            <>
              {/* Events List View */}
              <div className="page-header">
                <div className="page-title-section">
                  <UserCheck color="#8b5cf6" size={32} />
                  <h2 className="page-title">Event Review</h2>
                </div>
              </div>

              <div className="events-container">
                {currentEvents.length === 0 ? (
                  <div className="no-events-message">
                    <UserCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3>No Finalized Events Found</h3>
                    <p>No events are ready for review. Events must be finalized before they can be reviewed.</p>
                  </div>
                ) : (
                  <div className="events-list">
                    {currentEvents.map(event => (
                      <div
                        key={event.id}
                        className="event-item"
                        onClick={() => handleEventSelect(event)}
                      >
                        <div className="event-header">
                          <h4 className="event-title">{event.eventName}</h4>
                          <span className="status-badge status-finalized">
                            {event.status}
                          </span>
                        </div>

                        <div className="event-details">
                          <div className="detail-item">
                            <Calendar size={16} />
                            <span>{formatDate(event.eventDate)}</span>
                          </div>

                          <div className="detail-item">
                            <MapPin size={16} />
                            <span>{event.location}</span>
                          </div>

                          <div className="detail-item">
                            <Users size={16} />
                            <span>{event.totalVolunteers} volunteers assigned</span>
                          </div>

                          {event.pendingReviews > 0 && (
                            <div className="detail-item">
                              <UserCheck size={16} />
                              <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                                {event.pendingReviews} reviews pending
                              </span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <div style={{ 
                            marginTop: '0.75rem', 
                            fontSize: '0.875rem', 
                            color: '#374151',
                            backgroundColor: '#f8fafc',
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            borderLeft: '3px solid #8b5cf6'
                          }}>
                            <strong>Description:</strong> {event.description}
                          </div>
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

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
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
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Volunteers Review View */}
              <div className="page-header">
                <div className="page-title-section">
                  <UserCheck color="#8b5cf6" size={32} />
                  <h2 className="page-title">Review: {selectedEvent.eventName}</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleCompleteEvent}
                    disabled={volunteers.some(v => v.needsReview)}
                    className="complete-button"
                    title={volunteers.some(v => v.needsReview) ? 'Complete all reviews first' : 'Mark event as completed'}
                  >
                    Complete Event
                  </button>
                  <button onClick={handleBackToEvents} className="back-button">
                    <ChevronLeft size={16} />
                    Back to Events
                  </button>
                </div>
              </div>

              <div className="volunteers-container">
                {volunteers.length === 0 ? (
                  <div className="no-events-message">
                    <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3>No Volunteers Assigned</h3>
                    <p>No volunteers are assigned to this event.</p>
                  </div>
                ) : (
                  <div className="volunteers-list">
                    {volunteers.map(volunteer => (
                      <div
                        key={volunteer.volunteerId}
                        className={`volunteer-item ${volunteer.needsReview ? 'needs-review' : 'reviewed'}`}
                      >
                        <div className="volunteer-header">
                          <h4 className="volunteer-name">{volunteer.fullName}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className={`status-badge status-${volunteer.participationStatus.toLowerCase().replace(' ', '-')}`}>
                              {volunteer.participationStatus}
                            </span>
                            {volunteer.needsReview && (
                              <button
                                onClick={() => handleReviewVolunteer(volunteer)}
                                className="review-button"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="volunteer-details">
                          <div className="detail-item">
                            <span>Email: {volunteer.email}</span>
                          </div>

                          {volunteer.performance && (
                            <div className="detail-item">
                              <span>Rating:</span>
                              {renderStars(volunteer.performance)}
                            </div>
                          )}
                        </div>

                        {volunteer.notes && (
                          <div style={{ 
                            marginTop: '0.75rem', 
                            fontSize: '0.875rem', 
                            color: '#374151',
                            backgroundColor: '#f8fafc',
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            borderLeft: '3px solid #3b82f6'
                          }}>
                            <strong>Notes:</strong> {volunteer.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Review Modal */}
        {reviewingVolunteer && (
          <div className="modal-overlay" onClick={() => setReviewingVolunteer(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Review: {reviewingVolunteer.fullName}</h3>
                <button className="modal-close" onClick={() => setReviewingVolunteer(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Participation Status *</label>
                  <select
                    value={reviewForm.participationStatus}
                    onChange={(e) => setReviewForm({ ...reviewForm, participationStatus: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">Select status...</option>
                    <option value="Volunteered">Volunteered</option>
                    <option value="Did Not Show">Did Not Show</option>
                  </select>
                </div>

                {reviewForm.participationStatus === 'Volunteered' && (
                  <div className="form-group">
                    <label className="form-label">Performance Rating *</label>
                    <div>
                      {renderStars(reviewForm.performance, true, (rating) => 
                        setReviewForm({ ...reviewForm, performance: rating })
                      )}
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        Click stars to rate (1-5)
                      </p>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    value={reviewForm.notes}
                    onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                    className="form-textarea"
                    placeholder="Add any additional notes about this volunteer's performance..."
                    rows={3}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    onClick={() => setReviewingVolunteer(null)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    className="submit-button"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}