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

// Add icons to library
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
    { promise: '', accomplished: false, details: '', 
      previousPosition: '', timeServed: '', organization: '' }
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
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`fixed top-4 right-4 p-3 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-800'} text-white shadow-lg hover:scale-110 transition-transform`}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-3">Contestant Management Portal</h1>
          <p className="text-xl opacity-80">
            {activeTab === 'registration'
              ? 'Register new candidates for upcoming elections'
              : 'Track and update candidate accomplishments'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-4">
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'registration' 
              ? `${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white shadow-md` 
              : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-700`}`}
            onClick={() => setActiveTab('registration')}
          >
            <FontAwesomeIcon icon="user-plus" className="mr-2" />
            Candidate Registration
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'accomplishments' 
              ? `${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white shadow-md` 
              : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-700`}`}
            onClick={() => setActiveTab('accomplishments')}
          >
            <FontAwesomeIcon icon="tasks" className="mr-2" />
            Track Accomplishments
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-red-900' : 'bg-red-100'} ${darkMode ? 'text-red-100' : 'text-red-700'}`}>
            <FontAwesomeIcon icon="exclamation-circle" className="mr-2" />
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-green-900' : 'bg-green-100'} ${darkMode ? 'text-green-100' : 'text-green-700'}`}>
            <FontAwesomeIcon icon="check-circle" className="mr-2" />
            {successMessage}
          </div>
        )}

        {/* Forms */}
        <div className={`rounded-2xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {activeTab === 'registration' ? (
            <form onSubmit={handleSubmitRegistration} className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon="user" className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`pl-10 w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter candidate's full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Political Party</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon="flag" className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="party"
                        value={formData.party}
                        onChange={handleChange}
                        className={`pl-10 w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter party name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Position</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon="briefcase" className="text-gray-400" />
                      </div>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className={`pl-10 w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        required
                      >
                        <option value="">Select a position</option>
                        {positions.map((pos, i) => (
                          <option key={i} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">NIDA Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon="id-card" className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="nidaNumber"
                        value={formData.nidaNumber}
                        onChange={handleChange}
                        className={`pl-10 w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter NIDA identification number"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Biography</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      rows="5"
                      placeholder="Tell us about the candidate's background and qualifications..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Profile Image</label>
                    <div className="flex items-center">
                      <label className={`inline-flex items-center px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-300 hover:bg-gray-50'} cursor-pointer transition`}>
                        <FontAwesomeIcon icon="upload" className="mr-2" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      {previewImage && (
                        <div className="ml-4">
                          <img 
                            src={previewImage} 
                            alt="Candidate preview" 
                            className="h-16 w-16 rounded-full object-cover border-2 border-white shadow" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Promises */}
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Promises</label>
                <div className="space-y-3">
                  {formData.promises.map((promise, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-grow">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon="bullhorn" className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={promise}
                            onChange={(e) => handlePromiseChange(index, e.target.value)}
                            className={`pl-10 w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            placeholder={`Promise #${index + 1}`}
                            required
                          />
                        </div>
                      </div>
                      {formData.promises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePromiseField(index)}
                          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <FontAwesomeIcon icon="times" className="text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPromiseField}
                  className={`mt-3 inline-flex items-center px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition`}
                >
                  <FontAwesomeIcon icon="plus" className="mr-2" />
                  Add Another Promise
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-lg font-medium text-white ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="user-check" className="mr-2" />
                      Register Candidate
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitAccomplishments} className="p-8 space-y-6">
              {/* Contestant Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">Select Candidate</label>
                <select
                  value={selectedContestant}
                  onChange={handleContestantSelect}
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                <div key={index} className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Promise Info */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Promise</label>
                      <input
                        type="text"
                        placeholder="Enter the original promise"
                        value={acc.promise}
                        onChange={(e) => handleAccomplishmentChange(index, 'promise', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={acc.accomplished}
                        onChange={(e) => handleAccomplishmentChange(index, 'accomplished', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        required
                      >
                        <option value="true">Accomplished</option>
                        <option value="false">Not Accomplished</option>
                      </select>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Details</label>
                    <textarea
                      placeholder="Provide details about the accomplishment or reason for not fulfilling..."
                      value={acc.details}
                      onChange={(e) => handleAccomplishmentChange(index, 'details', e.target.value)}
                      className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      rows="3"
                      required
                    />
                  </div>

                  {/* Previous Experience */}
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Previous Position</label>
                      <input
                        type="text"
                        placeholder="E.g. Member of Parliament"
                        value={acc.previousPosition}
                        onChange={(e) => handleAccomplishmentChange(index, 'previousPosition', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Organization</label>
                      <input
                        type="text"
                        placeholder="E.g. Tanzanian Parliament"
                        value={acc.organization}
                        onChange={(e) => handleAccomplishmentChange(index, 'organization', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Served</label>
                      <input
                        type="text"
                        placeholder="E.g. 2015-2020"
                        value={acc.timeServed}
                        onChange={(e) => handleAccomplishmentChange(index, 'timeServed', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                  </div>

                  {accomplishments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAccomplishmentField(index)}
                      className={`mt-4 inline-flex items-center px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} transition`}
                    >
                      <FontAwesomeIcon icon="trash" className="mr-2" />
                      Remove This Accomplishment
                    </button>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={addAccomplishmentField}
                  className={`inline-flex items-center px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition`}
                >
                  <FontAwesomeIcon icon="plus" className="mr-2" />
                  Add Another Accomplishment
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !selectedContestant}
                  className={`inline-flex items-center px-6 py-3 rounded-lg text-white ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="save" className="mr-2" />
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