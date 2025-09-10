// src/pages/EditProfile.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css"; // Import your custom CSS file

export default function EditProfile() {
  const [user, setUser] = useState({
    fullName: "",
    phone: "",
    age: "",
    gender: "",
  });
  const [originalUser, setOriginalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const fetchedUserData = {
          fullName: response.data.full_name || "",
          phone: response.data.phone || "",
          age: response.data.age || "",
          gender: response.data.gender || "male",
        };
        setUser(fetchedUserData);
        setOriginalUser(fetchedUserData);
      } catch (err) {
        console.error("Failed to fetch user profile for editing.", err);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!user.fullName || !user.phone || !user.age || !user.gender) {
      setError("All fields are required.");
      return;
    }
    if (isNaN(user.age) || user.age < 10 || user.age > 120) {
      setError("Please enter a valid age (10-120).");
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(user.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    const hasChanges = Object.keys(user).some(key => {
      return originalUser && user[key] !== originalUser[key];
    });

    if (!hasChanges) {
      setSuccessMessage("No changes detected.");
      return; 
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5050/api/user/profile", user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Profile updated successfully.");
      setOriginalUser(user);
      setTimeout(() => navigate("/user-dashboard/view-profile"), 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.error || "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading profile data for editing.</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <h2 className="edit-profile-title">Edit Your Profile</h2>

      {error && (
        <div className="alert-message alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="alert-message alert-success" role="alert">
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={user.fullName}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={user.phone}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age" className="form-label">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={user.age}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        
        <div className="submit-button-container">
          <button
            type="submit"
            className="submit-button"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}