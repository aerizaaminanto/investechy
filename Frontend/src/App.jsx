import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from "./pages/Home";
import Login from './pages/Login';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import Dashboard from './pages/Dashboard'; // Dashboard User
import AdminDashboard from './pagesadmin/AdminDashboard'; // Dashboard Admin
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
import NewProject from './pages/NewProject';
import Survey from './pages/Survey';
import Profile from './pages/profile'; 
import ProjectList from "./pages/ProjectList";
import EditData from "./pages/EditData";
import Consult from "./pages/Consult";
import Settings from "./pages/Settings";
import Report from './pages/report'; 
import ReportSummary from "./pages/ReportSummary";
import { getStoredUser } from "./services/api";

// --- IMPORT COMPONENT BARU UNTUK ADMIN ---
import ConsultantPage from './pagesadmin/consultant';
import ConsultantForm from './pagesadmin/ConsultantForm';
import AdminSettings from './pagesadmin/AdminSettings'; // <--- Tambahan Import ini
import { PopupProvider } from "./components/PopupProvider";

import './App.css';

function App() {
  const storedUser = getStoredUser();
  const userRole = storedUser?.role?.toLowerCase?.() ?? "user";

  return (
    <PopupProvider>
      <Router>
        <Routes>
          {/* Landing & Auth */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* --- DASHBOARD USER --- */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/report-list" element={<Report />} />
          <Route path="/report-list/:id" element={<ReportSummary />} />
          <Route path="/new-project" element={<NewProject />} />
          <Route path="/new-project/survey" element={<Survey />} />
          <Route path="/project-list" element={<ProjectList />} />
          <Route path="/edit-data/:id" element={<EditData />} />
          <Route path="/consult" element={<Consult />} />
          <Route path="/settings" element={<Settings />} />

          {/* --- DASHBOARD ADMIN --- */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/consultant" element={<ConsultantPage />} />
          <Route path="/admin/consultant/form" element={<ConsultantForm />} />
          <Route path="/admin/consultant/form/:id" element={<ConsultantForm />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          <Route
            path="/main"
            element={userRole === "admin" ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </PopupProvider>
  );
}

export default App;
