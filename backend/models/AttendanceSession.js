const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  attendance_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attendance",
  },
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  session_date: {
    type: Date,
    default: Date.now,
  },
  check_in: String,
  check_out: String,
  duration_mins: Number,
});

module.exports = mongoose.model("AttendanceSession", sessionSchema);