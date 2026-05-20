const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");
const Employee = require("../../models/Employee");
const LeaveBalance = require("../../models/LeaveBalance");
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, company_id, department_id } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "Name, email, password and role are required." });
    }

    const emailLower = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role,
      company_id: company_id || null,
    });
    if (role === "employee" || role === "company_admin") {
      const defaultDept = "6a0451f0ba0cbcdb3965477b";

      const emp = await Employee.create({
        user_id: newUser._id,
        name,
        email: emailLower,
        company_id: company_id || null,
        department_id: department_id || defaultDept,
        joining_date: new Date(),
      });
      if (role === "employee") {
        await LeaveBalance.create({
          employee_id: emp._id,
          leave_type: "Annual",
          total_leaves: 20,
          remaining_leaves: 20,
        });
      }
    }

    res.status(201).json({
      success: true,
      msg: "Registration successful.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    let employee_id = null;
    if (user.role === "company_admin") {
      const empRecord = await Employee.findOne({ user_id: user._id });
      if (empRecord) {
        employee_id = empRecord._id;
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        company_id: user.company_id,
        employee_id,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: err.message });
  }
};