const mongoose = require("mongoose");

const salaryAdvanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "recovered", "partially_recovered"],
    default: "pending"
  },
  requested_date: {
    type: Date,
    default: Date.now
  },
  approved_date: Date,
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rejected_date: Date,
  rejected_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rejection_reason: {
    type: String,
    trim: true
  },
  repayment_months: {
    type: Number,
    default: 3
  },
  monthly_deduction: {
    type: Number,
    default: 0
  },
  remaining_amount: {
    type: Number,
    default: 0
  },
  total_recovered: {
    type: Number,
    default: 0
  },
  deducted_amount: {
    type: Number,
    default: 0
  },
  recovery_installments: [{
    payroll_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payroll"
    },
    amount: Number,
    recovered_date: Date,
    pay_period: String
  }],
  notes: String,
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  is_fully_recovered: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

salaryAdvanceSchema.pre('save', function() {
  if (this.isNew) {
    this.remaining_amount = this.amount;
    this.monthly_deduction = this.amount / this.repayment_months;
  }
});

module.exports = mongoose.model("SalaryAdvance", salaryAdvanceSchema);