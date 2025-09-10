import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './AppHeader.css'; // Import the new CSS file

// Custom Modal Component
const ConfirmationModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="modal-button confirm">
            Confirm
          </button>
          <button onClick={onCancel} className="modal-button cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AppHeader({ showAuthButtons = false, isLoginScreen = false, onToggleAuthMode }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [role, setRole] = useState("user"); // default role
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user's full name on component mount
  useEffect(() => {
    if (!showAuthButtons) {
      const fetchUserName = async () => {
        const token = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");
        if (storedRole) setRole(storedRole);

        if (token) {
          try {
            const response = await axios.get("http://localhost:5050/api/user/profile", {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUserName(response.data.full_name || "User");
          } catch (error) {
            console.error("Failed to fetch user name for header:", error);
            if (error.response?.status === 401 || error.response?.status === 404) {
              handleLogout();
            }
            setUserName("User");
          }
        } else {
          setUserName("User");
        }
      };
      fetchUserName();
    }
  }, [navigate, showAuthButtons]);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/auth");
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteModal(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("You are not logged in.");
        handleLogout();
        return;
      }
      await axios.delete("http://localhost:5050/api/user/account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Account deleted successfully!");
      handleLogout();
    } catch (error) {
      console.error("Error deleting account:", error);
      console.error(error.response?.data?.error || "Failed to delete account. Please try again.");
    }
  };

  const cancelDeleteAccount = () => {
    setShowDeleteModal(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Role-based paths
  const dashboardPath = role === "trainer" ? "/trainer-dashboard" : "/user-dashboard";
  const viewProfilePath = role === "trainer" ? "/trainer-dashboard/view-profile" : "/user-dashboard/view-profile";
  const editProfilePath = role === "trainer" ? "/trainer-dashboard/edit-profile" : "/user-dashboard/edit-profile";

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Logo and App Name */}
        <div className="logo-link">
          <img
            src="/logo.jpeg"
            alt="TrainTrackr Logo"
            className="logo-image"
          />
          <span className="app-name">TrainTrackr</span>
        </div>

        {/* Conditional rendering for buttons/profile */}
        {showAuthButtons ? (
          <button
            onClick={() => onToggleAuthMode ? onToggleAuthMode() : navigate("/auth")}
            className="nav-login-btn"
          >
            {isLoginScreen ? "Sign Up" : "Login"}
          </button>
        ) : (
          <div className="dropdown-container" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="dropdown-button"
              aria-haspopup="true"
              aria-expanded={dropdownOpen ? "true" : "false"}
            >
              <span className="user-name">{userName}</span>
              <div className="initial-circle">
                {userName.charAt(0).toUpperCase()}
              </div>
              <i className={`fas fa-chevron-down chevron-icon ${dropdownOpen ? 'rotate' : ''}`}></i>
            </button>

            {dropdownOpen && (
              <div
                className="dropdown-menu"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                {/* Dashboard link based on role */}
                <Link
                  to={dashboardPath}
                  onClick={() => setDropdownOpen(false)}
                  className="dropdown-item dashboard-link"
                  role="menuitem"
                >
                  <i className="fas fa-tachometer-alt item-icon"></i> Go to Dashboard
                </Link>

                <Link
                  to={viewProfilePath}
                  onClick={() => setDropdownOpen(false)}
                  className="dropdown-item view-profile"
                  role="menuitem"
                >
                  <i className="fas fa-user-circle item-icon"></i> View Profile
                </Link>
                <Link
                  to={editProfilePath}
                  onClick={() => setDropdownOpen(false)}
                  className="dropdown-item edit-profile"
                  role="menuitem"
                >
                  <i className="fas fa-user-edit item-icon"></i> Edit Profile
                </Link>
                <button
                  onClick={handleDeleteAccount}
                  className="dropdown-item delete-account-btn"
                  role="menuitem"
                >
                  <i className="fas fa-trash-alt item-icon"></i> Delete Account
                </button>
                <hr className="dropdown-divider" />
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout-btn"
                  role="menuitem"
                >
                  <i className="fas fa-sign-out-alt item-icon"></i> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        title="Confirm Account Deletion"
        message="Are you sure you want to delete your account? This action cannot be undone."
        onConfirm={confirmDeleteAccount}
        onCancel={cancelDeleteAccount}
      />
    </header>
  );
}


