import React, { useState, useEffect } from 'react';
import Chat from '../components/Chat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faUser, 
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './MyChat.css';

const MyChat = () => {
  const [user, setUser] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch connected trainers
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token missing.');
        }

        const userRes = await fetch("http://localhost:5050/api/user/profile", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        setUser(userData);

        const trainersRes = await fetch("http://localhost:5050/api/user/my-trainers", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!trainersRes.ok) {
          throw new Error('No connected trainers found.');
        }
        const trainersData = await trainersRes.json();
        setTrainers(trainersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChatData();
  }, []);

  const handleSelectTrainer = (trainer) => {
    setSelectedTrainer(trainer);
  };

  if (loading) {
    return (
      <div className="my-chat-container">
        <div className="chat-status-message loading">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading chat data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-chat-container">
        <div className="chat-status-message error">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="my-chat-container">
      <div className="trainers-list-sidebar">
        <h3 className="sidebar-title">Chat with Trainers</h3>

        {/* Connected trainers list */}
        {trainers.length > 0 ? (
          <ul className="trainer-list">
            {trainers.map((trainer) => (
              <li
                key={trainer.id}
                className={`trainer-list-item ${selectedTrainer && selectedTrainer.id === trainer.id ? 'active' : ''}`}
                onClick={() => handleSelectTrainer(trainer)}
              >
                <FontAwesomeIcon icon={faUser} />
                <span className="trainer-name">{trainer.full_name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="chat-status-message no-data">
            <FontAwesomeIcon icon={faUser} size="2x" />
            <p>You are not connected to any trainers.</p>
          </div>
        )}
      </div>

      <div className="chatbox-main-content">
        {selectedTrainer && user ? (
          <Chat
            currentUser={{
              id: user.id.toString(),
              name: user.full_name,
              email: user.email,
              role: 'user'
            }}
            otherUser={{
              id: selectedTrainer.id.toString(),
              name: selectedTrainer.full_name,
              email: selectedTrainer.email,
              role: 'trainer'
            }}
          />
        ) : (
          <div className="chat-status-message info">
            <p>Please select a trainer to start a chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChat;
