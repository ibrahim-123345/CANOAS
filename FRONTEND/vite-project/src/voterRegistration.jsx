import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = "http://localhost:8000"; // or your actual API URL

export default function UserRegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    NIDA: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.NIDA || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
      return false;
    }

    if (formData.NIDA.length < 5) {
      setError("NIDA number must be at least 5 characters");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(""); // Clear any previous errors

    try {
      const response = await axios.post(`${API_URL}/register`, {
        fullName: formData.fullName,
        NIDA: formData.NIDA,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data) {
        toast.success("Account created successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });


        // Reset form
        setFormData({
          fullName: "",
          NIDA: "",
          email: "",
          password: "",
          confirmPassword: ""
        });

        window.href = '/login'; // Redirect to login page after successful registration

        // Optionally redirect to login
        // window.location.href = '/login';
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // More specific error handling
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Registration failed. Please try again.";
        
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-container">
      <ToastContainer />
      <div className="registration-card">
        <div className="card-header">
          <h2>Create Account</h2>
          <p>Register to access the platform</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>NIDA Number</label>
            <input
              type="text"
              name="NIDA"
              value={formData.NIDA}
              onChange={handleChange}
              placeholder="Enter your NIDA number"
              required
              minLength={5}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 8 characters)"
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span> Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>

      <style jsx>{`
        .registration-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 2rem;
        }

        .registration-card {
          width: 100%;
          max-width: 480px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          padding: 2.5rem;
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .card-header h2 {
          color: #2c3e50;
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .card-header p {
          color: #7f8c8d;
          font-size: 0.95rem;
        }

        .error-message {
          background-color: #feeceb;
          color: #e74c3c;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #34495e;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 0.9rem 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background-color: #f9fafb;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
          background-color: white;
        }

        .form-group input::placeholder {
          color: #bdc3c7;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(to right, #3498db, #2c3e50);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submit-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
        }

        .submit-btn:disabled {
          background: #bdc3c7;
          transform: none;
          box-shadow: none;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-link {
          text-align: center;
          margin-top: 1.5rem;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .login-link a {
          color: #3498db;
          text-decoration: none;
          font-weight: 500;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 576px) {
          .registration-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}