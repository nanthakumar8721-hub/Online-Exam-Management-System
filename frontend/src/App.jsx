import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import OrganizationRegister from './pages/OrganizationRegister';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import QuestionBank from './pages/admin/Questions';
import UserManagement from './pages/admin/UserManagement';
import AdminOrganizations from './pages/admin/Organizations';

// Student
import StudentDashboard from './pages/student/Dashboard';
import StudentExams from './pages/student/Exams';
import StudentResults from './pages/student/Results';
import ExamWindow from './pages/student/ExamWindow';

// Staff
import StaffDashboard from './pages/invigilator/Dashboard';
import Monitor from './pages/invigilator/Monitor';
import StaffQuestions from './pages/invigilator/StaffQuestions';
import StaffSchedules from './pages/invigilator/Schedules';

// Org Admin
import OrgAdminDashboard from './pages/org_admin/Dashboard';
import OrgMembers from './pages/org_admin/Members';
import OrgAdminSchedules from './pages/org_admin/Schedules';
import ExamQuestions from './pages/org_admin/ExamQuestions';

// Shared
import Settings from './pages/Settings';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'staff') return <Navigate to="/staff" replace />;
  if (user.role === 'org_admin') return <Navigate to="/org" replace />;
  return <Navigate to="/student" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-organization" element={<OrganizationRegister />} />

          {/* Specialized Exam Mode (No Sidebar) */}
          <Route path="/exam/:id" element={<ExamWindow />} />

          <Route path="/" element={<Landing />} />

          <Route element={<Layout />}>

            {/* Admin Routes */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/questions" element={<QuestionBank />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/organizations" element={<AdminOrganizations />} />

            {/* Student Routes */}
            <Route path="student" element={<StudentDashboard />} />
            <Route path="student/exams" element={<StudentExams />} />
            <Route path="student/results" element={<StudentResults />} />

            {/* Staff Routes */}
            <Route path="staff" element={<StaffDashboard />} />
            <Route path="staff/questions" element={<StaffQuestions />} />
            <Route path="staff/monitor" element={<Monitor />} />
            <Route path="staff/schedules" element={<StaffSchedules />} />
            <Route path="staff/exams/:id/questions" element={<ExamQuestions />} />

            {/* Org Admin Routes */}
            <Route path="org" element={<OrgAdminDashboard />} />
            <Route path="org/members" element={<OrgMembers />} />
            <Route path="org/schedules" element={<OrgAdminSchedules />} />
            <Route path="org/exams/:id/questions" element={<ExamQuestions />} />

            {/* Common Routes */}
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
