const mongoose = require("mongoose");

const messageActionSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket",
      required: true,
    },
    message_key: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action_type: {
      type: String,
      enum: ["reaction", "delete_for_me", "delete_for_everyone"],
      required: true,
    },
    value: {
      type: String, 
      default: null,
    },
  },
  { timestamps: true }
);


messageActionSchema.index(
  { ticket_id: 1, message_key: 1, user_id: 1, action_type: 1 },
  { unique: true }
);

module.exports = mongoose.model("MessageAction", messageActionSchema);