import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Calendar, Star, Clock, Award, Settings, UserCheck, ClipboardCheck } from 'lucide-react';
import NavigationBar from './Navigation';
import { checkTokenTime } from "../helpers/authHelpers";

export default function AllVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [volunteersPerPage] = useState(15);
  const navigate = useNavigate();
  const [openReportMenuId, setOpenReportMenuId] = useState(null);

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
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      await checkTokenTime();

      const response = await fetch('http://127.0.0.1:5000/api/admin/volunteers/', {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch volunteers');
      }

      const data = await response.json();
      setVolunteers(data.volunteers || []);

    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
      setError("Failed to load volunteers. You may need to log in again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerClick = (volunteerId) => {
    navigate(`/volunteers/${volunteerId}`);
  };


  const generateReport = (volunteerId, format) => {
  const token = localStorage.getItem('access_token');
  const url = `http://127.0.0.1:5000/api/volunteer/${volunteerId}/report/${format}`;

  fetch(url, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `volunteer_report_${volunteerId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch(err => {
      console.error(`Failed to download ${format} report:`, err);
    });
  };


  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={`star ${star <= numRating ? 'filled' : ''}`}
            fill={star <= numRating ? '#fbbf24' : 'none'}
            stroke={star <= numRating ? '#fbbf24' : '#d1d5db'}
            strokeWidth={2}
          />
        ))}
        <span className="rating-text">({numRating})</span>
      </div>
    );
  };

  // Pagination calculations
  const indexOfLastVolunteer = currentPage * volunteersPerPage;
  const indexOfFirstVolunteer = indexOfLastVolunteer - volunteersPerPage;
  const currentVolunteers = volunteers.slice(indexOfFirstVolunteer, indexOfLastVolunteer);
  const totalPages = Math.ceil(volunteers.length / volunteersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="volunteers-container">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />
        <div className="main-content">
          <div className="loading-message">Loading volunteers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="volunteers-container">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />
        <div className="main-content">
          <div className="error-message">
            {error}
            <button onClick={loadVolunteers} className="retry-button">
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
        .volunteers-container {
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
        }

        .main-content {
          width: 100%;
          padding: 2rem;
          max-width: 1400px;
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

        .volunteers-stats {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .volunteers-table-container {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .volunteers-table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-header th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-row {
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.2s;
          cursor: pointer;
        }

        .table-row:hover {
          background-color: #f9fafb;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-cell {
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
        }

        .volunteer-name {
          font-weight: 600;
          color: #111827;
        }

        .volunteer-email {
          color: #6b7280;
        }

        .events-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #3b82f6;
          font-weight: 500;
        }

        .hours-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-weight: 500;
        }

        .star-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .star {
          transition: color 0.2s;
        }

        .rating-text {
          font-size: 0.75rem;
          color: #6b7280;
          margin-left: 0.25rem;
        }

        .expertise-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #6b7280;
        }

        .expertise-full {
          font-size: 0.75rem;
          color: #374151;
        }

        .no-volunteers {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .no-volunteers-icon {
          margin: 0 auto 1rem;
          opacity: 0.5;
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

        .report-button {
          background-color: #10b981;
          color: white;
        }

        .report-dropdown-button{
        padding-left:12px;
        padding-right: 12px;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .volunteers-container {
            background-color: #111827 !important;
            color: #f9fafb !important;
          }

          .volunteers-table-container {
            background-color: #1f2937 !important;
            border: 1px solid #374151 !important;
          }

          .table-header {
            background-color: #374151 !important;
          }

          .table-header th {
            color: #f9fafb !important;
          }

          .table-row:hover {
            background-color: #374151 !important;
          }

          .volunteer-name {
            color: #f9fafb !important;
          }

          .volunteer-email {
            color: #d1d5db !important;
          }

          .expertise-cell {
            color: #d1d5db !important;
          }

          .expertise-full {
            color: #e5e7eb !important;
          }

          .page-title {
            color: #f9fafb !important;
          }

          .volunteers-stats {
            color: #d1d5db !important;
          }

          .no-volunteers {
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

          .volunteers-table {
            font-size: 0.75rem;
          }

          .table-header th,
          .table-cell {
            padding: 0.75rem 0.5rem;
          }

          .expertise-cell {
            max-width: 120px;
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
      `}</style>

      <div className="volunteers-container">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />

        <div className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-title-section">
              <Users color="#3b82f6" size={32} />
              <h2 className="page-title">All Volunteers</h2>
            </div>
            <div className="volunteers-stats">
              Showing {indexOfFirstVolunteer + 1}-{Math.min(indexOfLastVolunteer, volunteers.length)} of {volunteers.length} volunteers
            </div>
          </div>

          {/* Volunteers Table */}
          <div className="volunteers-table-container">
            {currentVolunteers.length === 0 ? (
              <div className="no-volunteers">
                <Users className="no-volunteers-icon" size={48} />
                <h3>No Volunteers Found</h3>
                <p>No volunteers have been registered yet.</p>
              </div>
            ) : (
              <>
                <table className="volunteers-table">
                  <thead className="table-header">
                    <tr>
                      <th>Volunteer</th>
                      <th>Events</th>
                      <th>Rating</th>
                      <th>Hours</th>
                      <th>Expertise</th>
                      <th>Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentVolunteers.map((volunteer) => (
                      <tr
                        key={volunteer.id}
                        className="table-row"
                        onClick={() => handleVolunteerClick(volunteer.id)}
                      >
                        <td className="table-cell">
                          <div className="volunteer-name">{volunteer.name}</div>
                          <div className="volunteer-email">{volunteer.email}</div>
                        </td>
                        <td className="table-cell">
                          <div className="events-count">
                            <Calendar size={16} />
                            {volunteer.events_attended || 0}
                          </div>
                        </td>
                        <td className="table-cell">
                          {renderStars(volunteer.rating)}
                        </td>
                        <td className="table-cell">
                          <div className="hours-count">
                            <Clock size={16} />
                            {volunteer.total_hours || 0}h
                          </div>
                        </td>
                        <td className="table-cell">
                          <div
                            className="expertise-cell"
                            title={volunteer.expertise || 'No expertise listed'}
                          >
                            {volunteer.expertise || 'No skills listed'}
                          </div>
                        </td>

                        <td className="table-cell report-cell">
                          <div className="report-menu-container">
                            <button
                              className="report-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenReportMenuId(volunteer.id === openReportMenuId ? null : volunteer.id);
                              }}
                            >
                              Generate Report
                            </button>

                            {openReportMenuId === volunteer.id && (
                              <div>
                                <button className="report-dropdown-button"   onClick={() => generateReport(volunteer.id, 'pdf')}>As PDF</button>
                                <button className="report-dropdown-button"   onClick={() => generateReport(volunteer.id, 'csv')}>As CSV</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      Previous
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
                      Next
                    </button>

                    <div className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}