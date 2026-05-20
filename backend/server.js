const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const connectDB = require("./config/db"); 
connectDB(); 

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const authRoutes = require("./modules/auth/authrouting");
const dashboardRoutes = require("./modules/dashboard/dashboardRoutes");
const employeeRoutes = require("./modules/employees/employeeRoutes");
const attendanceRoutes = require("./modules/attendance/attendanceRoutes");
const holidayRoutes = require("./modules/holidays/holidaysRoutes");
const leaveRoutes = require("./modules/leaves/leavesRoute");
const payrollRoutes = require("./modules/payroll/payrollRoutes");
const saasRoutes = require("./modules/saas/saasRoutes");
const departmentRoutes = require("./modules/departments/departmentRoutes");
const designationRoutes = require("./routes/designationRoutes");
const planRoutes = require("./modules/saas/planRoutes");
const attachmentRoutes = require("./modules/support/attachmentRoutes");
const adminProfileRoutes = require("./routes/AdminProfile");
const superAdminProfileRoutes = require("./routes/superAdminProfileRoutes");
const appreciationRoutes = require("./routes/appreciationRoutes");
const letterRoutes = require("./routes/letterRoutes");
const contactRoutes = require("./modules/contact/contactRoutes");
const trialRoutes = require("./modules/saas/TrialRoutes");
const policyRoutes = require("./modules/policies/policiesRoutes");
const supportRoutes = require("./modules/support/supportTicketRoutes");
const notificationRoutes = require("./modules/notifications/notifactionRoutes"); // check spelling file
const messageActionRoutes = require("./modules/support/messageActionRoute");
const websiteSettingsRoutes = require("./modules/websiteSettings/websiteSettingRoutes");
const transactionRoutes = require("./modules/transactions/transctionsRoutes");
const EmployeeRoutes     = require("./routes/employeeProfileRoutes");
const safeUse = (path, route, name) => {
  if (!route || typeof route !== "function") {
    console.error(`❌ ${name} is NOT a valid Express router`);
    return;
  }
  console.log(`✅ ${name} loaded`);
  app.use(path, route);
};
safeUse("/api/auth", authRoutes, "authRoutes");
safeUse("/api/dashboard", dashboardRoutes, "dashboardRoutes");

safeUse("/api/employees", employeeRoutes, "employeeRoutes");
safeUse("/api/attendance", attendanceRoutes, "attendanceRoutes");
safeUse("/api/holidays", holidayRoutes, "holidayRoutes");
safeUse("/api/leaves", leaveRoutes, "leaveRoutes");
safeUse("/api/payroll", payrollRoutes, "payrollRoutes");

safeUse("/api/departments", departmentRoutes, "departmentRoutes");
safeUse("/api/designations", designationRoutes, "designationRoutes");

safeUse("/api/saas", saasRoutes, "saasRoutes");
safeUse("/api/saas", trialRoutes, "trialRoutes");
safeUse("/api/plans", planRoutes, "planRoutes");

safeUse("/api/support", supportRoutes, "supportRoutes");
safeUse("/api/support/message-actions", messageActionRoutes, "messageActionRoutes");

safeUse("/api/notifications", notificationRoutes, "notificationRoutes");
safeUse("/api/website-settings", websiteSettingsRoutes, "websiteSettingsRoutes");

safeUse("/api/attachments", attachmentRoutes, "attachmentRoutes");
safeUse("/api/transactions", transactionRoutes, "transactionRoutes");

safeUse("/api/admin", adminProfileRoutes, "adminProfileRoutes");
safeUse("/api/super-admin", superAdminProfileRoutes, "superAdminProfileRoutes");

safeUse("/api/appreciations", appreciationRoutes, "appreciationRoutes");
safeUse("/api/letters", letterRoutes, "letterRoutes");

safeUse("/api/contact", contactRoutes, "contactRoutes");
safeUse("/api/policies", policyRoutes, "policyRoutes");
safeUse("/api/employee", EmployeeRoutes, "EmployeeRoutes");
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
});
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});