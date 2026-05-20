const Employee = require('../../models/Employee');
const LeaveApplication = require('../../models/LeaveApplication');
const LeaveBalance = require('../../models/LeaveBalance');

exports.applyLeave = async (req, res) => {
  const { leave_type, start_date, end_date, reason } = req.body;

  try {
    const employee = await Employee.findOne({
      email: req.user.email.toLowerCase(),
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee record not found" });
    }

    const leave = await LeaveApplication.create({
      employee_id: employee._id,
      leave_type,
      start_date,
      end_date,
      reason,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      data: leave,
    });

  } catch (err) {
    console.error("APPLY LEAVE ERROR:", err);
    res.status(500).json({
      error: "Error while applying for leave",
    });
  }
};

exports.getLeaves = async (req, res) => {
  const company_id = req.user.company_id;
  const role = req.user.role;

  try {
    const employees = await Employee.find({ company_id }).select("_id email name");

    let empMap = {};
    let empIds = [];

    employees.forEach(e => {
      empIds.push(e._id);
      empMap[e._id] = e;
    });

    let filter = { employee_id: { $in: empIds } };

    if (role === 'employee') {
      const emp = employees.find(
        e => e.email.toLowerCase() === req.user.email.toLowerCase()
      );
      if (!emp) return res.json({ success: true, data: [] });
      filter.employee_id = emp._id;
    }

    const leaves = await LeaveApplication.find(filter)
      .sort({ _id: -1 });

    const result = leaves.map(l => ({
      leave_id: l._id,
      leave_type: l.leave_type,
      start_date: l.start_date,
      end_date: l.end_date,
      reason: l.reason,
      status: l.status,
      employee_name: empMap[l.employee_id]?.name || "",
    }));

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error("GET LEAVES ERROR:", err);
    res.status(500).json({
      error: "Error while fetching leaves",
    });
  }
};


exports.approveLeave = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const company_id = req.user.company_id;

  const normalizedStatus =
    status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();

  if (!["Approved", "Rejected"].includes(normalizedStatus)) {
    return res.status(400).json({
      error: "Status must be 'Approved' or 'Rejected'",
    });
  }

  try {
    const leave = await LeaveApplication.findById(id);

    if (!leave) {
      return res.status(404).json({
        error: "Leave record not found",
      });
    }

    const employee = await Employee.findById(leave.employee_id);

    if (!employee || employee.company_id.toString() !== company_id.toString()) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);

    const days_requested =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (normalizedStatus === "Approved") {
      let balance = await LeaveBalance.findOne({
        employee_id: leave.employee_id,
        leave_type: leave.leave_type,
      });

      if (!balance) {
        balance = await LeaveBalance.create({
          employee_id: leave.employee_id,
          leave_type: leave.leave_type,
          total_leaves: 12,
          used_leaves: 0,
          remaining_leaves: 12,
        });
      }

      if (balance.remaining_leaves < days_requested) {
        return res.status(400).json({
          error: `Insufficient balance. Required: ${days_requested}, Available: ${balance.remaining_leaves}`,
        });
      }

      balance.used_leaves += days_requested;
      balance.remaining_leaves -= days_requested;

      await balance.save();
    }

    leave.status = normalizedStatus;
    await leave.save();

    return res.status(200).json({
      success: true,
      data: leave,
    });

  } catch (err) {
    console.error("APPROVE LEAVE ERROR:", err);
    return res.status(500).json({
      error: "Error while updating leave",
    });
  }
};