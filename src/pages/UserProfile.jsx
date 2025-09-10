import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css"; // Import unified CSS

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          navigate("/auth");
          return;
        }

        const response = await axios.get("http://localhost:5050/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(err.response?.data?.error || "Failed to load profile data.");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/auth");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // --- Loading ---
  if (loading) {
    return (
      <div className="loading-message">
        <p className="message-line1">Loading your profile...</p>
        <p className="message-line2">Please wait while we fetch your details.</p>
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="error-message">
        <p className="message-line1">Error: {error}</p>
        <p className="message-line2">Please log in again to continue.</p>
        <button
          onClick={() => navigate("/auth")}
          className="retry-button"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // --- No Data ---
  if (!user) {
    return (
      <div className="no-data-message">
        <p className="message-line1">No user data available.</p>
        <p className="message-line2">Please log in to view your profile.</p>
      </div>
    );
  }

  // --- Profile ---
  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h2 className="profile-name">
          {user.full_name || "User Name"}
        </h2>
        <p className="profile-email">{user.email}</p>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <p className="info-item-label">Role</p>
          <p className="info-item-value">{user.role}</p>
        </div>
        
        <div className="info-item">
          <p className="info-item-label">Age</p>
          <p className="info-item-value">{user.age}</p>
        </div>
           <div className="info-item">
          <p className="info-item-label">Phone</p>
          <p className="info-item-value">{user.phone}</p>
        </div>
        <div className="info-item">
          <p className="info-item-label">Gender</p>
          <p className="info-item-value">{user.gender}</p>
        </div>
      </div>

      <div className="edit-profile-button-container">
        <button
          onClick={() => navigate("/user-dashboard/edit-profile")}
          className="edit-profile-button"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
