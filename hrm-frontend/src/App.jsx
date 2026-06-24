import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { useGlobalNotification } from './hook/useGlobalNotification';
import CustomToast from './components/CustomToast';

const Login                = lazy(() => import("./auth/Login"));
const Register             = lazy(() => import("./auth/Register"));
const Holidays             = lazy(() => import("./common_moduls/HolidayPages"));
const AdminDashboardPage   = lazy(() => import("./admin/dashboard/AdminDashboardPage"));
const EmployeeDashboard    = lazy(() => import("./employee/dashboard/EmployeeDashboardPage"));
const AdminAttendancePage  = lazy(() => import("./admin/attendence/AdminAttendancePage"));
const AddEmployee          = lazy(() => import("./admin/employees/AddEmployeePage"));
const UpdateEmployee       = lazy(() => import("./admin/employees/UpdateEmployee"));
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
const AssignTask           = lazy(() => import("./employee/task/AssignTask"));
const MyTasks              = lazy(() => import("./employee/mytask/MyTasks"));
const AdvanceRequests      = lazy(() => import("./admin/AdvanceRequests/AdvanceRequests"));
const IncrementPromotion   = lazy(() => import("./admin/IncrementPromotion/IncrementPromotion"));
const SalaryAdvance        = lazy(() => import("./employee/prepayment/SalaryAdvance"));
const CareerHistory        = lazy(() => import("./employee/increment/CareerHistory"));
const EmployeePayslips     = lazy(() => import("./employee/employeePayslip/Payslips"));
const AdminWarnings        = lazy(() => import("./admin/employeeOffboardings/Adminwarnings"));
const AdminResignations    = lazy(() => import("./admin/employeeOffboardings/Adminresignations"));
const AdminComplaints      = lazy(() => import("./admin/employeeOffboardings/Admincomplaints"));
const EmployeeWarnings     = lazy(() => import("./employee/offboarding/Employeewarnings"));
const EmployeeResignation  = lazy(() => import("./employee/offboarding/Employeeresignation"));
const EmployeeComplaints   = lazy(() => import("./employee/offboarding/Employeecomplaints"));
const ChatPage             = lazy(() => import("./common_moduls/ChatPage"));
const CalendarPage         = lazy(() => import("./admin/calendar/CalendarPage"));
const MeetingsPage         = lazy(() => import("./admin/calendar/MeetingsPage"));
const EmployeeCalendar     = lazy(() => import("./employee/calendar/CalendarPage"));
const EmployeeMeetings     = lazy(() => import("./employee/calendar/MeetingsPage"));
const MeetingRoom          = lazy(() => import("./admin/meetings/MeetingRoom"));

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
  if (role === "employee")      return <Navigate to="/employee-dashboard" replace />;
  if (role === "manager") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/superadmin-dashboard" replace />;
};

function NotificationWrapper({ children }) {
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId") || localStorage.getItem("user_id") || localStorage.getItem("employeeId");
    if (userId) {
      setCurrentUserId(String(userId).trim().replace(/^["']|["']$/g, ""));
    }
  }, []);

  const { notifications, removeToastNotification } = useGlobalNotification(currentUserId);

  return (
    <>
      {children}
      {notifications.map((notification) => (
        <CustomToast 
          key={notification.id}
          notification={notification} 
          onClose={() => removeToastNotification(notification.id)} 
        />
      ))}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <NotificationWrapper>
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
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />

              <Route path="/calendar" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <CalendarPage />
                </ProtectedRoute>
              } />

              <Route path="/meetings" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <MeetingsPage />
                </ProtectedRoute>
              } />

              <Route path="/meeting-room/:meetingCode" element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}>
                  <MeetingRoom />
                </ProtectedRoute>
              } />

              <Route path="/employee/calendar" element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeeCalendar />
                </ProtectedRoute>
              } />

              <Route path="/employee/meetings" element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeeMeetings />
                </ProtectedRoute>
              } />

              <Route path="/admin-attendance" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AdminAttendancePage />
                </ProtectedRoute>
              } />

              <Route path="/add-employee" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AddEmployee />
                </ProtectedRoute>
              } />

              <Route path="/update-employee" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <UpdateEmployee />
                </ProtectedRoute>
              } />

              <Route path="/departments" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <DepartmentsPage />
                </ProtectedRoute>
              } />

              <Route path="/holidays" element={
                <ProtectedRoute allowedRoles={["employee", "manager"]}>
                  <Holidays />
                </ProtectedRoute>
              } />

              <Route path="/leaves" element={
                <ProtectedRoute allowedRoles={["employee", "manager"]}>
                  <Leaves />
                </ProtectedRoute>
              } />

              <Route path="/chat" element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}>
                  <ChatPage />
                </ProtectedRoute>
              } />

              <Route path="/payroll" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <Payroll />
                </ProtectedRoute>
              } />

              <Route path="/designations" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <Designations />
                </ProtectedRoute>
              } />

              <Route path="/support" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AdminSupportPage />
                </ProtectedRoute>
              } />

              <Route path="/appreciation" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AppreciationPage />
                </ProtectedRoute>
              } />

              <Route path="/letter" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <LetterPage />
                </ProtectedRoute>
              } />

              <Route path="/policy" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <PolicyPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/advance-requests" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AdvanceRequests />
                </ProtectedRoute>
              } />

              <Route path="/admin/increment-promotion" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <IncrementPromotion />
                </ProtectedRoute>
              } />

              <Route path="/admin/warnings" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AdminWarnings />
                </ProtectedRoute>
              } />

              <Route path="/admin/resignations" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AdminResignations />
                </ProtectedRoute>
              } />

              <Route path="/admin/complaints" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AdminComplaints />
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

              <Route path="/assign-task" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AssignTask />
                </ProtectedRoute>
              } />

              <Route path="/employee/salary-advance" element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <SalaryAdvance />
                </ProtectedRoute>
              } />

              <Route path="/employee/career-history" element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <CareerHistory />
                </ProtectedRoute>
              } />

              <Route path="/employee/payslips" element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeePayslips />
                </ProtectedRoute>
              } />

              <Route path="/employee/warnings" element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeeWarnings />
                </ProtectedRoute>
              } />

              <Route path="/employee/resignation" element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeeResignation />
                </ProtectedRoute>
              } />

              <Route path="/employee/complaints" element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeeComplaints />
                </ProtectedRoute>
              } />

              <Route path="/my-tasks" element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <MyTasks />
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
          </NotificationWrapper>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;