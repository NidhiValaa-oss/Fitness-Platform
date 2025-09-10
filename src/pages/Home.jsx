import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader"; // Adjust path if AppHeader is elsewhere
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Add the AppHeader for the Home page */}
      <AppHeader showAuthButtons={true} isLoginScreen={false} /> {/* isLoginScreen is false for Home as it always shows "Login" */}

      {/* Rest of your Home page content */}
      <div className="home-wrapper">
        {/* The <nav className="main-nav"> block and its contents are REMOVED here */}

        {/* Main Section with Background Image and Overlay Text */}
        <div className="main-section">
          <img
            src="/bimage.png"
            alt="Background Image"
            className="background-image"
          />

          <div className="overlay-text">
            <p className="overlay-sub-h">Join in</p>
            <h1 className="overlay-h">STRONGER</h1>
            <h1 className="overlay-h1">STARTS HERE</h1>
            <p className="overlay-p">Be part of a fitness journey.</p>
            <p className="overlay-sub-p">
              From personalized coaching to real-time progress tracking, we give you the tools to train smarter, stay consistent, and get stronger every day.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1 */}
      <div className="section-container">
        <div className="section-text">
          <h2>
            Log Workouts Effortlessly. <br />
            Visualize Progress Clearly. <br />
            Get Personalized Fitness Plans. <br />
          </h2>
          <p>
            Crush your goals with smart workout tracking, tailored plans, and routines that keep you inspired every step of the way.
          </p>
        </div>
        <div className="section-image">
          <img
            src="./Picture1.png"
            alt="screenshot of application"
          />
        </div>
      </div>

      {/* Section 2 */}
      <div className="section-container">
        <div className="section-image">
          <img
            src="./Picture2.png"
            alt="screenshot of application"
          />
        </div>
        <div className="section-text">
          <h2>
            Train Smarter. <br />
            Manage Better. <br />
            Grow with Confidence. <br />
          </h2>
          <p>
            Focus on what matters — coaching and results. We handle the rest with smart tools that simplify client management, scheduling, and progress tracking.
          </p>
        </div>
      </div>
    </div>
  );
}


















