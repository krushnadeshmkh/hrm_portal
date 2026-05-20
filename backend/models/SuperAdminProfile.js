const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  phone: String,
  department: String,
  avatar_url: String,
}, { timestamps: true });

module.exports = mongoose.model("SuperAdminProfile", schema);