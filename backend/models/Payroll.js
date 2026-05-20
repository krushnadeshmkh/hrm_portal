const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },

  salary: Number,
  bonus: Number,
  bonus_reason: String,

  allowances: Number,
  allowance_reason: String,

  deductions: Number,
  deduction_reason: String,

  tax: Number,
  tax_reason: String,

  net_salary: Number,

  pay_date: Date,
  pay_period: String,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model("Payroll", payrollSchema);