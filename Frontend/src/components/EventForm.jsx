import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, AlertCircle, FileText, Clock, Home } from 'lucide-react';

const Select = ({ options, isMulti, placeholder, onChange, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value || (isMulti ? [] : null));

  useEffect(() => {
    setSelected(value || (isMulti ? [] : null));
  }, [value, isMulti]);

  const handleOptionClick = (option) => {
    if (isMulti) {
      const newSelected = selected.some(s => s.value === option.value)
        ? selected.filter(s => s.value !== option.value)
        : [...selected, option];
      setSelected(newSelected);
      onChange(newSelected);
    } else {
      setSelected(option);
      onChange(option);
      setIsOpen(false);
    }
  };

  return (
    <div className="select-container">
      <div className="select-display" onClick={() => setIsOpen(!isOpen)}>
        {isMulti ? (
          selected.length > 0 ? selected.map(s => s.label).join(', ') : placeholder
        ) : (
          selected ? selected.label : placeholder
        )}
      </div>
      {isOpen && (
        <div className="select-dropdown">
          {options.map(option => (
            <div
              key={option.value}
              className={`select-option ${isMulti && selected.some(s => s.value === option.value) ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Skills options
const skillsOptions = [
  { value: 'Bilingual', label: 'Bilingual' },
  { value: 'Animal Handling', label: 'Animal Handling' },
  { value: 'Food Handling', label: 'Food Handling' },
  { value: 'Teaching', label: 'Teaching' },
  { value: 'Physical Labor', label: 'Physical Labor' },
  { value: 'Organization', label: 'Organization' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Leadership', label: 'Leadership' },
  { value: 'First Aid', label: 'First Aid' },
];

// Urgency options matching database ENUM
const urgencyOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

// US States options
const stateOptions = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

export default function EventForm() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId);
  
  const [form, setForm] = useState({
    event_name: '',
    required_skills: [],
    address: '',
    state: '',
    city: '',
    zipcode: '',
    urgency: '',
    location_name: '',
    event_duration: '',
    event_description: '',
    date: '',
    volunteers_needed: ''
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadEventData();
    }
  }, [isEditMode, eventId]);

  const loadEventData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        alert('Please log in to edit events.');
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/eventlist/${eventId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load event data');
      }

      const eventData = await response.json();
      console.log('Loaded event data:', eventData);

      // Convert required_skills string back to skill objects
      let skillObjects = [];
      if (eventData.required_skills) {
        const skillNames = typeof eventData.required_skills === 'string' 
          ? eventData.required_skills.split(',') 
          : eventData.required_skills;
        
        skillObjects = skillNames.map(skillName => {
          const trimmedSkill = skillName.trim();
          const skillOption = skillsOptions.find(opt => opt.value === trimmedSkill);
          return skillOption || { value: trimmedSkill, label: trimmedSkill };
        });
      }

      setForm({
        event_name: eventData.event_name || '',
        required_skills: skillObjects,
        address: eventData.address || '',
        state: eventData.state || '',
        city: eventData.city || '',
        zipcode: eventData.zipcode || '',
        urgency: eventData.urgency || '',
        location_name: eventData.location_name || '',
        event_duration: eventData.event_duration ? eventData.event_duration.toString() : '',
        event_description: eventData.event_description || '',
        date: eventData.date || '',
        volunteers_needed: eventData.volunteers_needed ? eventData.volunteers_needed.toString() : ''
      });

    } catch (error) {
      console.error('Error loading event:', error);
      alert(`Error loading event: ${error.message}`);
      navigate('/eventmanagement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/eventmanagement');
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'event_name', 'required_skills', 'state', 'city', 'zipcode', 
      'urgency', 'location_name', 'event_duration', 'event_description', 
      'date', 'volunteers_needed'
    ];
    
    for (const field of requiredFields) {
      if (!form[field] || (Array.isArray(form[field]) && form[field].length === 0)) {
        const displayName = field.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
        alert(`Please fill in the ${displayName} field.`);
        return false;
      }
    }

    // Validate numeric fields
    if (isNaN(form.event_duration) || parseInt(form.event_duration) <= 0) {
      alert('Event duration must be a positive number.');
      return false;
    }

    if (isNaN(form.volunteers_needed) || parseInt(form.volunteers_needed) <= 0) {
      alert('Volunteers needed must be a positive number.');
      return false;
    }

    // Validate date is not in the past
    const selectedDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert('Event date cannot be in the past.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert('Please log in to manage events.');
      setIsSubmitting(false);
      navigate('/login');
      return;
    }

    try {
      // Convert skills array to comma-separated string
      const skillsString = form.required_skills.map(skill => skill.value).join(',');

      const eventData = {
        event_name: form.event_name.trim(),
        required_skills: skillsString,
        address: form.address.trim(),
        state: form.state,  // Now stores the state abbreviation (e.g., "TX")
        city: form.city.trim(),
        zipcode: form.zipcode.trim(),
        urgency: form.urgency,
        location_name: form.location_name.trim(),
        event_duration: parseInt(form.event_duration),
        event_description: form.event_description.trim(),
        date: form.date,
        volunteers_needed: parseInt(form.volunteers_needed)
      };

      console.log(`${isEditMode ? 'Updating' : 'Creating'} event with data:`, eventData);

      const url = isEditMode 
        ? `http://localhost:5000/api/eventlist/${eventId}`
        : `http://localhost:5000/api/eventlist/`;
      
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      const responseData = await response.json();
      console.log('Backend response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
      }

      alert(`Event ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate("/eventmanagement");

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error);
      alert(`Error ${isEditMode ? 'updating' : 'creating'} event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="event-form-container">
        <div className="form-card">
          <div className="form-header">
            <Calendar color="#3b82f6" size={32} />
            <h2 className="form-title">Loading Event...</h2>
          </div>
          <p>Please wait while we load the event data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .event-form-container {
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
          padding: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .form-card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          width: 100%;
          max-width: 900px;
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .form-title {
          font-size: 1.875rem;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background-color: white;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
          font-family: inherit;
        }

        .select-container {
          position: relative;
          width: 100%;
        }

        .select-display {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background-color: white;
          cursor: pointer;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .select-display:hover {
          border-color: #9ca3af;
        }

        .select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 10;
          max-height: 200px;
          overflow-y: auto;
        }

        .select-option {
          padding: 0.75rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .select-option:hover {
          background-color: #f3f4f6;
        }

        .select-option.selected {
          background-color: #dbeafe;
          color: #1d4ed8;
        }

        .submit-section {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .cancel-button {
          padding: 0.75rem 2rem;
          background-color: #ef4444;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .cancel-button:hover:not(:disabled) {
          background-color: #dc2626;
        }

        .submit-button {
          padding: 0.75rem 2rem;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #059669;
        }

        .submit-button:disabled, .cancel-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .event-form-container {
            background-color: #111827 !important;
            color: #f9fafb !important;
          }

          .form-card {
            background-color: #1f2937 !important;
            border: 1px solid #374151 !important;
          }

          .form-title {
            color: #f9fafb !important;
          }

          .form-label {
            color: #e5e7eb !important;
          }

          .form-input, .form-textarea, .select-display {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: #f9fafb !important;
          }

          .form-input:focus, .form-textarea:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
          }

          .select-dropdown {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
          }

          .select-option {
            color: #f9fafb !important;
          }

          .select-option:hover {
            background-color: #4b5563 !important;
          }

          .select-option.selected {
            background-color: #1e40af !important;
            color: #dbeafe !important;
          }

          .submit-section {
            border-top-color: #374151 !important;
          }
        }

        @media (max-width: 768px) {
          .event-form-container {
            padding: 1rem;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }

          .submit-section {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="event-form-container">
        <div className="form-card">
          <div className="form-header">
            <Calendar color="#3b82f6" size={32} />
            <h2 className="form-title">
              {isEditMode ? 'Edit Event' : 'Create Event'}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Event Name */}
              <div className="form-group">
                <label className="form-label">
                  <FileText size={16} />
                  Event Name*
                </label>
                <input
                  type="text"
                  maxLength="100"
                  required
                  className="form-input"
                  value={form.event_name}
                  onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                  placeholder="Enter event name"
                />
              </div>

              {/* Required Skills */}
              <div className="form-group">
                <label className="form-label">
                  <Users size={16} />
                  Required Skills*
                </label>
                <Select
                  options={skillsOptions}
                  isMulti
                  placeholder="Select required skills"
                  value={form.required_skills}
                  onChange={(selected) => setForm({ ...form, required_skills: selected })}
                />
              </div>

              {/* Address */}
              <div className="form-group full-width">
                <label className="form-label">
                  <Home size={16} />
                  Address
                </label>
                <input
                  type="text"
                  maxLength="45"
                  className="form-input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Enter street address"
                />
              </div>

              {/* State */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} />
                  State*
                </label>
                <Select
                  options={stateOptions}
                  value={stateOptions.find(opt => opt.value === form.state) || null}
                  onChange={(selected) => setForm({ ...form, state: selected.value })}
                  placeholder="Select state"
                />
              </div>

              {/* City */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} />
                  City*
                </label>
                <input
                  type="text"
                  maxLength="45"
                  required
                  className="form-input"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Enter city name"
                />
              </div>

              {/* Zip Code */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} />
                  Zip Code*
                </label>
                <input
                  type="text"
                  maxLength="45"
                  required
                  className="form-input"
                  value={form.zipcode}
                  onChange={(e) => setForm({ ...form, zipcode: e.target.value })}
                  placeholder="Enter zip code"
                  pattern="^\d{5}(-\d{4})?$"
                />
              </div>

              {/* Urgency */}
              <div className="form-group">
                <label className="form-label">
                  <AlertCircle size={16} />
                  Urgency*
                </label>
                <Select
                  options={urgencyOptions}
                  value={urgencyOptions.find(opt => opt.value === form.urgency) || null}
                  onChange={(selected) => setForm({ ...form, urgency: selected.value })}
                  placeholder="Select urgency level"
                />
              </div>

              {/* Location Name */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} />
                  Location Name*
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={form.location_name}
                  onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                  placeholder="Enter location/venue name"
                />
              </div>

              {/* Duration */}
              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Duration (hours)*
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  required
                  className="form-input"
                  value={form.event_duration}
                  onChange={(e) => setForm({ ...form, event_duration: e.target.value })}
                  placeholder="Enter duration in hours"
                />
              </div>

              {/* Volunteers Needed */}
              <div className="form-group">
                <label className="form-label">
                  <Users size={16} />
                  Volunteers Needed*
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  className="form-input"
                  value={form.volunteers_needed}
                  onChange={(e) => setForm({ ...form, volunteers_needed: e.target.value })}
                  placeholder="Number of volunteers needed"
                />
              </div>

              {/* Event Date */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Event Date*
                </label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Event Description */}
              <div className="form-group full-width">
                <label className="form-label">
                  <FileText size={16} />
                  Event Description*
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter detailed event description"
                  value={form.event_description}
                  onChange={(e) => setForm({ ...form, event_description: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="submit-section">
              <button 
                type="submit" 
                className="submit-button" 
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? `${isEditMode ? 'Updating' : 'Creating'} Event...` 
                  : `${isEditMode ? 'Update' : 'Create'} Event`
                }
              </button>
              <button 
                type="button" 
                className="cancel-button" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}