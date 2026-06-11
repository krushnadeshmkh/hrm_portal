const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emoji: { type: String, required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver_id: {
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
    is_read: {
      type: Boolean,
      default: false,
    },
    deleted_for: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deleted_for_everyone: {
      type: Boolean,
      default: false,
    },
    reactions: [reactionSchema],
    reply_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ sender_id: 1, receiver_id: 1 });
messageSchema.index({ company_id: 1 });

module.exports = mongoose.model("Message", messageSchema);