const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
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
    end_time: {
      type: String,
    },
    duration: {
      type: Number,
      default: 60,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    attendees: [
      {
        email: {
          type: String,
          required: true,
        },
        name: {
          type: String,
        },
        response_status: {
          type: String,
          enum: ["pending", "accepted", "declined", "tentative"],
          default: "pending",
        },
        joined_at: {
          type: Date,
        },
        left_at: {
          type: Date,
        },
      },
    ],
    is_virtual: {
      type: Boolean,
      default: true,
    },
    meeting_link: {
      type: String,
      trim: true,
    },
    agenda: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    meeting_code: {
      type: String,
      unique: true,
      sparse: true,
    },
    recording: {
      enabled: {
        type: Boolean,
        default: false,
      },
      url: {
        type: String,
      },
      start_time: {
        type: Date,
      },
      end_time: {
        type: Date,
      },
    },
    meeting_messages: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        is_pinned: {
          type: Boolean,
          default: false,
        },
      },
    ],
    presentation: {
      file_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      file_name: {
        type: String,
      },
      shared_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      shared_at: {
        type: Date,
      },
    },
    analytics: {
      participant_count: {
        type: Number,
        default: 0,
      },
      total_duration: {
        type: Number,
        default: 0,
      },
      max_participants: {
        type: Number,
        default: 0,
      },
      average_join_time: {
        type: Number,
        default: 0,
      },
    },
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
    notified_groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    notified_contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    notification_type: {
      type: String,
      enum: ["both", "groups", "contacts"],
      default: "both",
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

meetingSchema.index({ company_id: 1, date: 1 });
meetingSchema.index({ company_id: 1, is_deleted: 1 });
meetingSchema.index({ meeting_code: 1 });

module.exports = mongoose.model("Meeting", meetingSchema);