const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  leave_type: {
    type: String,
    default: "Annual",
  },
  total_leaves: {
    type: Number,
    default: 20,
  },
  remaining_leaves: {
    type: Number,
    default: 20,
  },
});

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);