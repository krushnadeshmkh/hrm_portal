const mongoose = require("mongoose");
const LetterSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    employeeEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    letterType: {
      type: String,
      enum: ["offer", "experience", "salary", "relieving"],
      required: true,
    },

    htmlContent: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "sent"],
      default: "draft",
    },

    sentAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Letter", LetterSchema);

