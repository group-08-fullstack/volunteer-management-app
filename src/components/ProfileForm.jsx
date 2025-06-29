import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

// multi-select inputs
const skillsOptions = [
  { value: 'bilingual', label: 'Bilingual' },
  { value: 'animal_handling', label: 'Animal Handling' },
  { value: 'food_handling', label: 'Food Handling' },
];

const stateOptions = [
  { value: 'CA', label: 'California' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
];

export default function ProfileForm() {
  // Form state
  const [form, setForm] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    skills: [],
    preferences: '',
    availability: []
  });

  const [dateInput, setDateInput] = useState('');
  const navigate = useNavigate();

// Add a new availability date dropdown
  const handleAddDate = () => {
    if (dateInput && !form.availability.includes(dateInput)) {
      setForm((prev) => ({
        ...prev,
        availability: [...prev.availability, dateInput]
      }));
    }
    setDateInput('');
  };

 // Remove a date from the availability dropdown
  const handleRemoveDate = (date) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.filter((d) => d !== date)
    }));
  };
  
// Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.availability.length === 0) {
      alert('Please add at least one availability date.');
      return;
    }

    if (form.skills.length === 0) {
      alert('Please select at least one skill.');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    localStorage.setItem(currentUser.email + '_profile', JSON.stringify(form));

    const allProfiles = JSON.parse(localStorage.getItem('profiles')) || [];

    allProfiles.push({
      name: form.fullName,
      skills: form.skills.map((s) => s.value),
      email: currentUser.email
    });

    localStorage.setItem('profiles', JSON.stringify(allProfiles));

    // Show success popup and redirect
    alert('Profile saved successfully!');
    navigate('/volunteerdash');
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

  const listStyle = {
    marginTop: '10px',
    listStyle: 'none',
    paddingLeft: 0
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Volunteer Profile</h2>

      <label style={labelStyle}>Full Name*</label>
      <input
        type="text"
        maxLength="50"
        required
        style={inputStyle}
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />

      <label style={labelStyle}>Address 1*</label>
      <input
        type="text"
        maxLength="100"
        required
        style={inputStyle}
        value={form.address1}
        onChange={(e) => setForm({ ...form, address1: e.target.value })}
      />

      <label style={labelStyle}>Address 2</label>
      <input
        type="text"
        maxLength="100"
        style={inputStyle}
        value={form.address2}
        onChange={(e) => setForm({ ...form, address2: e.target.value })}
      />

      <label style={labelStyle}>City*</label>
      <input
        type="text"
        maxLength="100"
        required
        style={inputStyle}
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
      />

      <label style={labelStyle}>State*</label>
      <Select
        options={stateOptions}
        onChange={(selected) => setForm({ ...form, state: selected.value })}
        placeholder="Select State"
      />

      <label style={labelStyle}>Zip Code*</label>
      <input
        type="text"
        required
        style={inputStyle}
        pattern="^\d{5}(-\d{4})?$"
        placeholder="e.g., 12345 or 12345-6789"
        value={form.zip}
        onChange={(e) => setForm({ ...form, zip: e.target.value })}
      />

      <label style={labelStyle}>Skills*</label>
      <Select
        options={skillsOptions}
        isMulti
        placeholder="Select Skills"
        onChange={(selected) => setForm({ ...form, skills: selected })}
      />

      <label style={labelStyle}>Preferences</label>
      <textarea
        placeholder="Enter any preferences"
        style={{ ...inputStyle, height: '80px' }}
        value={form.preferences}
        onChange={(e) => setForm({ ...form, preferences: e.target.value })}
      ></textarea>

      <label style={labelStyle}>Availability Dates* (Add multiple)</label>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="date"
          style={{ ...inputStyle, flex: 1 }}
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />
        <button type="button" style={buttonStyle} onClick={handleAddDate}>Add</button>
      </div>
      <ul style={listStyle}>
        {form.availability.map((date, index) => (
          <li key={index}>
            {date}{' '}
            <button
              type="button"
              style={{
                marginLeft: '10px',
                color: '#f44336',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => handleRemoveDate(date)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button type="submit" style={buttonStyle}>Save Profile</button>
    </form>
  );
}