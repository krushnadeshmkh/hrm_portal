const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: true,
      trim: true,
    },

    pricing_plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },

    is_trial: {
      type: Boolean,
      default: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    trial_start: {
      type: Date,
      default: Date.now,
    },

    trial_end: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);
companySchema.index({ company_name: 1 });

module.exports = mongoose.model("Company", companySchema);