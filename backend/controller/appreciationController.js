const nodemailer = require("nodemailer");
const Appreciation = require("../models/AppreciationSchema ");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const typeColors = {
  general: { label: "General", color: "#f59e0b", bg: "#fffbeb" },
  performance: { label: "Performance", color: "#6366f1", bg: "#f5f3ff" },
  teamwork: { label: "Teamwork", color: "#10b981", bg: "#f0fdf4" },
  innovation: { label: "Innovation", color: "#3b82f6", bg: "#eff6ff" },
  leadership: { label: "Leadership", color: "#8b5cf6", bg: "#f5f3ff" },
  customer_service: { label: "Customer Service", color: "#ec4899", bg: "#fdf2f8" },
};

const buildHTML = (name, email, title, message, type) => {
  const c = typeColors[type] || typeColors.general;
  const today = new Date().toLocaleDateString("en-IN");

  return `
  <div style="max-width:600px;margin:auto;font-family:Arial">
    <div style="border-top:6px solid ${c.color};padding:20px">

      <h2 style="color:${c.color}">SHNOOR INTERNATIONAL LLC</h2>
      <p>${today}</p>

      <p><b>To:</b> ${name} (${email})</p>

      <h3>${title}</h3>

      <div style="background:${c.bg};padding:12px;border-left:5px solid ${c.color}">
        <b>Type:</b> ${c.label}
      </div>

      <p>${message}</p>

      <p>Thank you!</p>
    </div>
  </div>`;
};

const sendAppreciation = async (req, res) => {
  try {
    const { toEmail, subject, message, appreciationType } = req.body;

    if (!toEmail || !subject || !message) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const employee = await Appreciation.findOne({ employee_email: toEmail });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const html = buildHTML(
      employee.employee_name,
      toEmail,
      subject,
      message,
      appreciationType
    );

    const dbData = await Appreciation.create({
      employee_id: employee.employee_id,
      company_id: employee.company_id,
      given_by: req.user.id,
      employee_email: toEmail,
      employee_name: employee.employee_name,
      title: subject,
      message,
      appreciation_type: appreciationType,
      html_content: html,
      status: "sent",
      sent_at: new Date(),
    });

    try {
      await transporter.sendMail({
        from: `"HR Team" <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: `Appreciation: ${subject}`,
        html,
      });
    } catch (e) {
      console.log("Email error:", e.message);
    }

    return res.json({ success: true, data: dbData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getMyAppreciations = async (req, res) => {
  try {
    const data = await Appreciation.find({
      employee_email: req.user.email,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const data = await Appreciation.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const saveDraft = async (req, res) => {
  try {
    const { employeeId, employeeEmail, employeeName, title, message, appreciationType } = req.body;

    const html = buildHTML(employeeName, employeeEmail, title, message, appreciationType);

    const data = await Appreciation.create({
      employee_id: employeeId,
      employee_email: employeeEmail,
      employee_name: employeeName,
      title,
      message,
      appreciation_type: appreciationType,
      html_content: html,
      status: "draft",
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppreciationById = async (req, res) => {
  try {
    const data = await Appreciation.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const updateAppreciation = async (req, res) => {
  try {
    const data = await Appreciation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!data) return res.status(404).json({ message: "Not found" });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const debugTable = async (req, res) => {
  const sample = await Appreciation.find().limit(5);
  res.json({ success: true, sample, user: req.user });
};

module.exports = {
  sendAppreciation,
  saveDraft,
  getHistory,
  getAppreciationById,
  updateAppreciation,
  getMyAppreciations,
  debugTable,
};