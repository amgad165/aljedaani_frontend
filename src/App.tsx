import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ThemeStyles from './components/ThemeStyles';
import { injectGlobalStyles } from './utils/globalStyles';
import HomePage from './components/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DepartmentsPage from './pages/DepartmentsPage';
import DepartmentDetailsPage from './pages/DepartmentDetailsPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailsPage from './pages/DoctorDetailsPage';
import BranchesPage from './pages/BranchesPage';
import ContactPage from './pages/ContactPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import ProfilePage from './pages/ProfilePage';
// Admin Pages
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminBranches from './components/admin/AdminBranches';
import AdminDepartments from './components/admin/AdminDepartments';
import AdminDoctors from './components/admin/AdminDoctors';
import AdminTestimonials from './components/admin/AdminTestimonials';
import AdminExcellenceCenters from './components/admin/AdminExcellenceCenters';
import AdminOffers from './components/admin/AdminOffers';
import AdminDepartmentTabs from './components/admin/AdminDepartmentTabs';
import AdminOtpLogs from './components/admin/AdminOtpLogs';
import AdminPatients from './components/admin/AdminPatients';
import AdminAppointments from './components/admin/AdminAppointments';
import AdminHisPatients from './components/admin/AdminHisPatients';
import AdminHisAppointments from './components/admin/AdminHisAppointments';
import AdminHisRadiology from './components/admin/AdminHisRadiology';
import AdminHisLab from './components/admin/AdminHisLab';
import AdminHisMedical from './components/admin/AdminHisMedical';
import AdminHisConsultations from './components/admin/AdminHisConsultations';
import AdminHisShifts from './components/admin/AdminHisShifts';
import AdminHisShiftDefines from './components/admin/AdminHisShiftDefines';
import AdminHisShiftDefineDetails from './components/admin/AdminHisShiftDefineDetails';
import DoctorAvailability from './components/admin/DoctorAvailability';
import PatientDetails from './components/admin/PatientDetails';
import AdminContactSubmissions from './components/admin/AdminContactSubmissions';
import ProtectedRoute from './components/admin/ProtectedRoute';
import './App.css';

function App() {
  useEffect(() => {
    injectGlobalStyles();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ThemeStyles />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/book-appointment" element={<BookAppointmentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/departments/:id" element={<DepartmentDetailsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/branches" element={
            <ProtectedRoute>
              <AdminBranches />
            </ProtectedRoute>
          } />
          <Route path="/admin/departments" element={
            <ProtectedRoute>
              <AdminDepartments />
            </ProtectedRoute>
          } />
          <Route path="/admin/departments/:departmentId/tabs" element={
            <ProtectedRoute>
              <AdminDepartmentTabs />
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute>
              <AdminDoctors />
            </ProtectedRoute>
          } />
          <Route path="/admin/testimonials" element={
            <ProtectedRoute>
              <AdminTestimonials />
            </ProtectedRoute>
          } />
          <Route path="/admin/excellence-centers" element={
            <ProtectedRoute>
              <AdminExcellenceCenters />
            </ProtectedRoute>
          } />
          <Route path="/admin/offers" element={
            <ProtectedRoute>
              <AdminOffers />
            </ProtectedRoute>
          } />
          <Route path="/admin/otp-logs" element={
            <ProtectedRoute>
              <AdminOtpLogs />
            </ProtectedRoute>
          } />
          <Route path="/admin/patients" element={
            <ProtectedRoute>
              <AdminPatients />
            </ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute>
              <AdminAppointments />
            </ProtectedRoute>
          } />
          <Route path="/admin/his-patients" element={
            <ProtectedRoute>
              <AdminHisPatients />
            </ProtectedRoute>
          } />
          <Route path="/admin/his-appointments" element={
            <ProtectedRoute>
              <AdminHisAppointments />
            </ProtectedRoute>
          } />
          <Route path="/admin/his-radiology" element={
            <ProtectedRoute>
              <AdminHisRadiology />
            </ProtectedRoute>
          } />
          <Route path="/admin/his-lab" element={
            <ProtectedRoute>
              <AdminHisLab />
            </ProtectedRoute>
          } />
          <Route path="/admin/his-medical" element={
            <ProtectedRoute>
              <AdminHisMedical />
            </ProtectedRoute>
          } />
          <Route path="/admin/his-consultations" element={
            <ProtectedRoute>
              <AdminHisConsultations />
            </ProtectedRoute>
          } />
          <Route path="/admin/his-shifts" element={
            <ProtectedRoute>
              <AdminHisShifts />
            </ProtectedRoute>
          } />
          <Route path="/admin/his-shift-defines" element={
            <ProtectedRoute>
              <AdminHisShiftDefines />
            </ProtectedRoute>
          } />
          <Route path="/admin/his-shift-define-details" element={
            <ProtectedRoute>
              <AdminHisShiftDefineDetails />
            </ProtectedRoute>
          } />
          <Route path="/admin/contact-submissions" element={
            <ProtectedRoute>
              <AdminContactSubmissions />
            </ProtectedRoute>
          } />
          <Route path="/admin/doctor-availability" element={
            <ProtectedRoute>
              <DoctorAvailability />
            </ProtectedRoute>
          } />
          <Route path="/admin/patients/:id" element={
            <ProtectedRoute>
              <PatientDetails />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
