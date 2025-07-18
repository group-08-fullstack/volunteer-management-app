import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Calendar, Award, FileText, Home } from 'lucide-react';
import { 
  getUserProfile, 
  createProfile, 
  updateProfile, 
  getSkillsOptions, 
  getStatesOptions 
} from '../helpers/profilehelpers';

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

  const navigate = useNavigate();
  const [dateInput, setDateInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // ✅ FIXED: Use helper function and correct token
  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const profileData = await getUserProfile();
        if (profileData) {
          setForm({
            fullName: profileData.fullName || '',
            address1: profileData.address1 || '',
            address2: profileData.address2 || '',
            city: profileData.city || '',
            state: profileData.state || '',
            zip: profileData.zip || '',
            skills: profileData.skills || [],
            preferences: profileData.preferences || '',
            availability: profileData.availability || []
          });
          setIsEditMode(true);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Continue with empty form for new profile
      }
    };

    loadExistingProfile();
  }, []);

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

  // Multi-select options
  const skillsOptions = [
    { value: 'bilingual', label: 'Bilingual' },
    { value: 'animal_handling', label: 'Animal Handling' },
    { value: 'food_handling', label: 'Food Handling' },
    { value: 'first_aid', label: 'First Aid Certified' },
    { value: 'tutoring', label: 'Tutoring/Teaching' },
  ];

  const stateOptions = [
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
  ];

  // ✅ FIXED: Use helper functions instead of raw fetch
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (form.availability.length === 0) {
      alert('Please add at least one availability date.');
      return;
    }

    if (form.skills.length === 0) {
      alert('Please select at least one skill.');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (isEditMode) {
        result = await updateProfile(form);
      } else {
        result = await createProfile(form);
      }
      
      alert(`Profile ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate('/volunteerdash');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .profile-container {
          min-height: 100vh;
          background-color: #f9fafb;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          padding: 2rem 1rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .profile-container {
            background-color: #111827;
            color: #f9fafb;
          }
          
          .profile-card {
            background-color: #1f2937 !important;
            border: 1px solid #374151 !important;
          }
          
          .form-input, .form-select, .form-textarea, .select-display {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: #f9fafb !important;
          }
          
          .form-input::placeholder, .form-textarea::placeholder {
            color: #9ca3af !important;
          }
          
          .form-label {
            color: #e5e7eb !important;
          }
          
          .profile-brand, .card-title {
            color: #f9fafb !important;
          }
          
          .profile-subtitle {
            color: #d1d5db !important;
          }
          
          .availability-item {
            background-color: #374151 !important;
            color: #f9fafb !important;
            border-color: #4b5563 !important;
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
        }

        .profile-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .profile-brand {
          font-size: 1.875rem;
          font-weight: bold;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }

        .profile-subtitle {
          color: #6b7280;
          font-size: 1rem;
          margin: 0;
        }

        .profile-card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          width: 100%;
          max-width: 800px;
          border: 1px solid #e5e7eb;
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          justify-content: center;
          gap: 0.75rem;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .profile-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
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
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background-color: white;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .form-input::placeholder, .form-textarea::placeholder {
          color: #9ca3af;
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

        .availability-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .date-input-group {
          display: flex;
          gap: 0.75rem;
          align-items: end;
        }

        .date-input-group input {
          flex: 1;
        }

        .add-button {
          padding: 0.75rem 1rem;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .add-button:hover {
          background-color: #059669;
        }

        .availability-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .availability-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #1e40af;
        }

        .remove-button {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0;
          font-weight: 500;
        }

        .remove-button:hover {
          color: #991b1b;
        }

        .submit-button {
          grid-column: 1 / -1;
          justify-self: center;
          padding: 0.875rem 2rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 1rem;
        }

        .submit-button:hover {
          background-color: #1d4ed8;
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .profile-form {
            grid-template-columns: 1fr;
          }
          
          .date-input-group {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>

      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-brand">Volunteer Portal</h1>
          <p className="profile-subtitle">
            {isEditMode ? 'Update your volunteer profile' : 'Complete your volunteer profile'}
          </p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="card-header">
            <User color="#3b82f6" size={24} />
            <h2 className="card-title">
              {isEditMode ? 'Update Profile' : 'Volunteer Profile'}
            </h2>
          </div>

          <div onSubmit={handleSubmit} className="profile-form">
            {/* Full Name */}
            <div className="form-group full-width">
              <label className="form-label">
                <User size={16} />
                Full Name*
              </label>
              <input
                type="text"
                maxLength="50"
                required
                className="form-input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            {/* Address 1 */}
            <div className="form-group full-width">
              <label className="form-label">
                <Home size={16} />
                Address 1*
              </label>
              <input
                type="text"
                maxLength="100"
                required
                className="form-input"
                value={form.address1}
                onChange={(e) => setForm({ ...form, address1: e.target.value })}
                placeholder="Enter your street address"
              />
            </div>

            {/* Address 2 */}
            <div className="form-group full-width">
              <label className="form-label">
                <Home size={16} />
                Address 2
              </label>
              <input
                type="text"
                maxLength="100"
                className="form-input"
                value={form.address2}
                onChange={(e) => setForm({ ...form, address2: e.target.value })}
                placeholder="Apartment, suite, etc. (optional)"
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
                maxLength="100"
                required
                className="form-input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Enter your city"
              />
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} />
                State*
              </label>
              <select
                required
                className="form-select"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              >
                <option value="">Select State</option>
                {stateOptions.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Zip Code */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} />
                Zip Code*
              </label>
              <input
                type="text"
                required
                className="form-input"
                pattern="^\d{5}(-\d{4})?$"
                placeholder="12345 or 12345-6789"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
              />
            </div>

            {/* Skills */}
            <div className="form-group full-width">
              <label className="form-label">
                <Award size={16} />
                Skills*
              </label>
              <Select
                options={skillsOptions}
                isMulti
                placeholder="Select your skills"
                value={form.skills}
                onChange={(selected) => setForm({ ...form, skills: selected })}
              />
            </div>

            {/* Preferences */}
            <div className="form-group full-width">
              <label className="form-label">
                <FileText size={16} />
                Preferences
              </label>
              <textarea
                className="form-textarea"
                placeholder="Enter any preferences or special requirements"
                value={form.preferences}
                onChange={(e) => setForm({ ...form, preferences: e.target.value })}
              />
            </div>

            {/* Availability */}
            <div className="form-group full-width">
              <label className="form-label">
                <Calendar size={16} />
                Availability Dates*
              </label>
              <div className="availability-section">
                <div className="date-input-group">
                  <input
                    type="date"
                    className="form-input"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                  />
                  <button type="button" className="add-button" onClick={handleAddDate}>
                    Add Date
                  </button>
                </div>
                
                <div className="availability-list">
                  {form.availability.map((date, index) => (
                    <div key={index} className="availability-item">
                      <span>{date}</span>
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => handleRemoveDate(date)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="button" 
              onClick={handleSubmit} 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading 
                ? (isEditMode ? 'Updating...' : 'Saving...') 
                : (isEditMode ? 'Update Profile' : 'Save Profile')
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}