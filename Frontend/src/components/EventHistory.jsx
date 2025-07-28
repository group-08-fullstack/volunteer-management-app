import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Award, Home, Bell, LogOut, UserCheck, Settings, History, TrendingUp, Filter, ChevronLeft, ChevronRight, X, Users, FileText } from 'lucide-react';
import NavigationBar from './Navigation';


// Mock helper functions and NotificationButton for demo
const getEventHistory = async () => {
  // Mock data with more records to demonstrate pagination
  const allHistory = [];
  
  // Generate 25 mock records
  for (let i = 1; i <= 25; i++) {
    const events = [
      'Community Food Drive',
      'Beach Cleanup', 
      'Animal Shelter Help',
      'Senior Center Visit',
      'Park Restoration',
      'Youth Mentoring',
      'Library Reading Program',
      'Homeless Shelter Assistance',
      'Environmental Workshop',
      'Blood Drive Support'
    ];
    
    const locations = [
      'Downtown Community Center',
      'Sunset Beach',
      'Happy Paws Shelter', 
      'Golden Years Senior Center',
      'Riverside Park',
      'Youth Community Center',
      'Central Library',
      'Hope Homeless Shelter',
      'Nature Conservation Center',
      'Red Cross Center'
    ];
    
    const statuses = ['completed', 'pending', 'cancelled', 'finalized'];
    const eventIndex = (i - 1) % events.length;
    const statusIndex = (i - 1) % statuses.length;
    
    allHistory.push({
      id: i,
      eventName: events[eventIndex],
      location: locations[eventIndex],
      description: `Event description for ${events[eventIndex]} - detailed information about the volunteer activities and objectives.`,
      participationDate: new Date(2025, 2, i).toISOString().split('T')[0], // March dates
      hoursWorked: Math.floor(Math.random() * 6) + 1, // 1-6 hours
      status: statuses[statusIndex],
      // Additional detailed information for popup
      eventDate: new Date(2025, 2, i + 2).toISOString().split('T')[0], // Event date (different from participation)
      createdAt: new Date(2025, 1, i).toISOString().split('T')[0], // Created date
      urgency: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      requiredSkills: ['Communication', 'Physical Labor', 'Organization', 'Teaching'].slice(0, Math.floor(Math.random() * 3) + 1),
      duration: `${Math.floor(Math.random() * 4) + 2} hours`,
      volunteersNeeded: Math.floor(Math.random() * 20) + 5,
      organizer: 'Event Coordinator',
      contactInfo: 'coordinator@volunteering.org'
    });
  }
  
  return {
    success: true,
    data: {
      history: allHistory,
      summary: {
        totalEvents: allHistory.length,
        totalHours: allHistory.reduce((sum, item) => sum + item.hoursWorked, 0)
      },
      userRole: 'admin'
    }
  };
};

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
      logo: <History size={16} />,
      text: " Volunteer Matching"
    },
  ];

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
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

const formatHours = (hours) => {
  if (!hours || hours === 0) return '0 hours';
  const numHours = parseFloat(hours);
  if (numHours === 1) return '1 hour';
  return `${numHours} hours`;
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'cancelled': return '#ef4444';
    case 'finalized': return '#8b5cf6';
    default: return '#3b82f6';
  }
};

const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'Completed';
    case 'pending': return 'Pending';
    case 'cancelled': return 'Cancelled';
    case 'finalized': return 'Finalized';
    default: return status || 'Unknown';
  }
};

const NotificationButton = () => (
  <button className="notification-button">
    <Bell size={20} />
  </button>
);

export default function EventHistoryPage() {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [userRole, setUserRole] = useState('volunteer');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 items per page
  const [selectedEvent, setSelectedEvent] = useState(null); // For popup modal

  useEffect(() => {
    fetchEventHistory();
  }, []);

  const fetchEventHistory = async () => {
    try {
      setLoading(true);
      const result = await getEventHistory();
      
      if (result.success) {
        setHistoryData(result.data);
        setUserRole(result.data.userRole || 'volunteer');
      } else {
        setError(result.error || 'Failed to fetch event history');
      }
    } catch (err) {
      setError('An error occurred while fetching event history');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    alert('Logout clicked - would navigate to login page');
  };

  const handleAccountClick = () => {
    alert('Account settings');
  };

  const handleVolunteerMatching = () => {
    alert('Would navigate to volunteer matching page');
  };

  const handleEventManagement = () => {
    alert('Would navigate to event management page');
  };

  const handleHome = () => {
    alert('Would navigate to home page');
  };

  // Filter history based on status
  const filteredHistory = historyData?.history?.filter(item => 
    filterStatus === 'all' || item.status?.toLowerCase() === filterStatus
  ) || [];

  // Pagination calculations
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredHistory.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading event history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchEventHistory} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .event-history-container {
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
        }

        .navbar {
          width: 100%;
          background-color: white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid #e5e7eb;
        }

        .navbar-container {
          width: 100%;
          padding: 0 2rem;
        }

        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 4rem;
        }

        .navbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          color: #6b7280;
          background: none;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-button:hover {
          color: #111827;
          background-color: #f3f4f6;
        }

        .notification-button {
          position: relative;
          padding: 0.5rem;
          color: #6b7280;
          background: none;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
        }

        .notification-button:hover {
          color: #111827;
          background-color: #f3f4f6;
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

        .filter-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          text-align: center;
        }

        .summary-number {
          font-size: 1.875rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .summary-number.blue {
          color: #3b82f6;
        }

        .summary-number.green {
          color: #10b981;
        }

        .summary-number.purple {
          color: #8b5cf6;
        }

        .summary-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .history-container {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          position: relative;
          border-left: 4px solid #10b981;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .history-item:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          background-color: #f3f4f6;
        }

        .history-item.pending {
          border-left-color: #f59e0b;
        }

        .history-item.cancelled {
          border-left-color: #ef4444;
        }

        .history-item.finalized {
          border-left-color: #8b5cf6;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .history-title {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .history-status {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .history-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .history-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .history-description {
          font-size: 0.875rem;
          color: #374151;
          margin-top: 0.5rem;
          padding: 0.75rem;
          background-color: #f8fafc;
          border-radius: 0.375rem;
          border-left: 3px solid #3b82f6;
        }

        .no-history {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .no-history-icon {
          margin: 0 auto 1rem;
          opacity: 0.5;
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
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border: 1px solid #d1d5db;
          background-color: white;
          color: #374151;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .pagination-button:hover:not(:disabled) {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-button.active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .pagination-button.active:hover {
          background-color: #1d4ed8;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 1rem;
        }

        /* Modal Styles */
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
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
          margin-right: 1rem;
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

        .modal-status {
          display: inline-block;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
        }

        .modal-section {
          margin-bottom: 1.5rem;
        }

        .modal-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modal-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .modal-detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: #f8fafc;
          border-radius: 0.375rem;
          border-left: 3px solid #3b82f6;
        }

        .modal-detail-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modal-detail-value {
          font-size: 0.875rem;
          color: #111827;
          font-weight: 500;
        }

        .modal-description {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          padding: 1rem;
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.6;
        }

        .modal-skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .modal-skill-tag {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background-color: #dbeafe;
          color: #1e40af;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f9fafb;
        }

        .loading-spinner {
          font-size: 1.125rem;
          color: #6b7280;
        }

        .error-message {
          text-align: center;
          padding: 2rem;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .error-message p {
          color: #ef4444;
          margin-bottom: 1rem;
        }

        .retry-button {
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .retry-button:hover {
          background-color: #1d4ed8;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .event-history-container {
            background-color: #111827 !important;
            color: #f9fafb !important;
          }

          .navbar {
            background-color: #1f2937 !important;
            border-bottom: 1px solid #374151 !important;
          }

          .navbar-title {
            color: #f9fafb !important;
          }

          .nav-button {
            color: #d1d5db !important;
          }

          .nav-button:hover {
            color: #f9fafb !important;
            background-color: #374151 !important;
          }

          .notification-button {
            color: #d1d5db !important;
          }

          .notification-button:hover {
            color: #f9fafb !important;
            background-color: #374151 !important;
          }

          .page-title {
            color: #f9fafb !important;
          }

          .summary-card, .history-container {
            background-color: #1f2937 !important;
            border: 1px solid #374151 !important;
          }

          .summary-label {
            color: #d1d5db !important;
          }

          .history-item {
            background-color: #374151 !important;
          }

          .history-item:hover {
            background-color: #4b5563 !important;
          }

          .history-title {
            color: #f9fafb !important;
          }

          .history-detail {
            color: #d1d5db !important;
          }

          .history-description {
            background-color: #4b5563 !important;
            color: #e5e7eb !important;
          }

          .filter-select {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: #f9fafb !important;
          }

          .no-history {
            color: #d1d5db !important;
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

          .pagination-info {
            color: #d1d5db !important;
          }
            background-color: #111827 !important;
          }

          .loading-spinner {
            color: #d1d5db !important;
          }

          .error-message {
            background-color: #1f2937 !important;
            border: 1px solid #374151 !important;
          }
        }

        @media (max-width: 768px) {
          .navbar-content {
            flex-direction: column;
            gap: 1rem;
            height: auto;
            padding: 1rem 0;
          }
          
          .main-content {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .history-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="event-history-container">
        {/* Naviagation bar imported from Navigation.jsx */}
         <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />

        {/* Main Content */}
        <div className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-title-section">
              <History color="#8b5cf6" size={32} />
              <h2 className="page-title">Event History</h2>
            </div>

            <div className="filter-section">
              <Filter size={16} color="#6b7280" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Events</option>
                <option value="completed">Completed</option>
                <option value="finalized">Finalized</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Summary Statistics */}
          <div style={{ marginBottom: '2rem' }}></div>

          {/* Event History List */}
          <div className="history-container">
            {filteredHistory.length === 0 ? (
              <div className="no-history">
                <Calendar className="no-history-icon" size={48} />
                <h3>No Event History Found</h3>
                <p>
                  {filterStatus === 'all' 
                    ? "No events have been recorded yet." 
                    : `No ${filterStatus} events found.`
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="history-list">
                  {currentItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`history-item ${item.status}`}
                      onClick={() => handleEventClick(item)}
                    >
                      <div className="history-header">
                        <h4 className="history-title">{item.eventName}</h4>
                        <span 
                          className="history-status"
                          style={{ 
                            backgroundColor: getStatusColor(item.status) + '20',
                            color: getStatusColor(item.status)
                          }}
                        >
                          {getStatusText(item.status)}
                        </span>
                      </div>

                      <div className="history-details">
                        <div className="history-detail">
                          <Calendar size={16} />
                          <span>{formatDate(item.participationDate)}</span>
                        </div>

                        <div className="history-detail">
                          <Clock size={16} />
                          <span>{formatHours(item.hoursWorked)}</span>
                        </div>

                        <div className="history-detail">
                          <MapPin size={16} />
                          <span>{item.location}</span>
                        </div>
                      </div>

                      {item.description && (
                        <div className="history-description">
                          <strong>Description:</strong> {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = pageNum === 1 || 
                                     pageNum === totalPages || 
                                     Math.abs(pageNum - currentPage) <= 1;
                      
                      if (!showPage && pageNum === 2 && currentPage > 4) {
                        return <span key="ellipsis1" className="pagination-info">...</span>;
                      }
                      
                      if (!showPage && pageNum === totalPages - 1 && currentPage < totalPages - 3) {
                        return <span key="ellipsis2" className="pagination-info">...</span>;
                      }
                      
                      if (showPage) {
                        return (
                          <button
                            key={pageNum}
                            className={`pagination-button ${pageNum === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      
                      return null;
                    })}

                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={16} />
                    </button>

                    <div className="pagination-info">
                      Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} events
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{selectedEvent.eventName}</h3>
                <button className="modal-close" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {/* Status Badge */}
                <div 
                  className="modal-status"
                  style={{ 
                    backgroundColor: getStatusColor(selectedEvent.status) + '20',
                    color: getStatusColor(selectedEvent.status)
                  }}
                >
                  {getStatusText(selectedEvent.status)}
                </div>

                {/* Event Details */}
                <div className="modal-section">
                  <h4 className="modal-section-title">Event Information</h4>
                  <div className="modal-detail-grid">
                    <div className="modal-detail-item">
                      <Calendar size={16} color="#3b82f6" />
                      <div>
                        <div className="modal-detail-label">Event Date</div>
                        <div className="modal-detail-value">{formatDate(selectedEvent.eventDate)}</div>
                      </div>
                    </div>

                    <div className="modal-detail-item">
                      <MapPin size={16} color="#3b82f6" />
                      <div>
                        <div className="modal-detail-label">Location</div>
                        <div className="modal-detail-value">{selectedEvent.location}</div>
                      </div>
                    </div>

                    <div className="modal-detail-item">
                      <Clock size={16} color="#3b82f6" />
                      <div>
                        <div className="modal-detail-label">Duration</div>
                        <div className="modal-detail-value">{selectedEvent.duration}</div>
                      </div>
                    </div>

                    <div className="modal-detail-item">
                      <Users size={16} color="#3b82f6" />
                      <div>
                        <div className="modal-detail-label">Volunteers Needed</div>
                        <div className="modal-detail-value">{selectedEvent.volunteersNeeded}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="modal-section">
                  <h4 className="modal-section-title">Additional Information</h4>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div className="modal-detail-label" style={{ marginBottom: '0.5rem' }}>Urgency Level</div>
                    <span 
                      style={{ 
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: selectedEvent.urgency === 'High' ? '#fee2e2' : 
                                       selectedEvent.urgency === 'Medium' ? '#fef3c7' : '#ecfdf5',
                        color: selectedEvent.urgency === 'High' ? '#dc2626' : 
                               selectedEvent.urgency === 'Medium' ? '#d97706' : '#059669'
                      }}
                    >
                      {selectedEvent.urgency}
                    </span>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div className="modal-detail-label" style={{ marginBottom: '0.5rem' }}>Required Skills</div>
                    <div className="modal-skills-list">
                      {selectedEvent.requiredSkills.map((skill, index) => (
                        <span key={index} className="modal-skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="modal-detail-label" style={{ marginBottom: '0.5rem' }}>Event Description</div>
                    <div className="modal-description">
                      {selectedEvent.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}