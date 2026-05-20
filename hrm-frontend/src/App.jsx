import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const Login                = lazy(() => import("./auth/Login"));
const Register             = lazy(() => import("./auth/Register"));
const Holidays             = lazy(() => import("./common_moduls/HolidayPages"));
const AdminDashboardPage   = lazy(() => import("./admin/dashboard/AdminDashboardPage"));
const EmployeeDashboard    = lazy(() => import("./employee/dashboard/EmployeeDashboardPage"));
const AdminAttendancePage  = lazy(() => import("./admin/attendence/AdminAttendancePage"));
const AddEmployee          = lazy(() => import("./admin/employees/AddEmployeePage"));
const DepartmentsPage      = lazy(() => import("./admin/department/DepartmentsPage"));
const Leaves               = lazy(() => import("./common_moduls/leaves/LeavesPage"));
const Payroll              = lazy(() => import("./admin/payroll/payrollPage"));
const Designations         = lazy(() => import("../src/Designations"));
const AdminSupportPage     = lazy(() => import("./admin/supports/AdminSupportPage"));
const AppreciationPage     = lazy(() => import("./admin/appreciation/AppreciationPage"));
const LetterPage           = lazy(() => import("./admin/letter/LetterPage"));
const PolicyPage           = lazy(() => import("./admin/policy/PolicyPage"));
const Profile              = lazy(() => import("./employee/profile/Profile"));
const MarkAttendance       = lazy(() => import("./employee/attendance/MarkAttendancePage"));
const Appreciations        = lazy(() => import("./employee/appreciations/EmployeeAppreciations"));
const EmployeeLetters      = lazy(() => import("./employee/employeeLetters/EmployeeLetters"));
const EmployeePolicies     = lazy(() => import("./employee/employeePolicies/EmployeePolicies"));
const SuperadminDashboard  = lazy(() => import("./superadmin/saas/SuperadminDashboardPage"));
const AddSuperadminPage    = lazy(() => import("./superadmin/saas/AddSuperadminPage"));
const TransactionsPage     = lazy(() => import("./superadmin/TransactionsPage"));
const PricingPage          = lazy(() => import("./superadmin/saas/PricingPage"));
const CompaniesPage        = lazy(() => import("./superadmin/CompaniesPage"));
const WebsiteSettingsPage  = lazy(() => import("./superadmin/saas/WebsiteSettingsPage"));
const Home                 = lazy(() => import("./pages/Home"));
const Features             = lazy(() => import("./pages/Features"));
const Pricing              = lazy(() => import("./pages/Pricing"));
const Contact              = lazy(() => import("./pages/Contact"));

const PageLoader = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#F9FAFB",
    fontFamily: "'DM Sans', sans-serif",
  }}>
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: 40,
        height: 40,
        border: "3px solid #EEF2FF",
        borderTop: "3px solid #4F46E5",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        margin: "0 auto 16px",
      }} />
      <p style={{ fontSize: "0.875rem", color: "#9CA3AF", margin: 0 }}>Loading...</p>
    </div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallback = role === "employee" ? "/employee-dashboard" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
};

const HomeRedirect = () => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token) return <Home />;
  if (role === "employee")    return <Navigate to="/employee-dashboard" replace />;
  if (role === "company_admin") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/superadmin-dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing"  element={<Pricing />} />
          <Route path="/contact"  element={<Contact />} />

          <Route path="/employee-dashboard" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/admin-attendance" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AdminAttendancePage />
            </ProtectedRoute>
          } />

          <Route path="/add-employee" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AddEmployee />
            </ProtectedRoute>
          } />

          <Route path="/departments" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <DepartmentsPage />
            </ProtectedRoute>
          } />

          <Route path="/holidays" element={
            <ProtectedRoute allowedRoles={["employee", "company_admin"]}>
              <Holidays />
            </ProtectedRoute>
          } />

          <Route path="/leaves" element={
            <ProtectedRoute allowedRoles={["employee", "company_admin"]}>
              <Leaves />
            </ProtectedRoute>
          } />

          <Route path="/payroll" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <Payroll />
            </ProtectedRoute>
          } />

          <Route path="/designations" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <Designations />
            </ProtectedRoute>
          } />

          <Route path="/support" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AdminSupportPage />
            </ProtectedRoute>
          } />

          <Route path="/appreciation" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <AppreciationPage />
            </ProtectedRoute>
          } />

          <Route path="/letter" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <LetterPage />
            </ProtectedRoute>
          } />

          <Route path="/policy" element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <PolicyPage />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <MarkAttendance />
            </ProtectedRoute>
          } />

          <Route path="/employeePolicies" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeePolicies />
            </ProtectedRoute>
          } />

          <Route path="/employeeLetters" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeLetters />
            </ProtectedRoute>
          } />

          <Route path="/appreciations" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Appreciations />
            </ProtectedRoute>
          } />

          <Route path="/superadmin-dashboard" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <SuperadminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/superadmin/website-settings" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <WebsiteSettingsPage />
            </ProtectedRoute>
          } />

          <Route path="/superadmin/companiespage" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <CompaniesPage />
            </ProtectedRoute>
          } />

          <Route path="/superadmin/pricing" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <PricingPage />
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <TransactionsPage />
            </ProtectedRoute>
          } />

          <Route path="/add-superadmin" element={
            <ProtectedRoute allowedRoles={["super_admin", "software_owner"]}>
              <AddSuperadminPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;