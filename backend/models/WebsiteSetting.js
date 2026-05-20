const mongoose = require("mongoose");

const websiteSettingSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      unique: true, 
    },

    settings: {
      type: Map,
      of: String, 
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebsiteSetting", websiteSettingSchema);