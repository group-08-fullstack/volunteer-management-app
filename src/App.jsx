import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ProfileForm from './components/ProfileForm';
import VolunteerDash from './components/VolunteerDash';
import AdminDash from './components/AdminDash';
import VolunteerMatch from './components/VolunteerMatch'; 
import VolunteerHistoryTable from './components/VolunteerHistory';
import EventForm from './components/EventForm'; 
import EventManagement from './components/EventManagement';
import ViewAllEvents from './components/ViewAllEvents';

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
        <Route path="/volunteerdash" element={<VolunteerDash />} />
        <Route path="/volunteermatch" element={<VolunteerMatch />} />
        <Route path="/admindash" element={<AdminDash />} /> 
        <Route path="/volunteerhistory" element={<VolunteerHistoryTable/>} />
        <Route path="/createevent" element={<EventForm />} />
        <Route path="/eventmanagement" element={<EventManagement />} />
        <Route path="/viewallevents" element={<ViewAllEvents />}/>
      </Routes>
    </Router>
  );
}

export default App;
