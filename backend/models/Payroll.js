const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },

  salary: { type: Number, required: true, default: 0 },
  bonus: { type: Number, default: 0 },
  bonus_reason: { type: String },

  allowances: { type: Number, default: 0 },
  allowance_reason: { type: String },

  deductions: { type: Number, default: 0 },
  deduction_reason: { type: String },

  tax: { type: Number, default: 0 },
  tax_reason: { type: String },
  
  pf: { type: Number, default: 0 },     
  pt: { type: Number, default: 0 },     
  esi: { type: Number, default: 0 },    
  
  advance_deduction: {
    type: Number,
    default: 0
  },

  advance_recoveries: [{
    advance_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryAdvance"
    },
    amount: Number,
    remaining_before: Number,
    remaining_after: Number
  }],
  
  total_deductions: { type: Number, default: 0 }, 

  net_salary: { type: Number, required: true },

  pay_date: { type: Date, default: Date.now },
  pay_period: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Payroll", payrollSchema);