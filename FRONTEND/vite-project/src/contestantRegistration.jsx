import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faUser, faFlag, faBriefcase, faIdCard, faUpload, 
  faBullhorn, faTimes, faPlus, faUserCheck, faIdBadge, 
  faCommentAlt, faCheckCircle, faChevronDown, faTrash, 
  faSave, faTasks, faUserPlus, faSun, faMoon
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faUser, faFlag, faBriefcase, faIdCard, faUpload, 
  faBullhorn, faTimes, faPlus, faUserCheck, faIdBadge, 
  faCommentAlt, faCheckCircle, faChevronDown, faTrash, 
  faSave, faTasks, faUserPlus, faSun, faMoon
);

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
    { promise: '', accomplished: false, details: '', previousPosition: '', timeServed: '', organization: '' }
  ]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
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

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: darkMode ? '#121212' : '#f5f7fa',
      color: darkMode ? '#ffffff' : '#333333',
      transition: 'all 0.3s ease'
    },
    innerContainer: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: darkMode ? '#ffffff' : '#1a365d'
    },
    subtitle: {
      fontSize: '1rem',
      opacity: '0.8',
      fontWeight: '300'
    },
    tabsContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem',
      gap: '1rem'
    },
    tabButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      border: 'none',
      cursor: 'pointer'
    },
    activeTab: {
      backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
      color: 'white'
    },
    inactiveTab: {
      backgroundColor: darkMode ? '#1f2937' : '#e5e7eb',
      color: darkMode ? '#e5e7eb' : '#374151'
    },
    card: {
      borderRadius: '0.75rem',
      padding: '2rem',
      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    inputGroup: {
      marginBottom: '1.25rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: darkMode ? '#e5e7eb' : '#4b5563'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#111827',
      fontSize: '0.95rem',
      ':focus': {
        outline: 'none',
        borderColor: darkMode ? '#60a5fa' : '#3b82f6',
        boxShadow: `0 0 0 3px ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
      }
    },
    textarea: {
      minHeight: '100px',
      resize: 'vertical'
    },
    uploadButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginRight: '1rem'
    },
    previewImage: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`
    },
    addButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      backgroundColor: darkMode ? '#374151' : '#e5e7eb',
      color: darkMode ? '#f3f4f6' : '#111827',
      cursor: 'pointer',
      border: 'none',
      fontSize: '0.875rem',
      marginBottom: '1rem'
    },
    removeButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '0.375rem',
      backgroundColor: 'transparent',
      color: '#ef4444',
      cursor: 'pointer',
      border: 'none'
    },
    submitButton: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
      color: 'white',
      fontWeight: '600',
      fontSize: '1rem',
      border: 'none',
      cursor: 'pointer',
      marginTop: '1rem'
    },
    message: {
      padding: '1rem',
      borderRadius: '0.375rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    successMessage: {
      backgroundColor: darkMode ? '#065f46' : '#d1fae5',
      color: darkMode ? '#d1fae5' : '#065f46'
    },
    errorMessage: {
      backgroundColor: darkMode ? '#7f1d1d' : '#fee2e2',
      color: darkMode ? '#fecaca' : '#b91c1c'
    },
    darkModeToggle: {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
      backgroundColor: darkMode ? '#3b82f6' : '#1f2937',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    accomplishmentCard: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      marginBottom: '1.5rem'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      backgroundColor: darkMode ? '#10b981' : '#059669',
      color: 'white',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer'
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#121212' : '#f5f7fa';
    document.body.style.color = darkMode ? '#ffffff' : '#333333';
    localStorage.setItem('darkMode', darkMode);
    
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
      { promise: '', accomplished: false, details: '', 
        previousPosition: '', timeServed: '', organization: '' }
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
        } else if (val !== null && val !== '') {
          formDataToSubmit.append(key, val);
        }
      });

      const response = await axios.post(
        'http://localhost:8000/contestants',
        formDataToSubmit,
        { headers: { 'Content-Type': 'multipart/form-data' } }
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

      const updatePayload = {
        accomplishments: accomplishments.map(acc => ({
          promise: acc.promise,
          accomplished: acc.accomplished,
          details: acc.details,
          previousPosition: acc.previousPosition,
          timeServed: acc.timeServed,
          organization: acc.organization
        }))
      };
      
      const updateResponse = await axios.patch(
        `http://localhost:8000/contestants/${selectedContestant}`,
        updatePayload
      );

      await axios.post('http://localhost:8000/notifications', {
        message: `Accomplishments updated for contestant ID: ${selectedContestant}`,
        read: false
      });

      setSuccessMessage('Accomplishments updated successfully!');
      setAccomplishments([{ 
        promise: '', 
        accomplished: false, 
        details: '',
        previousPosition: '',
        timeServed: '',
        organization: ''
      }]);
      setSelectedContestant('');
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || error.message || 'Update failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContestantSelect = async (e) => {
    const contestantId = e.target.value;
    setSelectedContestant(contestantId);
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={styles.darkModeToggle}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
        </button>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Contestant Management Portal</h1>
          <p style={styles.subtitle}>
            {activeTab === 'registration'
              ? 'Register new candidates for upcoming elections'
              : 'Track and update candidate accomplishments'}
          </p>
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'registration' ? styles.activeTab : styles.inactiveTab)
            }}
            onClick={() => setActiveTab('registration')}
          >
            <FontAwesomeIcon icon="user-plus" />
            Candidate Registration
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'accomplishments' ? styles.activeTab : styles.inactiveTab)
            }}
            onClick={() => setActiveTab('accomplishments')}
          >
            <FontAwesomeIcon icon="tasks" />
            Track Accomplishments
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div style={{ ...styles.message, ...styles.errorMessage }}>
            <FontAwesomeIcon icon="exclamation-circle" />
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div style={{ ...styles.message, ...styles.successMessage }}>
            <FontAwesomeIcon icon="check-circle" />
            {successMessage}
          </div>
        )}

        {/* Forms */}
        <div style={styles.card}>
          {activeTab === 'registration' ? (
            <form onSubmit={handleSubmitRegistration}>
              <div style={styles.formGrid}>
                {/* Left Column */}
                <div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter candidate's full name"
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Political Party</label>
                    <input
                      type="text"
                      name="party"
                      value={formData.party}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter party name"
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Position</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    >
                      <option value="">Select a position</option>
                      {positions.map((pos, i) => (
                        <option key={i} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>NIDA Number</label>
                    <input
                      type="text"
                      name="nidaNumber"
                      value={formData.nidaNumber}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter NIDA identification number"
                      required
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Biography</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      style={{ ...styles.input, ...styles.textarea }}
                      placeholder="Tell us about the candidate's background and qualifications..."
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Profile Image</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={styles.uploadButton}>
                        <FontAwesomeIcon icon="upload" style={{ marginRight: '0.5rem' }} />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {previewImage && (
                        <img 
                          src={previewImage} 
                          alt="Candidate preview" 
                          style={styles.previewImage} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Promises */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Campaign Promises</label>
                {formData.promises.map((promise, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={promise}
                      onChange={(e) => handlePromiseChange(index, e.target.value)}
                      style={styles.input}
                      placeholder={`Promise #${index + 1}`}
                      required
                    />
                    {formData.promises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePromiseField(index)}
                        style={styles.removeButton}
                      >
                        <FontAwesomeIcon icon="times" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPromiseField}
                  style={styles.addButton}
                >
                  <FontAwesomeIcon icon="plus" style={{ marginRight: '0.5rem' }} />
                  Add Another Promise
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={styles.submitButton}
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <FontAwesomeIcon icon="user-check" style={{ marginRight: '0.5rem' }} />
                    Register Candidate
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitAccomplishments}>
              {/* Contestant Selection */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Candidate</label>
                <select
                  value={selectedContestant}
                  onChange={handleContestantSelect}
                  style={styles.input}
                  required
                >
                  <option value="">Select a candidate</option>
                  {contestants.map((contestant) => (
                    <option key={contestant._id} value={contestant._id}>
                      {contestant.name} ({contestant.party}) - {contestant.position}
                    </option>
                  ))}
                </select>
              </div>

              {/* Accomplishments */}
              {accomplishments.map((acc, index) => (
                <div key={index} style={styles.accomplishmentCard}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={styles.label}>Promise</label>
                      <input
                        type="text"
                        placeholder="Enter the original promise"
                        value={acc.promise}
                        onChange={(e) => handleAccomplishmentChange(index, 'promise', e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>

                    <div>
                      <label style={styles.label}>Status</label>
                      <select
                        value={acc.accomplished}
                        onChange={(e) => handleAccomplishmentChange(index, 'accomplished', e.target.value)}
                        style={styles.input}
                        required
                      >
                        <option value="true">Accomplished</option>
                        <option value="false">Not Accomplished</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Details</label>
                    <textarea
                      placeholder="Provide details about the accomplishment or reason for not fulfilling..."
                      value={acc.details}
                      onChange={(e) => handleAccomplishmentChange(index, 'details', e.target.value)}
                      style={{ ...styles.input, ...styles.textarea }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={styles.label}>Previous Position</label>
                      <input
                        type="text"
                        placeholder="E.g. Member of Parliament"
                        value={acc.previousPosition}
                        onChange={(e) => handleAccomplishmentChange(index, 'previousPosition', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Organization</label>
                      <input
                        type="text"
                        placeholder="E.g. Tanzanian Parliament"
                        value={acc.organization}
                        onChange={(e) => handleAccomplishmentChange(index, 'organization', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Time Served</label>
                      <input
                        type="text"
                        placeholder="E.g. 2015-2020"
                        value={acc.timeServed}
                        onChange={(e) => handleAccomplishmentChange(index, 'timeServed', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  {accomplishments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAccomplishmentField(index)}
                      style={{ ...styles.addButton, marginTop: '1rem' }}
                    >
                      <FontAwesomeIcon icon="trash" style={{ marginRight: '0.5rem' }} />
                      Remove This Accomplishment
                    </button>
                  )}
                </div>
              ))}

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={addAccomplishmentField}
                  style={styles.addButton}
                >
                  <FontAwesomeIcon icon="plus" style={{ marginRight: '0.5rem' }} />
                  Add Another Accomplishment
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !selectedContestant}
                  style={styles.saveButton}
                >
                  {isLoading ? (
                    'Updating...'
                  ) : (
                    <>
                      <FontAwesomeIcon icon="save" style={{ marginRight: '0.5rem' }} />
                      Update Accomplishments
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestantRegistration;