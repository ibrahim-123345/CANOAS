import axios from 'axios';
import React, { useState } from 'react';

const ContestantRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    bio: '',
    nidaNumber: '',
    promises: [''],
    image: null,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, image: file }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handlePromiseChange = (index, value) => {
    const updatedPromises = [...formData.promises];
    updatedPromises[index] = value;
    setFormData(prev => ({ ...prev, promises: updatedPromises }));
  };

  const addPromiseField = () => {
    setFormData(prev => ({ ...prev, promises: [...prev.promises, ''] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('party', formData.party);
      formDataToSubmit.append('bio', formData.bio);
      formDataToSubmit.append('nidaNumber', formData.nidaNumber);
      formData.promises.forEach((promise, index) => {
        formDataToSubmit.append(`promises[${index}]`, promise);
      });
      if (formData.image) {
        formDataToSubmit.append('profileImage', formData.image);
      }

      const response = await axios.post('http://localhost:8000/contestants', formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Contestant registered successfully!');
      
      console.log('Submitted Data:', response.data);

      setFormData({
        name: '',
        party: '',
        bio: '',
        nidaNumber: '',
        promises: [''],
        image: null,
      });
      setPreviewImage(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    }
  };

  const styles = {
    container: {
      maxWidth: '700px',
      margin: '0 auto',
      padding: '2rem',
      background: darkMode ? '#1c1c1c' : '#ffffff',
      color: darkMode ? '#ffffff' : '#000000',
      borderRadius: '16px',
      boxShadow: '0 0 15px rgba(0,0,0,0.2)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
    },
    formGroup: {
      marginBottom: '1rem',
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '10px',
      border: '1px solid #ccc',
      background: darkMode ? '#2d2d2d' : '#f9f9f9',
      color: darkMode ? '#fff' : '#000',
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '10px',
      borderRadius: '10px',
      border: '1px solid #ccc',
      background: darkMode ? '#2d2d2d' : '#f9f9f9',
      color: darkMode ? '#fff' : '#000',
    },
    imagePreview: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '10px',
      marginTop: '1rem',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#4caf50',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      marginTop: '1rem',
    },
    toggleButton: {
      background: 'none',
      border: '1px solid #888',
      padding: '6px 12px',
      borderRadius: '10px',
      cursor: 'pointer',
      color: darkMode ? '#fff' : '#000',
    },
    promiseGroup: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      marginBottom: '8px',
    },
    errorText: {
      color: 'red',
      marginBottom: '1rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Register Contestant</h2>
        <button style={styles.toggleButton} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {errorMessage && <div style={styles.errorText}>{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Full Name</label>
          <input type="text" name="name" style={styles.input} value={formData.name} onChange={handleChange} required />
        </div>

        <div style={styles.formGroup}>
          <label>Party</label>
          <input type="text" name="party" style={styles.input} value={formData.party} onChange={handleChange} required />
        </div>

        <div style={styles.formGroup}>
          <label>Bio</label>
          <textarea name="bio" style={styles.textarea} value={formData.bio} onChange={handleChange} required />
        </div>

        <div style={styles.formGroup}>
          <label>NIDA Number</label>
          <input type="text" name="nidaNumber" style={styles.input} value={formData.nidaNumber} onChange={handleChange} required />
        </div>

        <div style={styles.formGroup}>
          <label>Key Promises</label>
          {formData.promises.map((promise, index) => (
            <div key={index} style={styles.promiseGroup}>
              <input
                type="text"
                value={promise}
                onChange={(e) => handlePromiseChange(index, e.target.value)}
                placeholder={`Promise ${index + 1}`}
                style={styles.input}
              />
            </div>
          ))}
          <button type="button" style={styles.button} onClick={addPromiseField}>
            + Add Promise
          </button>
        </div>

        <div style={styles.formGroup}>
          <label>Upload Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {previewImage && <img src={previewImage} alt="Preview" style={styles.imagePreview} />}
        </div>

        <button type="submit" style={styles.button}>Register Contestant</button>
      </form>
    </div>
  );
};

export default ContestantRegistration;
