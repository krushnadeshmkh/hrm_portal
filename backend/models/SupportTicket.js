const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);
const supportTicketSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    reactions: {
      type: Map,
      of: Object,
      default: {},
    },

    admin_reply: String,
    replied_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    replied_at: Date,

    status: {
      type: String,
      enum: ["open", "inprogress", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);
supportTicketSchema.index({ company_id: 1, status: 1 });
supportTicketSchema.index({ user_id: 1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);