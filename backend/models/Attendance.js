const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  attendance_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "Present",
  },
  check_in: String,
  check_out: String,
});

module.exports = mongoose.model("Attendance", attendanceSchema);


