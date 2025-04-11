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
import { FileText, Folder, Home, List, Settings, User } from "lucide-react";
import { ProjectDetailPage } from "./pages/ProjectDetailPage/ProjectDetailPage";
import { TaskDetailPage } from "./pages/TaskDetailPage/TaskDetailPage";
import { SettingsPage } from "./pages/SettingsPage/SettingsPage";

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
  const menuItems = [
    { name: "Projects", path: "/projects", icon: <Folder size={20} /> },
    { name: "Tasks", path: "/tasks", icon: <List size={20} /> },
    { name: "Reports", path: "/reports", icon: <FileText size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
    { name: "Admin Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen">
      {!hideNavbarRoutes.includes(location.pathname) && (
        <Navbar items={menuItems} />
      )}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projectDetail/:id" element={<ProjectDetailPage />} />
          <Route path="/taskDetail/:id" element={<TaskDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/login" />} />{" "}
          {/* Redirect unknown routes to login */}
        </Routes>
      </div>
    </div>
  );
}

export default App;
