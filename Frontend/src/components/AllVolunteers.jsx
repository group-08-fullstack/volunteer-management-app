import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AllVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:5000/api/admin/volunteers/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch volunteers');
        }
        const data = await response.json();
        setVolunteers(data.volunteers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  if (loading) return <div className="loading">Loading volunteers...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      <style>{`
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f4f7f8;
          padding: 2rem;
          color: #333;
        }
        h2 {
          text-align: center;
          margin-bottom: 1rem;
          color: #2c3e50;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }
        thead {
          background-color: #27ae60; /* green */
          color: white;
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
        }
        tbody tr {
          border-bottom: 1px solid #ddd;
          transition: background-color 0.3s ease;
        }
        tbody tr:nth-child(even) {
          background-color: #f9fbfc;
        }
        tbody tr:hover {
          background-color: #d1f2d8; /* light green hover */
          cursor: pointer;
        }
        .expertise {
          font-size: 0.9rem;
          color: #666;
        }
        .loading, .error {
          padding: 1rem;
          text-align: center;
          font-size: 1.2rem;
        }
        .error {
          color: #c0392b;
          font-weight: bold;
        }
        .container {
          padding: 2rem;
        }
      `}</style>

      <div className="container">
        <h2>All Volunteers</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Events Attended</th>
              <th>Rating</th>
              <th>Total Hours</th>
              <th>Expertise</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                  No volunteers found.
                </td>
              </tr>
            ) : (
              volunteers.map((v) => (
                <tr key={v.id} onClick={() => navigate(`/volunteers/${v.id}`)}>
                  <td>{v.name}</td>
                  <td>{v.email}</td>
                  <td>{v.events_attended ?? 0}</td>
                  <td>{v.rating ?? 0}</td>
                  <td>{v.total_hours ?? 0}</td>
                  <td className="expertise" title={v.expertise}>{v.expertise || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
