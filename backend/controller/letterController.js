const nodemailer = require("nodemailer");
const Letter = require("../models/Letter");
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
const subjects = {
  offer: "Your Offer Letter — SHNOOR INTERNATIONAL LLC",
  experience: "Experience Certificate — SHNOOR INTERNATIONAL LLC",
  salary: "Salary Slip — SHNOOR INTERNATIONAL LLC",
  relieving: "Relieving Letter — SHNOOR INTERNATIONAL LLC",
};
const wrapEmail = (html) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
body{margin:0;padding:0;background:#f8fafc;font-family:Arial}
.shell{max-width:680px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden}
.body{padding:32px 40px}
.footer{padding:20px;background:#f8fafc;text-align:center;font-size:12px;color:#94a3b8}
</style>
</head>
<body>
<div class="shell">
<div class="body">${html}</div>
<div class="footer">Official document from SHNOOR INTERNATIONAL LLC</div>
</div>
</body>
</html>
`;
const sendLetter = async (req, res) => {
  try {
    const {
      employeeId,
      employeeEmail,
      employeeName,
      letterType,
      htmlContent,
      notes,
    } = req.body;

    if (!employeeId || !employeeEmail || !letterType || !htmlContent) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    await transporter.sendMail({
      from:
        process.env.MAIL_FROM ||
        `"SHNOOR INTERNATIONAL LLC" <${process.env.MAIL_USER}>`,
      to: employeeEmail,
      subject: subjects[letterType] || "Letter from SHNOOR INTERNATIONAL LLC",
      html: wrapEmail(htmlContent),
    });

    const data = await Letter.create({
  employeeId,
  employeeName,
  employeeEmail,
  letterType,
  htmlContent,
  notes: notes || "",
  status: "sent",
  sent_at: new Date(),
  created_by: req.user?.id || null,
});

    return res.status(201).json({
      success: true,
      message: `Letter sent to ${employeeEmail}`,
      data: { id: data._id },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const saveDraft = async (req, res) => {
  try {
    const {
      employeeId,
      employeeEmail,
      employeeName,
      letterType,
      htmlContent,
      notes,
    } = req.body;

    if (!employeeId || !letterType || !htmlContent) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const existing = await Letter.findOne({
      employee_id: employeeId,
      letter_type: letterType,
      status: "draft",
    });

    if (existing) {
      existing.html_content = htmlContent;
      existing.notes = notes || "";
      existing.updated_at = new Date();
      await existing.save();

      return res.json({
        success: true,
        message: "Draft updated",
        data: { id: existing._id },
      });
    }

const data = await Letter.create({
  employeeId,
  employeeName,
  employeeEmail,
  letterType,
  htmlContent,
  notes: notes || "",
  status: "sent",
  sent_at: new Date(),
  created_by: req.user?.id || null,
});

    return res.status(201).json({
      success: true,
      message: "Draft saved",
      data: { id: data._id },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const data = await Letter.find().sort({ created_at: -1 });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getLetterById = async (req, res) => {
  try {
    const data = await Letter.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ success: false, message: "Letter not found" });
    }

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMyLetters = async (req, res) => {
  try {
    console.log(req.user)
    const userEmail = req.user?.email;
    const userId = req.user?.id;

    if (!userEmail && !userId) {
      return res.status(400).json({ success: false, message: "User not identified" });
    }

    const data = await Letter.find({
      status: "sent",
      $or: [
        { employeeEmail: userEmail },
        { employeeId: String(userId) },
      ],
    }).sort({ created_at: -1 });

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  sendLetter,
  saveDraft,
  getHistory,
  getLetterById,
  getMyLetters,
};