const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    plan_name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    billing_cycle: {
      type: String, 
      required: true,
    },

    max_employees: {
      type: Number,
      default: 0,
    },

    features: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);