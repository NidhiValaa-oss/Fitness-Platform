// src/pages/TrainersList.jsx
import React, { useEffect, useState } from 'react';
import ConnectionForm from '../pages/ConnectionForm';
import './TrainersList.css';

const TrainersList = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/trainers");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTrainers(data);
      } catch (err) {
        console.error("Error fetching trainers:", err);
        setError("Failed to load trainers.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const handleConnectClick = (trainer) => {
    setSelectedTrainer(trainer);
    setShowConnectionForm(true);
  };

  const handleCloseForm = () => {
    setShowConnectionForm(false);
    setSelectedTrainer(null);
  };

  const handleFormSubmit = () => {
    console.log("Connection form submitted!");
    handleCloseForm();
  };

  // --- Messages (no heading when shown) ---
  if (loading) {
    return (
      <div className="info-message loading">
        <p className="message-line1">Loading trainers...</p>
        <p className="message-line2">Please wait while we fetch the latest data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="info-message error">
        <p className="message-line1">Error: {error}</p>
        <p className="message-line2">Please ensure the backend server is running and accessible.</p>
      </div>
    );
  }

  if (trainers.length === 0) {
    return (
      <div className="info-message no-data">
        <p className="message-line1">No trainers found at the moment.</p>
        <p className="message-line2">Check back later or contact support if you believe this is an error.</p>
      </div>
    );
  }

  // --- Main list (with heading) ---
  return (
    <div className="trainers-list-container">
      <h2 className="trainers-list-title">Available Trainers</h2>
      <div className="trainers-grid">
        {trainers.map((trainer) => (
          <div key={trainer.id} className="trainer-card">
            <h3 className="trainer-card-title">{trainer.full_name}</h3>
            <p><strong>Email:</strong> {trainer.email}</p>
            <p><strong>Phone:</strong> {trainer.phone}</p>
            <p><strong>Age:</strong> {trainer.age}</p>
            <p><strong>Gender:</strong> {trainer.gender}</p>
            <div className="text-center">
              <button
                onClick={() => handleConnectClick(trainer)}
                className="connect-button"
              >
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>

      {showConnectionForm && selectedTrainer && (
        <ConnectionForm
          trainerId={selectedTrainer.id}
          trainerName={selectedTrainer.full_name}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default TrainersList;

