import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import AuthForm from "./pages/AuthForm";
import UserDashboard from "./pages/UserDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import Home from "./pages/Home";
import AddProgress from "./pages/AddProgress";
import ProgressList from "./pages/ProgressList";
import UserProfile from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
import AppHeader from "./components/AppHeader";
import TrainersList from './pages/TrainersList';
import ClientPlans from './pages/ClientPlans'; // Import the new ClientPlans component
import MyChat from "./pages/MyChat"; // Make sure you import the component

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <AuthForm isLogin={isLogin} />
    </div>
  );
}

// Layout component for authenticated routes (includes header)
function AuthenticatedLayout() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<AuthenticatedLayout />}>
          <Route path="/user-dashboard/" element={<UserDashboard />}>
            {/* Set a default nested route when navigating to /user-dashboard */}
            <Route index element={<Navigate to="progress" replace />} />
            <Route path="progress" element={<ProgressList />} />
            <Route path="add" element={<AddProgress />} />
            <Route path="trainers" element={<TrainersList />} />
            {/* New Route for viewing client plans */}
            <Route path="my-plans" element={<ClientPlans />} />
             <Route path="my-chat" element={<MyChat />} /> {/* <-- ADD THIS LINE */}
          </Route>

          {/* These routes are not nested under UserDashboard's Outlet */}
          <Route path="/user-dashboard/view-profile" element={<UserProfile />} />
          <Route path="/user-dashboard/edit-profile" element={<EditProfile />} />
          <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}






