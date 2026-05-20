
const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  holiday_date: Date,
  description: String,
  company_id: String,
});

module.exports = mongoose.model("Holiday", holidaySchema);