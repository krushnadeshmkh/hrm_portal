const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";
const sendWelcomeEmail = async ({ name, email, password, role }) => {
  const roleLabels = {
    employee: "Employee",
    company_admin: "Company Administrator",
    super_admin: "Super Administrator",
    software_owner: "Software Owner",
  };

  const roleLabel = roleLabels[role] || role;

  const html = `
  <div style="max-width:560px;margin:auto;font-family:Segoe UI;background:#f1f5f9;padding:20px">
    <div style="background:#fff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:25px;text-align:center;color:#fff">
        <h2>Welcome to Shnoor</h2>
        <p>${roleLabel} Account Created</p>
      </div>

      <div style="padding:25px">
        <p>Hello <b>${name}</b>,</p>
        <p>Your account is ready. Use below credentials:</p>

        <div style="background:#f8fafc;padding:15px;border-radius:10px">
          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${password}</p>
          <p><b>Role:</b> ${roleLabel}</p>
        </div>

        <a href="${FRONTEND}/login"
          style="display:block;margin:20px auto;padding:12px 25px;background:#4f46e5;color:#fff;text-align:center;text-decoration:none;border-radius:8px">
          Login Now
        </a>

        <p style="color:#b91c1c;font-size:13px">
          Change your password after first login.
        </p>
      </div>
    </div>
  </div>`;

  return transporter.sendMail({
    from: `"Shnoor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to Shnoor - ${roleLabel}`,
    html,
  });
};

const sendTrialEmail = async ({ name, email, companyName, trialEnd }) => {
  const html = `
  <div style="max-width:560px;margin:auto;font-family:Segoe UI;background:#f1f5f9;padding:20px">
    <div style="background:#fff;border-radius:12px;overflow:hidden">

      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:25px;text-align:center;color:#fff">
        <h2>Trial Started 🎉</h2>
        <p>${companyName}</p>
      </div>

      <div style="padding:25px">
        <p>Hello <b>${name}</b></p>
        <p>Your 15-day trial started successfully.</p>

        <div style="background:#eef2ff;padding:15px;border-radius:10px;text-align:center">
          <h1>15 Days</h1>
          <p>Ends on ${formatDate(trialEnd)}</p>
        </div>

        <a href="${FRONTEND}/login"
          style="display:block;margin:20px auto;padding:12px 25px;background:#4f46e5;color:#fff;text-align:center;text-decoration:none;border-radius:8px">
          Go to Dashboard
        </a>
      </div>
    </div>
  </div>`;

  return transporter.sendMail({
    from: `"Shnoor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Trial Activated - ${companyName}`,
    html,
  });
};

const sendPayslipEmail = async (data) => {
  const {
    name, email, companyName, employeeId,
    baseSalary, bonus = 0, bonusReason,
    allowances = 0, allowanceReason,
    deductions = 0, deductionReason,
    tax = 0, taxReason,
    netSalary, payDate, payPeriod, notes,
  } = data;

  const rupee = (n) =>
    "₹" + parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const gross = +baseSalary + +bonus + +allowances;
  const totalDed = +deductions + +tax;

  const html = `
  <div style="max-width:600px;margin:auto;font-family:Segoe UI;background:#f1f5f9;padding:20px">
    <div style="background:#fff;border-radius:12px;overflow:hidden">

      <div style="background:linear-gradient(135deg,#d4a017,#f5c332);padding:25px;text-align:center;color:#fff">
        <h2>Payslip</h2>
        <p>${companyName}</p>
      </div>

      <div style="padding:25px">

        <p>Hello <b>${name}</b></p>

        <div style="background:#fff7ed;padding:15px;border-radius:10px;text-align:center">
          <h2>${rupee(netSalary)}</h2>
          <p>Net Salary</p>
        </div>

        <p><b>Employee ID:</b> EMP-${employeeId}</p>
        <p><b>Date:</b> ${formatDate(payDate)}</p>

        <h4>Earnings</h4>
        <p>Basic: ${rupee(baseSalary)}</p>
        ${bonus ? `<p>Bonus: ${rupee(bonus)} (${bonusReason || ""})</p>` : ""}
        ${allowances ? `<p>Allowance: ${rupee(allowances)}</p>` : ""}

        <h4>Deductions</h4>
        ${deductions ? `<p>Deductions: ${rupee(deductions)}</p>` : ""}
        ${tax ? `<p>Tax: ${rupee(tax)}</p>` : ""}

        ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ""}

        <a href="${FRONTEND}/employee/payroll"
          style="display:block;margin-top:20px;text-align:center;background:#d4a017;color:#fff;padding:12px;border-radius:8px;text-decoration:none">
          View Payslip
        </a>
      </div>
    </div>
  </div>`;

  return transporter.sendMail({
    from: `"${companyName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Payslip - ${formatDate(payDate)}`,
    html,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendTrialEmail,
  sendPayslipEmail,
};