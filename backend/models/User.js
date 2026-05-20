const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["super_admin", "software_owner", "company_admin", "employee"],
      default: "employee",
    },

    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    trial_end: Date,
    phone: String,
    department: { type: String, default: "Administration" },
    avatar_url: String,
    last_login: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);