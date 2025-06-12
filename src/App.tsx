import "./App.css";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Projects } from "./pages/DashboardPage/Projects";
import { Navbar } from "./components/Navbar/Navbar";
import { Folder, List, Settings } from "lucide-react";
import { ProjectDetailPage } from "./pages/ProjectDetailPage/ProjectDetailPage";
import { TaskDetailPage } from "./pages/TaskDetailPage/TaskDetailPage";
import { SettingsPage } from "./pages/SettingsPage/SettingsPage";
import { Tasks } from "./pages/DashboardPage/Tasks";
import { Toaster } from "react-hot-toast";
import { ProfilePage } from "./pages/ProfilePage/ProfilePage";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ["/login"];

  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");
  const currentUserRole = localStorage.getItem("userRole");

  const menuItems = [
    {
      name: "Projects",
      path: "/projects",
      icon: <Folder size={20} />,
      display: true,
    },
    { name: "Tasks", path: "/tasks", icon: <List size={20} />, display: true },
    {
      name: "User Settings",
      path: "/settings",
      icon: <Settings size={20} />,
      display: currentUserRole === "ADMIN",
    },
  ];

  const userInfo = {
    path: `/profile/${userId}`,
    userName: userName,
    userId: userId,
    name: "Profile",
  };

  return (
    <div className="flex h-screen">
      {!hideNavbarRoutes.includes(location.pathname) && (
        <Navbar items={menuItems} userInfo={userInfo} />
      )}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            width: "400px",
            height: "80px",
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/projectDetail/:id" element={<ProjectDetailPage />} />
        <Route path="/taskDetail/:id" element={<TaskDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="*" element={<Navigate to="/login" />} />{" "}
        {/* Redirect unknown routes to login */}
      </Routes>
    </div>
  );
}

export default App;
