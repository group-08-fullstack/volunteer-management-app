import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, UserCheck, Mail } from 'lucide-react';
import {login} from '../helpers/authHelpers';

export default function Login({ users, setLoggedInUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('volunteer');

  const navigate = useNavigate();

  async function handleLogin(event){
      // setLoggedInUser(user);
      event.preventDefault(); 

      // Create data object to send with login API request
      const UserLogin = {
        "email" : email,
        "password" : password,
        "role" : role
      }

      // Make API call to backend to login user
      const result = await login(UserLogin);

      if (result){
        if(role == "volunteer"){
          navigate("/profile")
        }
        else{
          navigate("/admindash")
        }
      }
       
  }

  const handleNavigateToRegister = (e) => {
  e.preventDefault();
  navigate('/register');
};

  return (
    <>
      <style>{`
        .login-container {
          min-height: 100vh;
          background-color: #f9fafb;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .login-container {
            background-color: #111827;
            color: #f9fafb;
          }
          
          .login-card {
            background-color: #1f2937 !important;
            border: 1px solid #374151 !important;
          }
          
          .form-input, .form-select {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: #f9fafb !important;
          }
          
          .form-input::placeholder {
            color: #9ca3af !important;
          }
          
          .form-label {
            color: #e5e7eb !important;
          }
          
          .login-brand, .card-title {
            color: #f9fafb !important;
          }
          
          .login-subtitle, .register-text {
            color: #d1d5db !important;
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-brand {
          font-size: 1.875rem;
          font-weight: bold;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }

        .login-subtitle {
          color: #6b7280;
          font-size: 1rem;
          margin: 0;
        }

        .login-card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          border: 1px solid #e5e7eb;
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          justify-content: center;
          gap: 0.75rem;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
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

        .form-input, .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background-color: white;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-select {
          cursor: pointer;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .login-button {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .login-button:hover {
          background-color: #1d4ed8;
        }

        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
        }

        .register-text {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .register-link {
          color: #3b82f6;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }

        .register-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
      `}</style>

      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <h1 className="login-brand">Volunteer Portal</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="card-header">
            <UserCheck color="#3b82f6" size={24} />
            <h2 className="card-title">Welcome Back</h2>
          </div>

          <div className="login-form">
            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Select Role
              </label>
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                required 
                className="form-select"
              >
                <option value="volunteer">Volunteer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              onClick={handleLogin}
              className="login-button"
            >
              Sign In
            </button>
          </div>

          {/* Register Link */}
          <div className="login-footer">
            <p className="register-text">
              Don't have an account?{' '}
              <span className="register-link" onClick={handleNavigateToRegister}>  
                Register here
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}