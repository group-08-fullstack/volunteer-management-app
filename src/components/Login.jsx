import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ users, setLoggedInUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('volunteer');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

     // Check if the user exists with matching email, password,role
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    if (user) {
      setLoggedInUser(user);
      if (role === 'volunteer') {
        navigate('/profile');   // Navigate to profile role-volunteers
      } else {
        alert('Admin login successful!');
        // Future navigation can be added here for admin, e.g., navigate('/EventForm');
      }
    } else {
      alert('Invalid credentials or incorrect role selected.');
    }
  };
// Styling objects
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

  const listStyle = {
    marginTop: '10px',
    listStyle: 'none',
    paddingLeft: 0
  };

  return (
    <div style={containerStyle}>
      <h2>Login Page</h2>
      <form onSubmit={handleLogin}>
        <label style={labelStyle}>Select Role:</label>
        <select value={role} onChange={e => setRole(e.target.value)} required style={inputStyle}>
          <option value="volunteer">Volunteer</option>
          <option value="admin">Admin</option>
        </select>

        <label style={labelStyle}>Email:</label>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Password:</label>
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>Login</button>
      </form>
      <p style={listStyle}>Not registered yet? <Link to="/register">Register here</Link></p>
    </div>
  );

}
