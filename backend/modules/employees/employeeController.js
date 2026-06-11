const bcrypt = require("bcryptjs");
const Employee = require("../../models/Employee");
const User = require("../../models/User");
const Department = require("../../models/Department");
const Designation = require("../../models/Designation");
const LeaveBalance = require("../../models/LeaveBalance");
const { sendWelcomeEmail } = require("../../utils/emailHelper");

exports.getEmployees = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    
    const employees = await Employee.find({ company_id: companyId })
      .populate("user_id", "name email phone avatar_url role")
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name")
      .populate("manager_id", "name email");
    
    const formattedEmployees = employees.map(emp => ({
      _id: emp._id,
      name: emp.user_id?.name || emp.name || "Unknown",
      email: emp.user_id?.email || emp.email || "",
      phone: emp.user_id?.phone || emp.phone || "",
      designation: emp.designation_id?.designation_name || emp.designation || "Not Assigned",
      salary: emp.salary || 0,
      department: emp.department_id?.department_name || "General",
      department_id: emp.department_id?._id,
      joining_date: emp.joining_date,
      position: emp.position || "employee",
      status: emp.status || "active",
      manager: emp.manager_id ? { name: emp.manager_id.name, email: emp.manager_id.email } : null,
      role:emp.user_id?.role || emp.role || ""
    }));
    
    res.json({ success: true, data: formattedEmployees });
  } catch (err) {
    console.error("getEmployees Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    const {
      name, 
      email, 
      password, 
      phone,
      department_id, 
      designation_id, 
      designation,
      manager_id, 
      joining_date,
      salary
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters.",
      });
    }

    const emailLower = email.toLowerCase().trim();
    const companyId = req.user.company_id;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID not found. Please login again.",
      });
    }

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "A user with this email already exists.",
      });
    }

    if (department_id) {
      const department = await Department.findOne({ 
        _id: department_id, 
        company_id: companyId 
      });
      if (!department) {
        return res.status(400).json({
          success: false,
          error: "Selected department does not belong to this company.",
        });
      }
    }

    if (designation_id) {
      const designationRecord = await Designation.findOne({ 
        _id: designation_id, 
        company_id: companyId 
      });
      if (!designationRecord) {
        return res.status(400).json({
          success: false,
          error: "Selected designation does not belong to this company.",
        });
      }
    }

    if (manager_id) {
      const manager = await Employee.findOne({ 
        _id: manager_id, 
        company_id: companyId 
      });
      if (!manager) {
        return res.status(400).json({
          success: false,
          error: "Selected manager does not belong to this company or does not exist.",
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: "employee",
      company_id: companyId,
      phone: phone || "",
    });

    const employeeData = {
      user_id: newUser._id,
      name: name,
      email: emailLower,
      phone: phone || "",
      position: "employee",
      department_id: department_id || null,
      designation_id: designation_id || null,
      designation: designation || null,
      manager_id: manager_id || null,
      company_id: companyId,
      joining_date: joining_date ? new Date(joining_date) : new Date(),
      salary: salary && salary !== "" ? Number(salary) : 0, 
    };

    const employee = await Employee.create(employeeData);
    
    await LeaveBalance.create({
      employee_id: employee._id,
      leave_type: "Annual",
      total_leaves: 20,
      remaining_leaves: 20,
      company_id: companyId,
    });

    sendWelcomeEmail({
      name,
      email: emailLower,
      password,
      role: "employee",
    }).catch((err) => console.error("Welcome email error:", err.message));

    res.status(201).json({
      success: true,
      msg: "Employee onboarded successfully.",
      data: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department_id: employee.department_id,
        designation_id: employee.designation_id,
        designation: employee.designation,
        manager_id: employee.manager_id,
        joining_date: employee.joining_date,
        salary: employee.salary,
        createdAt: employee.createdAt
      },
    });

  } catch (err) {
    console.error("addEmployee Error:", err);
  
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Duplicate entry. Email or employee ID already exists.",
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }

    res.status(500).json({ 
      success: false, 
      error: err.message || "Internal server error while adding employee." 
    });
  }
};

exports.getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      email: req.user.email.toLowerCase(),
    })
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name")
      .populate("manager_id", "name email");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee profile not found.",
      });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    console.error("getEmployeeProfile Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateEmployeePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { position } = req.body;
    const companyId = req.user.company_id;

    if (!position || !["employee", "manager"].includes(position)) {
      return res.status(400).json({
        success: false,
        error: "Position must be either 'employee' or 'manager'.",
      });
    }

    const employee = await Employee.findOne({ _id: id, company_id: companyId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found.",
      });
    }

    employee.position = position;
    await employee.save();

    res.status(200).json({
      success: true,
      msg: `Position updated to ${position} successfully.`,
      data: employee,
    });
  } catch (err) {
    console.error("updateEmployeePosition Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateEmployeeSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { salary } = req.body;
    const companyId = req.user.company_id;

    if (salary === undefined || salary === null) {
      return res.status(400).json({
        success: false,
        error: "Salary is required.",
      });
    }

    if (typeof salary !== "number" || salary < 0) {
      return res.status(400).json({
        success: false,
        error: "Salary must be a valid positive number.",
      });
    }

    const employee = await Employee.findOne({ _id: id, company_id: companyId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found.",
      });
    }

    employee.salary = salary;
    await employee.save();

    res.status(200).json({
      success: true,
      msg: "Salary updated successfully.",
      data: employee,
    });
  } catch (err) {
    console.error("updateEmployeeSalary Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCurrentEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }
    
    const employee = await Employee.findOne({
      user_id: user._id,
    })
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name")
      .populate("manager_id", "name email");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee profile not found.",
      });
    }

    const responseData = {
      _id: employee._id,
      user_id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      salary: employee.salary || 0,
      designation: employee.designation_id?.designation_name || employee.designation || "Employee",
      designation_id: employee.designation_id,
      department: employee.department_id?.department_name || "General",
      department_id: employee.department_id,
      company_id: employee.company_id,
      joining_date: employee.joining_date,
      position: employee.position || "employee",
      manager_id: employee.manager_id,
      status: employee.status || "active",
      avatar: user.avatar_url || null,
      created_at: user.createdAt,
    };

    res.status(200).json({ success: true, data: responseData });
  } catch (err) {
    console.error("getCurrentEmployee Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};