const mongoose = require("mongoose");

const ticketAttachmentSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    file_name: String,
    file_url: String,
    file_type: String,
    file_size: Number,
  },
  {
    timestamps: { createdAt: "uploaded_at", updatedAt: false },
  }
);

module.exports = mongoose.model("TicketAttachment", ticketAttachmentSchema);