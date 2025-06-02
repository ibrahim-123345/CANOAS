import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ContestantRegistration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('registration');
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    bio: '',
    nidaNumber: '',
    promises: [''],
    image: null,
    position: '',
  });

  const [accomplishments, setAccomplishments] = useState([
    { promise: '', accomplished: false, details: '' },
  ]);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contestants, setContestants] = useState([]);
  const [selectedContestant, setSelectedContestant] = useState('');

  const positions = [
    'President',
    'Vice President',
    'General Secretary',
    'Treasurer',
    'Minister of Information',
  ];

  useEffect(() => {
    document.body.style.background = darkMode ? '#121212' : '#f5f7fa';
    document.body.style.color = darkMode ? '#ffffff' : '#333333';
    localStorage.setItem('darkMode', darkMode);
    
    // Fetch contestants for the update dropdown
    const fetchContestants = async () => {
      try {
        const response = await axios.get('http://localhost:8000/contestants');
        setContestants(response.data);
      } catch (error) {
        console.error('Error fetching contestants:', error);
      }
    };
    
    if (activeTab === 'accomplishments') {
      fetchContestants();
    }
  }, [darkMode, activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setErrorMessage('Please select a valid image file');
    }
  };

  const handlePromiseChange = (index, value) => {
    const updatedPromises = [...formData.promises];
    updatedPromises[index] = value;
    setFormData((prev) => ({ ...prev, promises: updatedPromises }));
  };

  const handleAccomplishmentChange = (index, field, value) => {
    const updated = [...accomplishments];
    updated[index][field] = field === 'accomplished' ? value === 'true' : value;
    setAccomplishments(updated);
  };

  const addPromiseField = () => {
    setFormData((prev) => ({ ...prev, promises: [...prev.promises, ''] }));
  };

  const removePromiseField = (index) => {
    const updatedPromises = formData.promises.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, promises: updatedPromises }));
  };

  const addAccomplishmentField = () => {
    setAccomplishments((prev) => [
      ...prev,
      { promise: '', accomplished: false, details: '' },
    ]);
  };

  const removeAccomplishmentField = (index) => {
    const updated = accomplishments.filter((_, i) => i !== index);
    setAccomplishments(updated);
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formDataToSubmit = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'promises') {
          val.forEach((promise, i) =>
            formDataToSubmit.append(`promises[${i}]`, promise)
          );
        } else if (key === 'image' && val) {
          formDataToSubmit.append('profileImage', val);
        } else {
          formDataToSubmit.append(key, val);
        }
      });

      const response = await axios.post(
        'http://localhost:8000/contestants',
        formDataToSubmit,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      await axios.post('http://localhost:8000/notifications', {
        message: `New contestant created: ${formData.name}`,
        read: false
      });

      setSuccessMessage('Contestant registered successfully!');
      setFormData({
        name: '',
        party: '',
        bio: '',
        nidaNumber: '',
        promises: [''],
        image: null,
        position: '',
      });
      setPreviewImage(null);
      
      // Refresh contestants list
      const contestantsResponse = await axios.get('http://localhost:8000/contestants');
      setContestants(contestantsResponse.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAccomplishments = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!selectedContestant) {
        throw new Error('Please select a contestant');
      }

      // First get the current contestant data
      const currentResponse = await axios.get(
        `http://localhost:8000/contestants/${selectedContestant}`
      );
      
      const currentData = currentResponse.data;
      
      // Format the new accomplishments data
      const newAccomplishments = accomplishments.map(acc => ({
        text: acc.promise,
        fulfilled: acc.accomplished,
        details: acc.details
      }));
      
      // Prepare the update payload
      const updatePayload = {
        previousPromises: [
          ...(currentData.previousPromises || []),
          ...newAccomplishments
        ]
      };
      
      // Update the contestant with PATCH
      const updateResponse = await axios.patch(
        `http://localhost:8000/contestants/${selectedContestant}`,
        updatePayload
      );

      await axios.post('http://localhost:8000/notifications', {
        message: `Accomplishments updated for contestant ID: ${selectedContestant}`,
        read: false
      });

      setSuccessMessage('Accomplishments updated successfully!');
      setAccomplishments([{ promise: '', accomplished: false, details: '' }]);
      setSelectedContestant('');
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || error.message || 'Update failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContestantSelect = (e) => {
    setSelectedContestant(e.target.value);
  };

  // Enhanced styles with transitions and better spacing
  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '2rem auto',
      padding: '2.5rem',
      borderRadius: '16px',
      background: darkMode ? '#1e1e2e' : '#ffffff',
      color: darkMode ? '#e2e2e2' : '#333333',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      fontFamily: "'Inter', sans-serif",
      transition: 'all 0.3s ease',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
      color: darkMode ? '#ffffff' : '#2c3e50',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '1rem',
      color: darkMode ? '#a0a0a0' : '#7f8c8d',
    },
    tabSwitch: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2.5rem',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    tabButton: (active) => ({
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: active ? (darkMode ? '#4f46e5' : '#3b82f6') : (darkMode ? '#3a3a3a' : '#e2e8f0'),
      color: active ? '#ffffff' : (darkMode ? '#b0b0b0' : '#4a5568'),
      fontWeight: '600',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease',
      boxShadow: active ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
      '&:hover': {
        transform: 'translateY(-2px)',
      },
    }),
    formContainer: {
      padding: '1.5rem',
      borderRadius: '12px',
      background: darkMode ? '#2a2a3a' : '#f8fafc',
      marginBottom: '1.5rem',
    },
    inputGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: darkMode ? '#d1d1d1' : '#4a5568',
    },
    input: {
      width: '100%',
      padding: '14px',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#3a3a4a' : '#e2e8f0'}`,
      marginBottom: '0.5rem',
      background: darkMode ? '#2a2a3a' : '#ffffff',
      color: darkMode ? '#e2e2e2' : '#333333',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease',
      '&:focus': {
        borderColor: darkMode ? '#4f46e5' : '#3b82f6',
        outline: 'none',
        boxShadow: `0 0 0 3px ${darkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
      },
    },
    textarea: {
      width: '100%',
      minHeight: '120px',
      padding: '14px',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#3a3a4a' : '#e2e8f0'}`,
      background: darkMode ? '#2a2a3a' : '#ffffff',
      color: darkMode ? '#e2e2e2' : '#333333',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease',
      resize: 'vertical',
      '&:focus': {
        borderColor: darkMode ? '#4f46e5' : '#3b82f6',
        outline: 'none',
        boxShadow: `0 0 0 3px ${darkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
      },
    },
    select: {
      width: '100%',
      padding: '14px',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#3a3a4a' : '#e2e8f0'}`,
      background: darkMode ? '#2a2a3a' : '#ffffff',
      color: darkMode ? '#e2e2e2' : '#333333',
      fontSize: '0.95rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      '&:focus': {
        borderColor: darkMode ? '#4f46e5' : '#3b82f6',
        outline: 'none',
        boxShadow: `0 0 0 3px ${darkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
      },
    },
    button: {
      padding: '14px 28px',
      backgroundColor: darkMode ? '#4f46e5' : '#3b82f6',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '1rem',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      '&:hover': {
        backgroundColor: darkMode ? '#4338ca' : '#2563eb',
        transform: 'translateY(-2px)',
      },
      '&:disabled': {
        opacity: '0.7',
        cursor: 'not-allowed',
      },
    },
    secondaryButton: {
      padding: '12px 20px',
      backgroundColor: 'transparent',
      color: darkMode ? '#a0a0a0' : '#64748b',
      border: `1px solid ${darkMode ? '#3a3a4a' : '#e2e8f0'}`,
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: darkMode ? '#3a3a4a' : '#f1f5f9',
      },
    },
    imageUpload: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    imagePreview: {
      maxWidth: '200px',
      maxHeight: '200px',
      borderRadius: '8px',
      objectFit: 'cover',
      border: `2px solid ${darkMode ? '#3a3a4a' : '#e2e8f0'}`,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    errorText: {
      color: '#ef4444',
      margin: '1rem 0',
      padding: '12px',
      borderRadius: '8px',
      background: darkMode ? '#3a1c1c' : '#fee2e2',
      borderLeft: `4px solid #ef4444`,
    },
    successText: {
      color: '#10b981',
      margin: '1rem 0',
      padding: '12px',
      borderRadius: '8px',
      background: darkMode ? '#1c3a2e' : '#d1fae5',
      borderLeft: `4px solid #10b981`,
    },
    promiseItem: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    accomplishmentItem: {
      background: darkMode ? '#2a2a3a' : '#f1f5f9',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      border: `1px solid ${darkMode ? '#3a3a4a' : '#e2e8f0'}`,
    },
    darkModeToggle: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '10px',
      borderRadius: '50%',
      background: darkMode ? '#4f46e5' : '#3b82f6',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    },
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => setDarkMode((prev) => !prev)}
        style={styles.darkModeToggle}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>Contestant Management Portal</h1>
        <p style={styles.subtitle}>
          {activeTab === 'registration'
            ? 'Register new candidates for upcoming elections'
            : 'Track and update candidate accomplishments'}
        </p>
      </div>

      <div style={styles.tabSwitch}>
        <button
          style={styles.tabButton(activeTab === 'registration')}
          onClick={() => setActiveTab('registration')}
        >
          <span>🎤</span> Candidate Registration
        </button>
        <button
          style={styles.tabButton(activeTab === 'accomplishments')}
          onClick={() => setActiveTab('accomplishments')}
        >
          <span>📊</span> Track Accomplishments
        </button>
      </div>

      {errorMessage && <div style={styles.errorText}>{errorMessage}</div>}
      {successMessage && <div style={styles.successText}>{successMessage}</div>}

      <div style={styles.formContainer}>
        {activeTab === 'registration' ? (
          <form onSubmit={handleSubmitRegistration}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter candidate's full name"
                style={styles.input}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Political Party</label>
              <input
                type="text"
                name="party"
                placeholder="Enter party name"
                style={styles.input}
                value={formData.party}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Position</label>
              <select
                name="position"
                style={styles.select}
                value={formData.position}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a position
                </option>
                {positions.map((pos, i) => (
                  <option key={i} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Biography</label>
              <textarea
                name="bio"
                placeholder="Tell us about the candidate's background and qualifications..."
                style={styles.textarea}
                value={formData.bio}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>NIDA Number</label>
              <input
                type="text"
                name="nidaNumber"
                placeholder="Enter NIDA identification number"
                style={styles.input}
                value={formData.nidaNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Campaign Promises</label>
              {formData.promises.map((promise, index) => (
                <div key={index} style={styles.promiseItem}>
                  <input
                    type="text"
                    value={promise}
                    onChange={(e) => handlePromiseChange(index, e.target.value)}
                    placeholder={`Promise #${index + 1}`}
                    style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                    required
                  />
                  {formData.promises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePromiseField(index)}
                      style={{ ...styles.secondaryButton, marginTop: 0 }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPromiseField}
                style={{ ...styles.secondaryButton, marginTop: '0.5rem' }}
              >
                + Add Another Promise
              </button>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Profile Image</label>
              <div style={styles.imageUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!previewImage}
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Candidate preview"
                    style={styles.imagePreview}
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Register Candidate'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitAccomplishments}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Candidate</label>
              <select
                style={styles.select}
                value={selectedContestant}
                onChange={handleContestantSelect}
                required
              >
                <option value="" disabled>
                  Select a candidate
                </option>
                {contestants.map((contestant) => (
                  <option key={contestant._id} value={contestant._id}>
                    {contestant.name} ({contestant.party}) - {contestant.position}
                  </option>
                ))}
              </select>
            </div>

            {accomplishments.map((acc, index) => (
              <div key={index} style={styles.accomplishmentItem}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Promise</label>
                  <input
                    type="text"
                    placeholder="Enter the original promise"
                    value={acc.promise}
                    onChange={(e) =>
                      handleAccomplishmentChange(index, 'promise', e.target.value)
                    }
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={acc.accomplished}
                    onChange={(e) =>
                      handleAccomplishmentChange(index, 'accomplished', e.target.value)
                    }
                    style={styles.select}
                    required
                  >
                    <option value="true">Accomplished</option>
                    <option value="false">Not Accomplished</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Details</label>
                  <textarea
                    placeholder="Provide details about the accomplishment or reason for not fulfilling..."
                    value={acc.details}
                    onChange={(e) =>
                      handleAccomplishmentChange(index, 'details', e.target.value)
                    }
                    style={styles.textarea}
                    required
                  />
                </div>

                {accomplishments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAccomplishmentField(index)}
                    style={{ ...styles.secondaryButton, marginTop: '0.5rem' }}
                  >
                    Remove This Accomplishment
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addAccomplishmentField}
              style={{ ...styles.secondaryButton, marginRight: '1rem' }}
            >
              + Add Another Accomplishment
            </button>

            <button
              type="submit"
              style={styles.button}
              disabled={isLoading || !selectedContestant}
            >
              {isLoading ? 'Updating...' : 'Update Accomplishments'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContestantRegistration;