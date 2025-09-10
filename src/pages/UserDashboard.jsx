import { NavLink, Outlet } from "react-router-dom";
import './UserDashboard.css';

export default function UserDashboard() {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <nav className="header-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink
                to="progress"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                View Progress
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="add"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Add Progress
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="trainers"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                View Trainers
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="my-plans"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                View My Plans
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="my-chat"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Chat With Trainers
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main className="dashboard-main-content">
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}