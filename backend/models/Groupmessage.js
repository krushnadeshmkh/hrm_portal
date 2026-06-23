const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
  },
  { _id: false }
);

const groupMessageSchema = new mongoose.Schema(
  {
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    file_url: {
      type: String,
      default: null,
    },
    file_name: {
      type: String,
      default: null,
    },
    file_type: {
      type: String,
      enum: ["image", "video", "audio", "document", null],
      default: null,
    },
    file_size: {
      type: Number,
      default: null,
    },
    read_by: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        read_at: { type: Date, default: Date.now },
      },
    ],
    deleted_for_everyone: {
      type: Boolean,
      default: false,
    },
    deleted_for: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reactions: [reactionSchema],
    reply_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupMessage",
      default: null,
    },
    system_message: {
      type: Boolean,
      default: false,
    },
    system_type: {
      type: String,
      enum: ["member_added", "member_removed", "member_left", "group_created", "admin_changed", "group_renamed", null],
      default: null,
    },
  },
  { timestamps: true }
);

groupMessageSchema.index({ group_id: 1, createdAt: -1 });
groupMessageSchema.index({ company_id: 1 });

module.exports = mongoose.model("GroupMessage", groupMessageSchema);