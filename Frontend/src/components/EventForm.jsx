import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, AlertCircle, FileText, Clock } from 'lucide-react';

// Mock Select component for multi-select (simplified version)
const Select = ({ options, isMulti, placeholder, onChange, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value || (isMulti ? [] : null));

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

// multi-select inputs
const skillsOptions = [
  { value: 'bilingual', label: 'Bilingual' },
  { value: 'animal_handling', label: 'Animal Handling' },
  { value: 'food_handling', label: 'Food Handling' },
];

const stateOptions = [
  { value: 'Lo', label: 'Low' },
  { value: 'Me', label: 'Medium' },
  { value: 'Hi', label: 'High' },
];

export default function EventCreationForm() {
  const navigate = useNavigate();
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

  // Add a new availability date
  const handleAddDate = () => {
    if (dateInput && !form.availability.includes(dateInput)) {
      setForm((prev) => ({
        ...prev,
        availability: [...prev.availability, dateInput]
      }));
    }
    setDateInput('');
  };

  // Remove a date from the availability
  const handleRemoveDate = (date) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.filter((d) => d !== date)
    }));
  };

  // Handle cancel action
  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      // Reset form or navigate away
      setForm({
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
      setDateInput('');
      navigate('/eventmanagement');
    }
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

    alert('Event created successfully!');
  };

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
          max-width: 800px;
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

        .date-input-section {
          display: flex;
          gap: 0.75rem;
          align-items: end;
          margin-bottom: 1rem;
        }

        .date-input-group {
          flex: 1;
        }

        .add-button {
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .add-button:hover {
          background-color: #1d4ed8;
        }

        .date-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .date-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: #f3f4f6;
          border-radius: 0.375rem;
          margin-bottom: 0.5rem;
        }

        .remove-button {
          color: #ef4444;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .remove-button:hover {
          color: #dc2626;
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

        .cancel-button:hover {
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

        .submit-button:hover {
          background-color: #059669;
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

          .date-item {
            background-color: #374151 !important;
            color: #f9fafb !important;
          }

          .submit-section {
            border-top-color: #374151 !important;
          }

          .form-group-row {
           display: flex;
           gap: 1.5rem;
           flex-wrap: wrap;
          }

         .form-group-row .form-group {
          flex: 1 1 0;
          min-width: 200px;
         }


        }

        @media (max-width: 768px) {
          .event-form-container {
            padding: 1rem;
          }
          

        }
      `}</style>

      <div className="event-form-container">
        <div className="form-card">
          <div className="form-header">
            <Calendar color="#3b82f6" size={32} />
            <h2 className="form-title">Create Event</h2>
          </div>

          <div>
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
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
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
                  value={form.skills}
                  onChange={(selected) => setForm({ ...form, skills: selected })}
                />
              </div>


              {/* State */}
              <div className="form-group">
                <label className="form-label">
                  <Users size={16} />
                  State*
                </label>
                <input
                  type="text"
                  maxLength="100"
                  required
                  className="form-input"
                  value={form.State}
                  onChange={(e) => setForm({ ...form, State: e.target.value })}
                  placeholder="Enter state name"
                />
              </div>

              {/* City */}
              <div className="form-group">
                <label className="form-label">
                  <Users size={16} />
                  City*
                </label>
                <input
                  type="text"
                  maxLength="100"
                  required
                  className="form-input"
                  value={form.City}
                  onChange={(e) => setForm({ ...form, City: e.target.value })}
                  placeholder="Enter city name"
                />
              </div>

              {/* Zip code */}
              <div className="form-group">
                <label className="form-label">
                  <Users size={16} />
                  Zip code*
                </label>
                <input
                  type="text"
                  maxLength="100"
                  required
                  className="form-input"
                  value={form.zipcode}
                  onChange={(e) => setForm({ ...form, zipcode: e.target.value })}
                  placeholder="Enter Zip code"
                />
              </div>




              {/* Urgency */}
              <div className="form-group">
                <label className="form-label">
                  <AlertCircle size={16} />
                  Urgency*
                </label>
                <Select
                  options={stateOptions}
                  onChange={(selected) => setForm({ ...form, state: selected.value })}
                  placeholder="Select urgency level"
                />
              </div>

              {/* Location */}
              <div className="form-group full-width">
                <label className="form-label">
                  <MapPin size={16} />
                  Location*
                </label>
                <input
                  type="text"
                  maxLength="100"
                  required
                  className="form-input"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Enter event location"
                />
              </div>


              {/* Time Range */}
              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Start Time*
                </label>
                <input
                  type="time"
                  required
                  className="form-input"
                  value={form.startTime || ''}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  End Time*
                </label>
                <input
                  type="time"
                  required
                  className="form-input"
                  value={form.endTime || ''}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
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
                  value={form.preferences}
                  onChange={(e) => setForm({ ...form, preferences: e.target.value })}
                />
              </div>

              {/* Event Dates */}
              <div className="form-group full-width">
                <label className="form-label">
                  <Clock size={16} />
                  Event Dates
                </label>

                <div className="date-input-section">
                  <div className="date-input-group">
                    <input
                      type="date"
                      className="form-input"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                    />
                  </div>
                  <button type="button" className="add-button" onClick={handleAddDate}>
                    Add Date
                  </button>
                </div>

                {form.availability.length > 0 && (
                  <ul className="date-list">
                    {form.availability.map((date, index) => (
                      <li key={index} className="date-item">
                        <span>{new Date(date).toLocaleDateString()}</span>
                        <button
                          type="button"
                          className="remove-button"
                          onClick={() => handleRemoveDate(date)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="submit-section">
              <button type="button" className="submit-button" onClick={handleSubmit}>
                Create Event
              </button>
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
