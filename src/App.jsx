import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ProfileForm from './components/ProfileForm';

function App() {
  const [users, setUsers] = useState([]); // Store registered users
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register users={users} setUsers={setUsers} />} />
        <Route path="/login" element={<Login users={users} setLoggedInUser={setLoggedInUser} />} />
        <Route path="/profile" element={loggedInUser ? <ProfileForm user={loggedInUser} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
