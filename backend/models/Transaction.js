const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    payment_date: {
      type: Date,
      default: Date.now,
    },

status: {
  type: String,
  enum: ["pending", "approved", "rejected", "paid"],
  default: "pending",
},

    note: String,

    plan_name: String,

    reviewed_at: Date,

    reject_reason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);