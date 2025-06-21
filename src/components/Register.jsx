import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register({ users, setUsers }) {
  // State to store form input values
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'volunteer',
  });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

 // Check if the email is already registered
    const existingUser = users.find((user) => user.email === form.email);
    if (existingUser) {
      alert('User with this email already exists.');
      return;
    }
    // Create new user object
    const newUser = {
      email: form.email,
      password: form.password,
      role: form.role,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    alert('Registration successful!');
    navigate('/profile');
  };
  // styles layout
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

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Register</h2>

      <label style={labelStyle}>Email*</label>
      <input
        type="email"
        required
        style={inputStyle}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <label style={labelStyle}>Password*</label>
      <input
        type="password"
        required
        style={inputStyle}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <label style={labelStyle}>Role*</label>
      <select
        required
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        style={inputStyle}
      >
        <option value="volunteer">Volunteer</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" style={buttonStyle}>Register</button>

      <p style={{ marginTop: '20px' }}>
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </form>
  );
}
