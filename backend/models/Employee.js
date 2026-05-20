const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: String,
    email: String,
    phone: String,
department_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Department",
  required: true
},

    designation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },

    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    joining_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);