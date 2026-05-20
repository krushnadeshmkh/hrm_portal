
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  leave_type: String,
  start_date: Date,
  end_date: Date,
  reason: String,
  status: { type: String, default: "Pending" },
});

module.exports = mongoose.model("LeaveApplication", leaveSchema);