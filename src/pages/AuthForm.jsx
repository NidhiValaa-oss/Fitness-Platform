import { useState } from "react";
import axios from "axios";
import AppHeader from "../components/AppHeader";
import "./AuthForm.css";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [error, setError] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const handleToggleAuthMode = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
    setError({});
    setSuccessMsg("");
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setAge("");
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!email.trim()) errors.email = "Email is required.";
    else if (!emailRegex.test(email)) errors.email = "Enter a valid email address.";

    if (!password.trim()) errors.password = "Password is required.";
    else if (!isLogin) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        errors.password =
          "Password must be 8+ characters with uppercase, lowercase, number, and special character.";
      }
    }

    if (!isLogin) {
      if (!fullName.trim()) errors.fullName = "Full name is required.";
      if (!phone.trim()) errors.phone = "Phone number is required.";
      else if (!phoneRegex.test(phone)) errors.phone = "Enter a valid 10-digit phone number.";
      if (!age.trim()) errors.age = "Age is required.";
      else if (isNaN(age) || age < 10 || age > 120) errors.age = "Enter a valid age.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccessMsg("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }

    const endpoint = isLogin ? "/api/login" : "/api/signup";
    const payload = isLogin
      ? { email, password }
      : {
          email,
          password,
          role,
          fullName,
          phone,
          age,
          gender,
        };

    try {
      const res = await axios.post(`http://localhost:5050${endpoint}`, payload);

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        setSuccessMsg("Login successful.");
        setTimeout(() => {
          window.location.href =
            res.data.role === "trainer" ? "/trainer-dashboard" : "/user-dashboard";
        }, 1500);
      } else {
        setSuccessMsg("Signup successful.");
        setEmail("");
        setPassword("");
        setRole("user");
        setFullName("");
        setPhone("");
        setAge("");
        setGender("male");
        setIsLogin(true);
      }
    } catch (err) {
      const backendError = err.response?.data?.error || "Something went wrong.";
      setError((prev) => {
        if (backendError.toLowerCase().includes("password")) {
          return { ...prev, password: backendError };
        } else if (
          backendError.toLowerCase().includes("user") ||
          backendError.toLowerCase().includes("email")
        ) {
          return { ...prev, email: backendError };
        } else {
          return { ...prev, global: backendError };
        }
      });
    }
  };

  return (
    <div className="auth-page-container">
      <AppHeader showAuthButtons={true} isLoginScreen={isLogin} onToggleAuthMode={handleToggleAuthMode} />
      <div className="auth-wrapper">
        <div className="auth-container">
          <h2>{isLogin ? "Login" : "Sign Up"}</h2>
          <form onSubmit={handleSubmit}>
            {error.global && <p className="error-text center">{error.global}</p>}
            {successMsg && <p className="success-text center">{successMsg}</p>}

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Email"
                  className={`form-input ${error.email ? "error-border" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error.email && <p className="error-text">{error.email}</p>}
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="Password"
                  className={`form-input ${error.password ? "error-border" : ""}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error.password && <p className="error-text">{error.password}</p>}
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={`form-input ${error.fullName ? "error-border" : ""}`}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  {error.fullName && <p className="error-text">{error.fullName}</p>}
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Phone Number"
                      className={`form-input ${error.phone ? "error-border" : ""}`}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  {error.phone && <p className="error-text">{error.phone}</p>}
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="number"
                      placeholder="Age"
                      className={`form-input ${error.age ? "error-border" : ""}`}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  {error.age && <p className="error-text">{error.age}</p>}
                </div>

                <div className="form-group">
                  <div className="input-wrapper radio-group-wrapper">
                    <div className="radio-options">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={gender === "male"}
                          onChange={(e) => setGender(e.target.value)}
                        />
                        Male
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={gender === "female"}
                          onChange={(e) => setGender(e.target.value)}
                        />
                        Female
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="other"
                          checked={gender === "other"}
                          onChange={(e) => setGender(e.target.value)}
                        />
                        Other
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper radio-group-wrapper">
                    <div className="radio-options">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="role"
                          value="user"
                          checked={role === "user"}
                          onChange={(e) => setRole(e.target.value)}
                        />
                        User
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="role"
                          value="trainer"
                          checked={role === "trainer"}
                          onChange={(e) => setRole(e.target.value)}
                        />
                        Trainer
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? "Login" : "Sign Up"}
            </button>

            <p className="switch-form-text">
              {isLogin ? "New user?" : "Already have an account?"} <br />
              <span
                className="form-link"
                onClick={() => {
                  handleToggleAuthMode(); // Use the dedicated function
                }}
              >
                {isLogin ? "Sign up" : "Login"}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}






