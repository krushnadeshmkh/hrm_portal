const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    title: String,
    file: String,
   company_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Company"
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Policy", policySchema);