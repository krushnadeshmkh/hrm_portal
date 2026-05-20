
const mongoose = require("mongoose");

const AppreciationSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    given_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    employee_email: String,
    employee_name: String,

    title: String,
    message: String,

    appreciation_type: {
      type: String,
      default: "general",
      enum: ["general", "performance", "teamwork", "innovation", "leadership", "customer_service"],
    },

    html_content: String,

    status: {
      type: String,
      enum: ["sent", "draft"],
      default: "sent",
    },

    sent_at: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appreciation", AppreciationSchema);