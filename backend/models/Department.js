
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    department_name: String,
   company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);