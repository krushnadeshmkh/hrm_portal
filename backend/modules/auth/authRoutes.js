const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const auth = require("../../middleware/authMiddleware");
const { sendWelcomeEmail } = require("../../utils/emailHelper");

const User = require("../../models/User");
const Company = require("../../models/Company");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, company_name } = req.body;

    if (!name || !email || !password || !company_name) {
      return res.status(400).json({
        success: false,
        msg: "Name, email, password and company name are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        msg: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        msg: "Email already registered",
      });
    }
    const now = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 15);

    const company = await Company.create({
      company_name: company_name.trim(),
      is_trial: true,
      is_active: true,
      trial_start: now,
      trial_end: trialEnd,
    });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: "company_admin",
      company_id: company._id,
      is_active: true,
      created_at: now,
    });
    sendWelcomeEmail({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "company_admin",
      companyName: company_name.trim(),
    }).catch((err) =>
      console.error("Welcome email failed:", err.message)
    );

    return res.status(201).json({
      success: true,
      data: user,
      message: "Account created. Your 15-day free trial has started.",
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
    }
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        code: "SUSPENDED",
        msg: "Your account has been suspended by the administrator",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    let trialPayload = null;

    if (user.company_id) {
      const company = await Company.findById(user.company_id);

      if (company) {
        const now = new Date();
        const diff = company.trial_end - now;
        const daysLeft = Math.max(
          0,
          Math.ceil(diff / (1000 * 60 * 60 * 24))
        );

        trialPayload = {
          is_trial: company.is_trial,
          is_active: company.is_active,
          trial_start: company.trial_start,
          trial_end: company.trial_end,
          days_left: daysLeft,
        };
      }
    }

    return res.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      },
      trial: trialPayload,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email role company_id is_active"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });

  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;