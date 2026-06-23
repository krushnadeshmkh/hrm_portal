const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    end_date: {
      type: String,
    },
    end_time: {
      type: String,
    },
    event_type: {
      type: String,
      enum: ["task", "reminder", "birthday", "holiday", "other"],
      default: "task",
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: "#4F46E5",
    },
    recurrence: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly", "none"],
        default: "none",
      },
      interval: {
        type: Number,
        default: 1,
      },
      end_date: {
        type: String,
      },
      days_of_week: [Number],
      exceptions: [String],
    },
    guests: [
      {
        email: {
          type: String,
          trim: true,
        },
        name: {
          type: String,
          trim: true,
        },
        response_status: {
          type: String,
          enum: ["needsAction", "declined", "tentative", "accepted"],
          default: "needsAction",
        },
        response_time: {
          type: Date,
        },
        notification_sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    reminders: [
      {
        method: {
          type: String,
          enum: ["email", "popup", "notification"],
          default: "notification",
        },
        minutes: {
          type: Number,
          default: 15,
        },
      },
    ],
    attachments: [
      {
        file_name: {
          type: String,
        },
        file_url: {
          type: String,
        },
        file_size: {
          type: Number,
        },
        uploaded_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private", "company"],
      default: "company",
    },
    shared_with: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["view", "edit", "manage"],
          default: "view",
        },
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ company_id: 1, date: 1 });
eventSchema.index({ created_by: 1, date: 1 });
eventSchema.index({ company_id: 1, is_deleted: 1 });

module.exports = mongoose.model("Event", eventSchema);