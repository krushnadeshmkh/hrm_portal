const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema(
  {
    designation_name: {
      type: String,
      required: true,
      trim: true,
    },

    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Designation", designationSchema);