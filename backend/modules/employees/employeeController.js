const bcrypt = require("bcryptjs");
const Employee = require("../../models/Employee");
const User = require("../../models/User");
const LeaveBalance = require("../../models/LeaveBalance");

exports.getEmployees = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const employees = await Employee.find({ company_id: companyId })
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name")
      .sort({ name: 1 });

    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, department_id, designation_id, joining_date } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
    }

    const emailLower = email.toLowerCase().trim();
    const companyId = req.user.company_id;
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "A user with this email already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: "employee",
      company_id: companyId,
    });
    const employee = await Employee.create({
      user_id: newUser._id,
      name,
      email: emailLower,
      phone: phone || "",
      department_id: department_id || null,
      designation_id: designation_id || null,
      company_id: companyId,
      joining_date: joining_date ? new Date(joining_date) : new Date(),
    });
    await LeaveBalance.create({
      employee_id: employee._id,
      leave_type: "Annual",
      total_leaves: 20,
      remaining_leaves: 20,
    });

    res.status(201).json({
      success: true,
      msg: "Employee onboarded successfully.",
      data: employee,
    });
  } catch (err) {
    console.error("addEmployee Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
exports.getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      email: req.user.email.toLowerCase(),
    })
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name");

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee profile not found." });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};