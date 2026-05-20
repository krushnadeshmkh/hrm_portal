const mongoose = require("mongoose");

const trialRequestSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  requested_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  days_requested: { type: Number, default: 30 },
  status: { type: String, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("TrialRequest", trialRequestSchema);