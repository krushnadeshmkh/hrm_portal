const mongoose = require("mongoose");
const User = require("../../models/User");
const Employee = require("../../models/Employee");
const Attendance = require("../../models/Attendance");
const LeaveApplication = require("../../models/LeaveApplication");
const LeaveBalance = require("../../models/LeaveBalance");
const Company = require("../../models/Company");
const Holiday = require("../../models/Holiday");
const Payroll = require("../../models/Payroll");
const toObjectId = (id) => {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
};
const todayMidnight = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

exports.getSummary = async (req, res) => {
  try {
    const mode       = req.query.mode;      
    const empIdQuery = req.query.employee_id;
    const isSelf     = mode === "self";
    const userId    = req.user.id;
    const companyId = req.user.company_id;
    const tokenRole = req.user.role;          
    const companyObjId = toObjectId(companyId);
    const serveEmployeeView =
      tokenRole === "employee" ||  
      isSelf;                       
    if (serveEmployeeView) {
      let employee = null;
      if (empIdQuery) {
        employee = await Employee.findById(empIdQuery);
      }
      if (!employee) {
        employee = await Employee.findOne({ user_id: userId });
      }
      if (!employee) {
        const user = await User.findById(userId);
        if (user) {
          employee = await Employee.findOne({ email: user.email.toLowerCase() });
        }
      }

      if (!employee) {
        return res.json({
          success: true,
          data: {
            attendanceToday:  "Not Marked",
            leaveBalance:     0,
            upcomingHolidays: 0,
            payslipsCount:    0,
          },
        });
      }

      const todayStart = todayMidnight();
      const attendance = await Attendance.findOne({
        employee_id: employee._id,
        attendance_date: { $gte: todayStart },
      });
      const leaveBalance = await LeaveBalance.aggregate([
        { $match: { employee_id: employee._id } },
        { $group: { _id: null, total: { $sum: "$remaining_leaves" } } },
      ]);
      const holidayQuery = {
        holiday_date: { $gte: todayStart },
      };
      if (companyObjId) {
        holidayQuery.$or = [
          { company_id: companyObjId },
          { company_id: companyId },
        ];
      }
      const upcomingHolidays = await Holiday.countDocuments(holidayQuery);
      const payslipsCount = await Payroll.countDocuments({
        employee_id: employee._id,
      });
      console.log("Upcoming holidays count:", upcomingHolidays, "| company_id:", companyId);

      return res.json({
        success: true,
        data: {
          attendanceToday:
            attendance?.status?.toLowerCase() === "present"
              ? "Marked"
              : "Not Marked",
          leaveBalance:     leaveBalance[0]?.total ?? 0,
          upcomingHolidays,
          payslipsCount,
        },
      });
    }
    const totalEmployees = await User.countDocuments({ company_id: companyId });
    const employees = await Employee.find({ company_id: companyId }).select("_id");
    const empIds    = employees.map((e) => e._id);
    const presentToday = await Attendance.countDocuments({
      employee_id: { $in: empIds },
      attendance_date: { $gte: todayMidnight() },
      status: /present/i,
    });

    const pendingLeaves = await LeaveApplication.countDocuments({
      employee_id: { $in: empIds },
      status: /pending/i,
    });

    const totalCompanies = await Company.countDocuments();

    return res.json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        pendingLeaves,
        totalCompanies,
      },
    });

  } catch (err) {
    console.error("Dashboard Summary Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const employees = await Employee.find({ company_id: companyId }).select("_id");
    const empIds    = employees.map((e) => e._id);

    const attendance = await Attendance.find({ employee_id: { $in: empIds } })
      .sort({ attendance_date: -1 })
      .limit(5);

    const leaves = await LeaveApplication.find({ employee_id: { $in: empIds } })
      .sort({ start_date: -1 })
      .limit(5);

    const combined = [
      ...attendance.map((a) => ({ type: "Attendance", detail: a.status, date: a.attendance_date })),
      ...leaves.map((l)     => ({ type: "Leave",      detail: l.status, date: l.start_date })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({ success: true, data: combined });
  } catch (err) {
    console.error("Dashboard Activities Error:", err);
    res.status(500).json({ error: err.message });
  }
};