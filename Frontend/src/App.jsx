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
import EventReview from './components/EventReview'


import AllVolunteers from './components/AllVolunteers'

function App() {
  const [users, setUsers] = useState([]); // Store registered users
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register users={users} setUsers={setUsers} />} />
        <Route path="/login" element={<Login users={users} setLoggedInUser={setLoggedInUser} />} />
        <Route path="/profile" element= {<ProfileForm user={loggedInUser}/>}/>
        <Route path="/volunteerdash" element={<VolunteerDash />} />
        <Route path="/volunteermatch" element={<VolunteerMatch />} />
        <Route path="/admindash" element={<AdminDash />} /> 
        <Route path="/volunteerhistory" element={<VolunteerHistoryTable/>} />
         <Route path="/events/create" element={<EventForm />} />
        <Route path="/eventmanagement" element={<EventManagement />} />
        <Route path="/viewallevents" element={<ViewAllEvents />}/>
        <Route path="/events/edit/:eventId" element={<EventForm />} />
        <Route path="/eventreview" element={<EventReview />}/>
        

         <Route path="/volunteers" element={<AllVolunteers />}/>

      </Routes>
    </Router>
  );
}

export default App;
