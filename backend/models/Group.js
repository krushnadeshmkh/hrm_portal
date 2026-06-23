const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joined_at: {
          type: Date,
          default: Date.now,
        },
        muted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    last_message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupMessage",
      default: null,
    },
    last_message_time: {
      type: Date,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

groupSchema.index({ company_id: 1 });
groupSchema.index({ "members.user_id": 1 });

module.exports = mongoose.model("Group", groupSchema);