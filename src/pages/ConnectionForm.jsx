// src/components/ConnectionForm.jsx
import React, { useState, useEffect } from 'react';
import './ConnectionForm.css'; // Import the new CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faExclamationTriangle, faUser } from '@fortawesome/free-solid-svg-icons'; // Added faUser for input icons


const ConnectionForm = ({ trainerId, trainerName, onClose, onSubmit }) => {
  const [userData, setUserData] = useState(null); // To store fetched user data
  const [selectedGoals, setSelectedGoals] = useState([]); // For multiple goals
  const [otherGoal, setOtherGoal] = useState(''); // For when 'Other' is selected
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true); // New loading state for user data
  const [userFetchError, setUserFetchError] = useState(null); // New error state

  const availableGoals = [
    { value: 'weightLoss', label: 'Weight Loss' },
    { value: 'weightGain', label: 'Weight Gain' },
    { value: 'muscleBuilding', label: 'Muscle Building' },
    { value: 'strengthTraining', label: 'Strength Training' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingUser(true);
      setUserFetchError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        const response = await fetch("http://localhost:5050/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setUserFetchError(err.message || "Failed to load user data.");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  const handleGoalChange = (e) => {
    const { value, checked } = e.target;
    setSelectedGoals(prevGoals => {
      if (checked) {
        return [...prevGoals, value];
      } else {
        return prevGoals.filter(goal => goal !== value);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!userData) {
        setSubmitError("User data not loaded. Cannot submit.");
        setIsSubmitting(false);
        return;
    }
    if (selectedGoals.length === 0) {
        setSubmitError("Please select at least one fitness goal.");
        setIsSubmitting(false);
        return;
    }
    if (selectedGoals.includes('other') && !otherGoal.trim()) {
        setSubmitError("Please specify your 'Other' goal.");
        setIsSubmitting(false);
        return;
    }

    const finalGoals = selectedGoals.map(goal =>
      goal === 'other' ? otherGoal.trim() : goal
    );

    try {
      const response = await fetch("http://localhost:5050/api/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          trainerId,
          userGoals: finalGoals,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit connection request.");
      }

      setSubmitSuccess(true);
      setTimeout(() => { // Close after 2 seconds to show success message
        if (onSubmit) {
          onSubmit();
        }
      }, 2000);

    } catch (err) {
      console.error("Connection request submission error:", err);
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="connection-form-overlay">
        <div className="connection-loading-message">
          <FontAwesomeIcon icon={faSpinner} spin className="message-icon" />
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

 if (userFetchError) {
  return (
    <div className="connection-form-overlay">
      <div className="connection-error-message">
        {/* Close "X" icon */}
        <button onClick={onClose} className="connection-error-close">
          &times;
        </button>

        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="message-icon"
        />
        <p>Error: {userFetchError}</p>
      </div>
    </div>
  );
}


  return (
    <div className="connection-form-overlay">
      <div className="connection-form-modal">
        <button onClick={onClose} className="connection-form-close-button">
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h3 className="connection-form-title">Connect with {trainerName}</h3>
        <form onSubmit={handleSubmit}>
          {/* Display user's pre-filled information as read-only */}
          <div className="connection-form-group">
            <label className="connection-form-label">Your Name:</label>
            <input
              type="text"
              value={userData?.full_name || ''}
              className="connection-form-input"
              readOnly
            />
          </div>
          <div className="connection-form-group">
            <label className="connection-form-label">Your Age:</label>
            <input
              type="text"
              value={userData?.age || ''}
              className="connection-form-input"
              readOnly
            />
          </div>
          <div className="connection-form-group">
            <label className="connection-form-label">Your Mobile No.:</label>
            <input
              type="text"
              value={userData?.phone || ''}
              className="connection-form-input"
              readOnly
            />
          </div>

          {/* Goal selection (multiple choice) */}
          <div className="connection-form-group">
            <label className="connection-form-label">Select Your Fitness Goals (You can choose multiple):</label>
            <div className="goals-checkbox-grid">
              {availableGoals.map(goal => (
                <div key={goal.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`goal-${goal.value}`}
                    name="goal"
                    value={goal.value}
                    checked={selectedGoals.includes(goal.value)}
                    onChange={handleGoalChange}
                  />
                  <label htmlFor={`goal-${goal.value}`}>{goal.label}</label>
                </div>
              ))}
            </div>
            {selectedGoals.includes('other') && (
              <input
                type="text"
                name="otherGoal"
                value={otherGoal}
                onChange={(e) => setOtherGoal(e.target.value)}
                placeholder="Specify your 'Other' goal(s), separated by commas"
                className="connection-form-input mt-2"
                required={selectedGoals.includes('other')}
              />
            )}
          </div>

          {submitError && (
            <p className="connection-form-message connection-form-error">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="connection-form-message connection-form-success">Connection request sent successfully.</p>
          )}
          <div className="connection-form-buttons">
            <button
              type="submit"
              className="connection-form-submit-button"
              disabled={isSubmitting || loadingUser || selectedGoals.length === 0 || (selectedGoals.includes('other') && !otherGoal.trim())}
            >
              {isSubmitting ? 'Submitting...' : 'Send Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="connection-form-cancel-button"
              disabled={isSubmitting || loadingUser}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionForm;