import axios from 'axios';
import React, { useState, useEffect } from 'react';

const ContestantRegistration = () => {
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

  const positions = [
    'President',
    'Vice President',
    'General Secretary',
    'Treasurer',
    'Minister of Information',
  ];

  useEffect(() => {
    document.body.style.background = darkMode ? '#121212' : '#ffffff';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    setPreviewImage(URL.createObjectURL(file));
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

  const addAccomplishmentField = () => {
    setAccomplishments((prev) => [
      ...prev,
      { promise: '', accomplished: false, details: '' },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (activeTab === 'registration') {
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

        alert('Contestant data submitted successfully!');

       await axios.post(
          'http://localhost:8000/notifications',
          {
  "message": `new contestant created with name ${formDataToSubmit.get("name")}`,
  "read": false
}

        );

        alert('Contestant data submitted successfully!');














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
      } else if (activeTab === 'accomplishments') {
        const payload = {
          type: 'accomplishments',
          data: accomplishments,
        };

        const response = await axios.post(
          'http://localhost:8000/contestants',
          payload
        );

        alert('Accomplishments submitted successfully!');
        





         await axios.post(
          'http://localhost:8000/notifications',
          {
  "message":"new accomplishment upload and faliures to a contestant",
  "read": false
})










        setAccomplishments([{ promise: '', accomplished: false, details: '' }]);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  const styles = {
    container: {
      maxWidth: '850px',
      margin: '2rem auto',
      padding: '2rem',
      borderRadius: '20px',
      background: darkMode ? '#1c1c1e' : '#f9f9f9',
      color: darkMode ? '#fff' : '#333',
      boxShadow: '0 20px 30px rgba(0,0,0,0.2)',
      fontFamily: 'Segoe UI, sans-serif',
    },
    tabSwitch: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem',
      gap: '1rem',
    },
    tabButton: (active) => ({
      padding: '10px 20px',
      borderRadius: '12px',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: active ? '#007bff' : '#ccc',
      color: '#fff',
      fontWeight: 'bold',
    }),
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: '1px solid #ccc',
      marginBottom: '1rem',
      background: darkMode ? '#2c2c2e' : '#fff',
      color: darkMode ? '#fff' : '#000',
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '12px',
      borderRadius: '10px',
      border: '1px solid #ccc',
      background: darkMode ? '#2c2c2e' : '#fff',
      color: darkMode ? '#fff' : '#000',
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '1rem',
    },
    imagePreview: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '10px',
      marginTop: '1rem',
    },
    errorText: {
      color: 'red',
      marginBottom: '1rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.tabSwitch}>
        <button
          style={styles.tabButton(activeTab === 'registration')}
          onClick={() => setActiveTab('registration')}
        >
          Register
        </button>
        <button
          style={styles.tabButton(activeTab === 'accomplishments')}
          onClick={() => setActiveTab('accomplishments')}
        >
          Add Accomplishments
        </button>
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          style={{ ...styles.button, backgroundColor: '#555', marginLeft: 'auto' }}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {errorMessage && <div style={styles.errorText}>{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        {activeTab === 'registration' && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              style={styles.input}
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="party"
              placeholder="Party"
              style={styles.input}
              value={formData.party}
              onChange={handleChange}
              required
            />
            <select
              name="position"
              style={styles.input}
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
            <textarea
              name="bio"
              placeholder="Bio"
              style={styles.textarea}
              value={formData.bio}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="nidaNumber"
              placeholder="NIDA Number"
              style={styles.input}
              value={formData.nidaNumber}
              onChange={handleChange}
              required
            />
            {formData.promises.map((promise, index) => (
              <input
                key={index}
                type="text"
                value={promise}
                onChange={(e) => handlePromiseChange(index, e.target.value)}
                placeholder={`Promise ${index + 1}`}
                style={styles.input}
              />
            ))}
            <button
              type="button"
              onClick={addPromiseField}
              style={{ ...styles.button, backgroundColor: '#007bff' }}
            >
              + Add Promise
            </button>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {previewImage && (
              <img src={previewImage} alt="Preview" style={styles.imagePreview} />
            )}
          </>
        )}

        {activeTab === 'accomplishments' && (
          <>
            {accomplishments.map((acc, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder="Promise"
                  value={acc.promise}
                  onChange={(e) =>
                    handleAccomplishmentChange(index, 'promise', e.target.value)
                  }
                  style={styles.input}
                />
                <select
                  value={acc.accomplished}
                  onChange={(e) =>
                    handleAccomplishmentChange(index, 'accomplished', e.target.value)
                  }
                  style={styles.input}
                >
                  <option value="true">Accomplished</option>
                  <option value="false">Not Accomplished</option>
                </select>
                <textarea
                  placeholder="Details"
                  value={acc.details}
                  onChange={(e) =>
                    handleAccomplishmentChange(index, 'details', e.target.value)
                  }
                  style={styles.textarea}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addAccomplishmentField}
              style={{ ...styles.button, backgroundColor: '#6c757d' }}
            >
              + Add Accomplishment
            </button>
          </>
        )}

        <button type="submit" style={styles.button}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContestantRegistration;
