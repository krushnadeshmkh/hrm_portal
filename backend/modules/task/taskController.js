const Employee = require("../../models/Employee");
const Task = require("../../models/Task");

exports.getMyTeam = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user.id });


    if (!employee) {
      return res.status(404).json({ success: false, msg: "Employee record not found." });
    }

    const team = await Employee.find({
      company_id: employee.company_id,
      manager_id:employee._id
    })
      .populate("designation_id", "designation_name")
      .populate("department_id", "department_name")
      .sort({ name: 1 });



    res.json({ success: true, data: team });
  } catch (err) {
    console.error("getMyTeam Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.assignTask = async (req, res) => {
  try {
    const { title, description, deadline, assigned_to } = req.body;

    if (!title || !deadline || !assigned_to) {
      return res.status(400).json({ success: false, msg: "Title, deadline and employee are required." });
    }

    const manager = await Employee.findOne({ user_id: req.user.id });
    console.log(manager,"manager")
    if (!manager) {
      return res.status(404).json({ success: false, msg: "Manager record not found." });
    }

    const subordinate = await Employee.findOne({
      _id: assigned_to,
      manager_id: manager._id,
    });

    console.log(subordinate)

    if (!subordinate) {
      return res.status(403).json({ success: false, msg: "You can only assign tasks to your own team members." });
    }

    const task = await Task.create({
      title,
      description: description || "",
      deadline: new Date(deadline),
      assigned_to,
      assigned_by: manager._id,
      company_id: manager.company_id,
    });

    res.status(201).json({ success: true, msg: "Task assigned successfully.", data: task });
  } catch (err) {
    console.error("assignTask Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAssignedTasks = async (req, res) => {
  try {
    const manager = await Employee.findOne({ user_id: req.user.id });

    if (!manager) {
      return res.status(404).json({ success: false, msg: "Manager record not found." });
    }

    const tasks = await Task.find({ assigned_by: manager._id })
      .populate("assigned_to", "name email position")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (err) {
    console.error("getAssignedTasks Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};



exports.getMyTasks = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user.id });

    if (!employee) {
      return res.status(404).json({ success: false, msg: "Employee record not found." });
    }

    const tasks = await Task.find({ assigned_to: employee._id })
      .populate("assigned_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (err) {
    console.error("getMyTasks Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({ success: false, msg: "Invalid status value." });
    }

    const employee = await Employee.findOne({ user_id: req.user.id });

    if (!employee) {
      return res.status(404).json({ success: false, msg: "Employee record not found." });
    }

    const task = await Task.findOne({ _id: id, assigned_to: employee._id });

    if (!task) {
      return res.status(404).json({ success: false, msg: "Task not found or not assigned to you." });
    }

    task.status = status;
    await task.save();

    res.json({ success: true, msg: "Task status updated.", data: task });
  } catch (err) {
    console.error("updateTaskStatus Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};