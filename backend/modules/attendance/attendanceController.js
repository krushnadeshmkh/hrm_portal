const Employee = require("../../models/Employee");
const User = require("../../models/User");
const Attendance = require("../../models/Attendance");
const Session = require("../../models/AttendanceSession");

async function resolveEmployee(userId, role) {
  const user = await User.findById(userId);

  if (!user) return null;

  let employee = await Employee.findOne({
    email: user.email.toLowerCase(),
  });

  if (employee) return employee._id;

  if (role === "company_admin" || role === "super_admin") {
    const newEmp = await Employee.create({
      name: user.name,
      email: user.email,
      company_id: user.company_id,
    });

    return newEmp._id;
  }

  return null;
}

exports.markAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    let { status } = req.body;

    status = status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : "Present";

    const employeeId = await resolveEmployee(userId, req.user.role);

    if (!employeeId) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    const now = new Date();
    const time = now.toTimeString().split(" ")[0];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employee_id: employeeId,
      attendance_date: { $gte: todayStart },
    });

    if (!attendance) {
      attendance = await Attendance.create({
        employee_id: employeeId,
        status,
        check_in: time,
      });
    }

    const openSession = await Session.findOne({
      attendance_id: attendance._id,
      check_out: null,
    }).sort({ _id: -1 });

    let action, session;

    if (!openSession) {
      session = await Session.create({
        attendance_id: attendance._id,
        employee_id: employeeId,
        check_in: time,
      });

      action = "checked_in";

      const count = await Session.countDocuments({
        attendance_id: attendance._id,
      });

      if (count === 1) {
        attendance.check_in = time;
        attendance.status = status;
        await attendance.save();
      }
    } else {
      openSession.check_out = time;
      await openSession.save();

      session = openSession;
      action = "checked_out";

      attendance.check_out = time;
      await attendance.save();
    }

    res.json({ success: true, action, session });
  } catch (err) {
    console.error("Mark Attendance Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getToday = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const employee = await Employee.findOne({
      email: user.email.toLowerCase(),
    });

    if (!employee) return res.json({ marked: false });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee_id: employee._id,
      attendance_date: { $gte: todayStart },
    });

    if (!attendance) return res.json({ marked: false });

    const sessions = await Session.find({
      attendance_id: attendance._id,
    }).sort({ _id: 1 });

    const hasOpenSession = sessions.some(
      (s) => s.check_in && !s.check_out
    );

    res.json({
      marked: true,
      status: attendance.status,
      check_in: attendance.check_in,
      check_out: attendance.check_out,
      sessions,
      hasOpenSession,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const attendanceList = await Attendance.find()
      .populate("employee_id")
      .sort({ attendance_date: -1 });
      console.log(attendanceList)

    const result = await Promise.all(
      attendanceList.map(async (a) => {
        const sessions = await Session.find({
          attendance_id: a._id,
        });

        return {
          attendance_id: a._id,
          employee: a.employee_id,
          status: a.status,
          check_in: a.check_in,
          check_out: a.check_out,
          sessions,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("Get Attendance Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.editSession = async (req, res) => {
  try {
    const { session_id, check_in, check_out } = req.body;

    const session = await Session.findByIdAndUpdate(
      session_id,
      { check_in, check_out },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const sessions = await Session.find({
      attendance_id: session.attendance_id,
    });

    const minCheckIn = sessions.reduce(
      (min, s) => (!min || s.check_in < min ? s.check_in : min),
      null
    );

    const maxCheckOut = sessions.reduce(
      (max, s) => (!max || s.check_out > max ? s.check_out : max),
      null
    );

    await Attendance.findByIdAndUpdate(session.attendance_id, {
      check_in: minCheckIn,
      check_out: maxCheckOut,
    });

    res.json({ success: true, data: session });
  } catch (err) {
    console.error("Edit Session Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.editAttendance = async (req, res) => {
  try {
    const { employee_id, attendance_date, status } = req.body;

    const start = new Date(attendance_date);
    start.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      {
        employee_id,
        attendance_date: { $gte: start },
      },
      { status },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ success: true, data: attendance });
  } catch (err) {
    console.error("Edit Attendance Error:", err);
    res.status(500).json({ error: err.message });
  }
};