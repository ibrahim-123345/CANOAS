import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ContestantForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviousPromises, setShowPreviousPromises] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    fullName: "",
    party: "",
    bio: "",
    NIDA: "",
    position: "",
  });

  const [promises, setPromises] = useState([{ text: "" }]);
  const [previousPromises, setPreviousPromises] = useState([{ 
    text: "", 
    fulfilled: false,
    position: "",
    timeServed: "" 
  }]);
  const [lastPositions, setLastPositions] = useState([{ 
    position: "", 
    organization: "", 
    duration: "" 
  }]);
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState("");

  // Handle input change for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle promises change
  const handlePromiseChange = (index, value) => {
    const updated = [...promises];
    updated[index].text = value;
    setPromises(updated);
  };

  // Add promise
  const addPromise = () => {
    if (promises.length >= 5) return;
    setPromises(prev => [...prev, { text: "" }]);
  };

  // Remove promise
  const removePromise = (index) => {
    const updated = [...promises];
    updated.splice(index, 1);
    setPromises(updated);
  };

  // Handle previous promises change
  const handlePreviousPromiseChange = (index, field, value) => {
    const updated = [...previousPromises];
    updated[index][field] = value;
    setPreviousPromises(updated);
  };

  // Add previous promise
  const addPreviousPromise = () => {
    if (previousPromises.length >= 5) return;
    setPreviousPromises(prev => [...prev, { 
      text: "", 
      fulfilled: false,
      position: "",
      timeServed: "" 
    }]);
  };

  // Remove previous promise
  const removePreviousPromise = (index) => {
    const updated = [...previousPromises];
    updated.splice(index, 1);
    setPreviousPromises(updated);
  };

  // Handle last positions change
  const handleLastPositionChange = (index, field, value) => {
    const updated = [...lastPositions];
    updated[index][field] = value;
    setLastPositions(updated);
  };

  // Add last position
  const addLastPosition = () => {
    if (lastPositions.length >= 5) return;
    setLastPositions(prev => [...prev, { position: "", organization: "", duration: "" }]);
  };

  // Remove last position
  const removeLastPosition = (index) => {
    const updated = [...lastPositions];
    updated.splice(index, 1);
    setLastPositions(updated);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  // Go to next step validation
  const nextStep = () => {
    if (step === 1) {
      // Basic validation for step 1
      if (
        !formData.fullName ||
        !formData.party ||
        !formData.bio ||
        !formData.NIDA ||
        !formData.position
      ) {
        setError("Please fill in all required fields");
        return;
      }
      if (formData.NIDA.length < 5) {
        setError("NIDA must be at least 5 characters");
        return;
      }
      if (formData.bio.length < 10 || formData.bio.length > 200) {
        setError("Bio must be between 10 and 200 characters");
        return;
      }
      if (formData.party.length < 3 || formData.party.length > 50) {
        setError("Party name must be between 3 and 50 characters");
        return;
      }
      if (formData.fullName.length < 3 || formData.fullName.length > 50) {
        setError("Name must be between 3 and 50 characters");
        return;
      }
    }

    setError("");
    setStep(step + 1);
  };

  // Go to previous step
  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  // Submit form data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate promises (step 2)
    const filteredPromises = promises.map(p => p.text.trim()).filter(p => p.length > 0);
    if (filteredPromises.length < 1) {
      setError("Please add at least one promise");
      setIsSubmitting(false);
      return;
    }
    if (filteredPromises.length > 5) {
      setError("Maximum 5 promises allowed");
      setIsSubmitting(false);
      return;
    }

    // Validate lastPositions (step 3) - optional but limit max 5
    const filteredLastPositions = lastPositions.filter(
      lp => lp.position.trim() !== "" || lp.organization.trim() !== "" || lp.duration.trim() !== ""
    );
    if (filteredLastPositions.length > 5) {
      setError("Maximum 5 last positions allowed");
      setIsSubmitting(false);
      return;
    }

    setError("");

    // Build FormData for file upload
    const formDataToSend = new FormData();

    formDataToSend.append("name", formData.fullName);
    formDataToSend.append("party", formData.party);
    formDataToSend.append("bio", formData.bio);
    formDataToSend.append("nidaNumber", formData.NIDA);
    formDataToSend.append("position", formData.position);

    // promises as array strings
    filteredPromises.forEach(p => formDataToSend.append("promises[]", p));

    // lastPositions as array of objects
    filteredLastPositions.forEach(lp => {
      formDataToSend.append("previousLeadership[]", JSON.stringify(lp));
    });

    if (profileImage) {
      formDataToSend.append("profileImage", profileImage);
    }

    try {
      const res = await axios.post(
        "/contestants",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      toast.success("Contestant created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Show previous promises form after 2 seconds
      setTimeout(() => {
        setShowPreviousPromises(true);
      }, 2000);

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit previous promises
  const handleSubmitPreviousPromises = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Filter out empty promises
    const filteredPreviousPromises = previousPromises.filter(
      pp => pp.text.trim() !== "" || pp.position.trim() !== "" || pp.timeServed.trim() !== ""
    );

    if (filteredPreviousPromises.length === 0) {
      setError("Please add at least one previous promise");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post(
        "/contestants/",
        {
          contestantId: formData.NIDA, // Using NIDA as identifier
          previousPromises: filteredPreviousPromises
        }
      );
      
      toast.success("Previous promises added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset form
      setTimeout(() => {
        setStep(1);
        setFormData({
          fullName: "",
          party: "",
          bio: "",
          NIDA: "",
          position: "",
        });
        setPromises([{ text: "" }]);
        setPreviousPromises([{ 
          text: "", 
          fulfilled: false,
          position: "",
          timeServed: "" 
        }]);
        setLastPositions([{ position: "", organization: "", duration: "" }]);
        setProfileImage(null);
        setShowPreviousPromises(false);
      }, 2000);

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit previous promises", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showPreviousPromises) {
    return (
      <div className="form-container">
        <ToastContainer />
        <h2>Add Previous Promises</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmitPreviousPromises}>
          <div className="previous-promises-section">
            <h3>Previous Promises (max 5)</h3>
            {previousPromises.map((pp, index) => (
              <div key={index} className="promise-item">
                <div className="form-group">
                  <label>Promise Text:</label>
                  <input
                    type="text"
                    value={pp.text}
                    onChange={(e) => handlePreviousPromiseChange(index, "text", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Position Held:</label>
                  <input
                    type="text"
                    value={pp.position}
                    onChange={(e) => handlePreviousPromiseChange(index, "position", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time Served:</label>
                  <input
                    type="text"
                    value={pp.timeServed}
                    onChange={(e) => handlePreviousPromiseChange(index, "timeServed", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={pp.fulfilled}
                      onChange={(e) => handlePreviousPromiseChange(index, "fulfilled", e.target.checked)}
                    />
                    Fulfilled
                  </label>
                </div>
                {previousPromises.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removePreviousPromise(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {previousPromises.length < 5 && (
              <button 
                type="button" 
                className="add-btn"
                onClick={addPreviousPromise}
              >
                Add Previous Promise
              </button>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Previous Promises"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="form-container">
      <ToastContainer />
      <h2>Contestant Registration</h2>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="basic-info-section">
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Party:</label>
              <input
                type="text"
                name="party"
                value={formData.party}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label>NIDA Number:</label>
              <input
                type="text"
                name="NIDA"
                value={formData.NIDA}
                onChange={handleChange}
                required
                minLength={5}
              />
            </div>
            <div className="form-group">
              <label>Position:</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="promises-section">
            <h3>Current Campaign Promises (max 5)</h3>
            {promises.map((promise, index) => (
              <div key={index} className="promise-item">
                <div className="form-group">
                  <input
                    type="text"
                    value={promise.text}
                    onChange={(e) => handlePromiseChange(index, e.target.value)}
                    required
                  />
                </div>
                {promises.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removePromise(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {promises.length < 5 && (
              <button 
                type="button" 
                className="add-btn"
                onClick={addPromise}
              >
                Add Promise
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="last-positions-section">
            <h3>Previous Leadership Positions (optional, max 5)</h3>
            {lastPositions.map((lp, index) => (
              <div key={index} className="position-item">
                <div className="form-group">
                  <label>Position:</label>
                  <input
                    type="text"
                    placeholder="e.g. Mayor"
                    value={lp.position}
                    onChange={(e) => handleLastPositionChange(index, "position", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Organization:</label>
                  <input
                    type="text"
                    placeholder="e.g. Springfield City"
                    value={lp.organization}
                    onChange={(e) => handleLastPositionChange(index, "organization", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Duration:</label>
                  <input
                    type="text"
                    placeholder="e.g. 2015-2019"
                    value={lp.duration}
                    onChange={(e) => handleLastPositionChange(index, "duration", e.target.value)}
                  />
                </div>
                {lastPositions.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeLastPosition(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {lastPositions.length < 5 && (
              <button 
                type="button" 
                className="add-btn"
                onClick={addLastPosition}
              >
                Add Position
              </button>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="image-upload-section">
            <h3>Upload Profile Image</h3>
            <div className="form-group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="file-input"
              />
              {profileImage && (
                <div className="file-info">
                  <p>Selected file: {profileImage.name}</p>
                  <p>Size: {(profileImage.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          {step > 1 && (
            <button 
              type="button" 
              className="back-btn"
              onClick={prevStep}
            >
              Back
            </button>
          )}

          {step < 4 && (
            <button 
              type="button" 
              className="next-btn"
              onClick={nextStep}
            >
              Next
            </button>
          )}

          {step === 4 && (
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </form>

      <div style={{
  maxWidth: "800px",
  margin: "2rem auto",
  padding: "2rem",
  background: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
}}>
  <style>
        {`
          .form-container {
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }

          h2 {
            color: #2c3e50;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          h3 {
            color: #34495e;
            margin-bottom: 1rem;
            font-size: 1.2rem;
          }

          .error-message {
            color: #e74c3c;
            background: #fadbd8;
            padding: 0.75rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            text-align: center;
          }

          .form-group {
            margin-bottom: 1rem;
          }

          label {
            display: block;
            margin-bottom: 0.5rem;
            color: #2c3e50;
            font-weight: 500;
          }

          input[type="text"],
          input[type="file"],
          textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            transition: border-color 0.3s;
          }

          input[type="text"]:focus,
          textarea:focus {
            border-color: #3498db;
            outline: none;
          }

          textarea {
            min-height: 100px;
            resize: vertical;
          }

          .file-input {
            padding: 0.5rem;
          }

          .file-info {
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #7f8c8d;
          }

          .promise-item,
          .position-item {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            border: 1px solid #eee;
          }

          .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.5rem 0;
          }

          .checkbox-group input {
            width: auto;
          }

          .form-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 2rem;
          }

          button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          .back-btn {
            background: #95a5a6;
            color: white;
          }

          .back-btn:hover {
            background: #7f8c8d;
          }

          .next-btn,
          .add-btn {
            background: #3498db;
            color: white;
          }

          .next-btn:hover,
          .add-btn:hover {
            background: #2980b9;
          }

          .submit-btn {
            background: #2ecc71;
            color: white;
          }

          .submit-btn:hover {
            background: #27ae60;
          }

          .submit-btn:disabled {
            background: #bdc3c7;
            cursor: not-allowed;
          }

          .remove-btn {
            background: #e74c3c;
            color: white;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }

          .remove-btn:hover {
            background: #c0392b;
          }

          @media (max-width: 768px) {
            .form-container {
              padding: 1rem;
            }

            .form-actions {
              flex-direction: column;
              gap: 0.5rem;
            }

            button {
              width: 100%;
            }
          }
        `}
      </style>
</div>
    </div>
  );
}