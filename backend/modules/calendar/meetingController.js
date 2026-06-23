const Meeting = require("../../models/Meeting");
const Message = require("../../models/Message");
const User = require("../../models/User");
const Group = require("../../models/Group");
const GroupMessage = require("../../models/GroupMessage");
const mongoose = require("mongoose");
const { getIO, getUserSocketId } = require("../../middleware/socketSetup");

const generateMeetingCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MTG-${timestamp}${random}`;
};

const generateUniqueMeetingCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = generateMeetingCode();
    const existing = await Meeting.findOne({ meeting_code: code });
    exists = !!existing;
  }

  return code;
};

const normalizeAttendees = (attendees) => {
  if (!attendees || attendees.length === 0) return [];

  if (typeof attendees[0] === 'string') {
    return attendees.map((email) => ({
      email: email,
      name: email.split("@")[0],
      response_status: "pending",
    }));
  }

  if (typeof attendees[0] === 'object' && attendees[0].email) {
    return attendees;
  }

  return [];
};

function buildMeetingLink(meeting) {
  if (meeting.meeting_link) return meeting.meeting_link;
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return `${baseUrl}/meeting-room/${meeting.meeting_code}`;
}

function buildMeetingMessageText(meeting, chatName = null) {
  const greeting = chatName ? `Hello ${chatName},\n\n` : '';
  const lines = [
    `${greeting}📅 Meeting scheduled: "${meeting.title}"`,
    `🗓 ${meeting.date} at ${meeting.time}`,
  ];
  if (meeting.is_virtual) {
    lines.push(`🔗 Join link: ${buildMeetingLink(meeting)}`);
  } else if (meeting.location) {
    lines.push(`📍 Location: ${meeting.location}`);
  }
  if (meeting.agenda) lines.push(`Agenda: ${meeting.agenda}`);
  return lines.join("\n");
}

async function notifyAttendeesInChat(meeting, organizerId) {
  if (!meeting.attendees || meeting.attendees.length === 0) return [];

  const emails = meeting.attendees.map((a) => a.email).filter(Boolean);
  if (emails.length === 0) return [];

  const attendeeUsers = await User.find({ email: { $in: emails } });
  if (attendeeUsers.length === 0) return [];

  const io = getIO();
  const notifiedUserIds = [];

  for (const user of attendeeUsers) {
    if (String(user._id) === String(organizerId)) continue;

    try {
      const chatName = user.name || user.email.split('@')[0];
      const messageText = buildMeetingMessageText(meeting, chatName);

      const message = new Message({
        sender_id: organizerId,
        receiver_id: user._id,
        content: messageText,
        file_url: null,
        file_name: null,
        file_type: null,
        file_size: null,
        company_id: null,
        is_read: false,
        deleted_for: [],
        deleted_for_everyone: false,
        reactions: [],
        reply_to: null,
      });

      await message.save();

      const populated = await Message.findById(message._id)
        .populate("sender_id", "name avatar_url")
        .populate("receiver_id", "name avatar_url");

      if (io) {
        const receiverSocket = getUserSocketId(user._id);
        if (receiverSocket) io.to(receiverSocket).emit("receive_message", populated);

        const senderSocket = getUserSocketId(organizerId);
        if (senderSocket) io.to(senderSocket).emit("message_sent", populated);
      }

      notifiedUserIds.push(user._id);
    } catch (err) {
      console.error(`Failed to send meeting chat message to ${user.email}:`, err);
    }
  }

  return notifiedUserIds;
}

async function notifyAttendeesInGroupChat(meeting, organizerId) {
  try {
    const groups = await Group.find({
      "members.user_id": organizerId,
      is_active: true
    }).populate("members.user_id", "name email");

    if (!groups || groups.length === 0) return [];

    const io = getIO();
    const notifiedGroupIds = [];

    const attendeeEmails = meeting.attendees.map(a => a.email);
    const attendeeUsers = await User.find({ email: { $in: attendeeEmails } });
    const attendeeIds = attendeeUsers.map(u => String(u._id));

    for (const group of groups) {
      const groupMemberIds = group.members.map(m => String(m.user_id._id || m.user_id));
      const groupMemberNames = group.members.map(m => m.user_id.name || m.user_id.email?.split('@')[0] || 'Team Member');
      
      const matchingMembers = groupMemberIds.filter(id => 
        attendeeIds.includes(id) && String(id) !== String(organizerId)
      );
      
      if (matchingMembers.length === 0) continue;

      const groupName = group.name || 'Group';
      const membersList = groupMemberNames.join(', ');
      const messageText = `📢 Meeting notification for ${groupName}\n\n${buildMeetingMessageText(meeting, `Team ${groupName}`)}\n\n👥 Members: ${membersList}`;

      try {
        const groupMessage = new GroupMessage({
          group_id: group._id,
          sender_id: organizerId,
          company_id: group.company_id,
          content: messageText,
          system_message: false,
          read_by: [{ user_id: organizerId, read_at: new Date() }],
          reactions: [],
          deleted_for: [],
          deleted_for_everyone: false,
        });

        await groupMessage.save();

        const populated = await GroupMessage.findById(groupMessage._id)
          .populate("sender_id", "name avatar_url");

        await Group.findByIdAndUpdate(group._id, {
          last_message: groupMessage._id,
          last_message_time: groupMessage.createdAt,
        });

        if (io) {
          for (const member of group.members) {
            const memberId = String(member.user_id._id || member.user_id);
            const socketId = getUserSocketId(memberId);
            if (socketId) {
              io.to(socketId).emit("group_message", {
                group_id: group._id,
                message: {
                  ...populated.toObject(),
                  group_name: group.name,
                },
              });
            }
          }
        }

        notifiedGroupIds.push(group._id);
      } catch (err) {
        console.error(`Failed to send group meeting message to group ${group._id}:`, err);
      }
    }

    return notifiedGroupIds;
  } catch (error) {
    console.error("Error sending group meeting notifications:", error);
    return [];
  }
}

async function notifySelectedContacts(meeting, organizerId, contactIds) {
  const notifiedContacts = [];

  for (const contactId of contactIds) {
    if (String(contactId) === String(organizerId)) continue;

    try {
      const user = await User.findById(contactId);
      if (!user) continue;

      const chatName = user.name || user.email.split('@')[0];
      const messageText = buildMeetingMessageText(meeting, chatName);

      const message = new Message({
        sender_id: organizerId,
        receiver_id: user._id,
        content: messageText,
        file_url: null,
        file_name: null,
        file_type: null,
        file_size: null,
        company_id: null,
        is_read: false,
        deleted_for: [],
        deleted_for_everyone: false,
        reactions: [],
        reply_to: null,
      });

      await message.save();

      const populated = await Message.findById(message._id)
        .populate("sender_id", "name avatar_url")
        .populate("receiver_id", "name avatar_url");

      const io = getIO();
      if (io) {
        const receiverSocket = getUserSocketId(user._id);
        if (receiverSocket) io.to(receiverSocket).emit("receive_message", populated);

        const senderSocket = getUserSocketId(organizerId);
        if (senderSocket) io.to(senderSocket).emit("message_sent", populated);
      }

      notifiedContacts.push(user._id);
    } catch (err) {
      console.error(`Failed to send meeting message to contact ${contactId}:`, err);
    }
  }

  return notifiedContacts;
}

async function notifySelectedGroups(meeting, organizerId, groupIds) {
  const notifiedGroups = [];

  for (const groupId of groupIds) {
    try {
      const group = await Group.findOne({
        _id: groupId,
        "members.user_id": organizerId,
        is_active: true,
      }).populate("members.user_id", "name email");

      if (!group) continue;

      const io = getIO();
      const groupName = group.name || 'Group';
      const membersList = group.members.map(m => m.user_id.name || m.user_id.email?.split('@')[0] || 'Member').join(', ');
      const messageText = `📢 Meeting notification for ${groupName}\n\n${buildMeetingMessageText(meeting, `Team ${groupName}`)}\n\n👥 Members: ${membersList}`;

      const groupMessage = new GroupMessage({
        group_id: groupId,
        sender_id: organizerId,
        company_id: group.company_id,
        content: messageText,
        system_message: false,
        read_by: [{ user_id: organizerId, read_at: new Date() }],
        reactions: [],
        deleted_for: [],
        deleted_for_everyone: false,
      });

      await groupMessage.save();

      const populated = await GroupMessage.findById(groupMessage._id)
        .populate("sender_id", "name avatar_url");

      await Group.findByIdAndUpdate(groupId, {
        last_message: groupMessage._id,
        last_message_time: groupMessage.createdAt,
      });

      if (io) {
        for (const member of group.members) {
          const memberId = String(member.user_id._id || member.user_id);
          const socketId = getUserSocketId(memberId);
          if (socketId) {
            io.to(socketId).emit("group_message", {
              group_id: groupId,
              message: {
                ...populated.toObject(),
                group_name: group.name,
              },
            });
          }
        }
      }

      notifiedGroups.push(groupId);
    } catch (err) {
      console.error(`Failed to send meeting message to group ${groupId}:`, err);
    }
  }

  return notifiedGroups;
}

exports.getMeetings = async (req, res) => {
  try {
    const { date, status, search } = req.query;
    const company_id = req.user.company_id;

    const query = {
      company_id,
      is_deleted: false,
    };

    if (date) query.date = date;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { agenda: { $regex: search, $options: "i" } },
      ];
    }

    const meetings = await Meeting.find(query)
      .sort({ date: 1, time: 1 })
      .populate("created_by", "name email avatar")
      .populate("meeting_messages.user_id", "name email avatar")
      .populate("presentation.shared_by", "name email avatar");

    res.json({ success: true, data: meetings });
  } catch (error) {
    console.error("Get meetings error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching meetings" });
  }
};

exports.createMeeting = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      title,
      date,
      time,
      end_time,
      duration,
      location,
      description,
      attendees,
      is_virtual,
      meeting_link,
      agenda,
      recording,
      notify_groups = true,
      notify_contacts = true,
      selected_groups = [],
      selected_contacts = [],
      notification_type = "both",
    } = req.body;

    if (!title || !date || !time) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Title, date and time are required",
      });
    }

    const meetingCode = await generateUniqueMeetingCode();
    const normalizedAttendees = normalizeAttendees(attendees);

    const meetingData = {
      title,
      date,
      time,
      end_time: end_time || time,
      duration: duration || 60,
      location: location || "",
      description: description || "",
      attendees: normalizedAttendees,
      is_virtual: is_virtual !== undefined ? is_virtual : true,
      meeting_link: meeting_link || "",
      agenda: agenda || "",
      meeting_code: meetingCode,
      recording: recording || { enabled: false },
      created_by: req.user.id,
      company_id: req.user.company_id,
      notified_groups: [],
      notified_contacts: [],
      notification_type,
    };

    const meeting = new Meeting(meetingData);
    await meeting.save({ session });

    await session.commitTransaction();

    const notificationResults = {
      contacts: [],
      groups: [],
    };

    if (notification_type === "contacts" || notification_type === "both") {
      if (selected_contacts.length > 0) {
        notificationResults.contacts = await notifySelectedContacts(meeting, req.user.id, selected_contacts);
      } else {
        notificationResults.contacts = await notifyAttendeesInChat(meeting, req.user.id);
      }
    }

    if (notification_type === "groups" || notification_type === "both") {
      if (selected_groups.length > 0) {
        notificationResults.groups = await notifySelectedGroups(meeting, req.user.id, selected_groups);
      } else if (notify_groups) {
        notificationResults.groups = await notifyAttendeesInGroupChat(meeting, req.user.id);
      }
    }

    await Meeting.findByIdAndUpdate(meeting._id, {
      $set: {
        notified_contacts: notificationResults.contacts,
        notified_groups: notificationResults.groups,
      }
    });

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate("created_by", "name email avatar")
      .populate("meeting_messages.user_id", "name email avatar")
      .populate("presentation.shared_by", "name email avatar");

    res.status(201).json({
      success: true,
      data: populatedMeeting,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create meeting error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while creating meeting",
    });
  } finally {
    session.endSession();
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    if (meeting.created_by.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this meeting" });
    }

    let newAttendeeEmails = [];
    if (updates.attendees) {
      const existingEmails = (meeting.attendees || []).map((a) => a.email);
      const normalized = normalizeAttendees(updates.attendees);
      newAttendeeEmails = normalized
        .map((a) => a.email)
        .filter((email) => !existingEmails.includes(email));
      updates.attendees = normalized;
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        meeting[key] = updates[key];
      }
    });

    await meeting.save();

    if (newAttendeeEmails.length > 0) {
      const newOnly = {
        ...meeting.toObject(),
        attendees: meeting.attendees.filter((a) => newAttendeeEmails.includes(a.email)),
      };
      await notifyAttendeesInChat(newOnly, req.user.id);
      await notifyAttendeesInGroupChat(newOnly, req.user.id);
    }

    const updatedMeeting = await Meeting.findById(meeting._id)
      .populate("created_by", "name email avatar")
      .populate("meeting_messages.user_id", "name email avatar")
      .populate("presentation.shared_by", "name email avatar");

    res.json({ success: true, data: updatedMeeting });
  } catch (error) {
    console.error("Update meeting error:", error);
    res.status(500).json({ success: false, message: "Server error while updating meeting" });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    if (meeting.created_by.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this meeting" });
    }

    meeting.is_deleted = true;
    await meeting.save();

    res.json({ success: true, message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Delete meeting error:", error);
    res.status(500).json({ success: false, message: "Server error while deleting meeting" });
  }
};

exports.getMeetingLink = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const meetingLink = buildMeetingLink(meeting);

    if (!meeting.meeting_link) {
      meeting.meeting_link = meetingLink;
      await meeting.save();
    }

    res.json({
      success: true,
      data: {
        meeting_link: meeting.meeting_link,
        meeting_code: meeting.meeting_code,
        meeting_id: meeting._id,
      },
    });
  } catch (error) {
    console.error("Get meeting link error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching meeting link" });
  }
};

exports.getMeetingByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const meeting = await Meeting.findOne({
      meeting_code: code,
      is_deleted: false,
    })
      .populate("created_by", "name email avatar")
      .populate("meeting_messages.user_id", "name email avatar");

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const meetingLink = buildMeetingLink(meeting);

    if (!meeting.meeting_link) {
      meeting.meeting_link = meetingLink;
      await meeting.save();
    }

    res.json({ success: true, data: meeting });
  } catch (error) {
    console.error("Get meeting by code error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching meeting" });
  }
};

exports.getMeetingParticipants = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    res.json({
      success: true,
      data: {
        attendees: meeting.attendees || [],
        participant_count: meeting.analytics?.participant_count || 0,
      },
    });
  } catch (error) {
    console.error("Get meeting participants error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching participants" });
  }
};

exports.joinMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    if (meeting.status === "cancelled") {
      return res.status(400).json({ success: false, message: "This meeting has been cancelled" });
    }

    const userEmail = req.user.email;
    const userName = req.user.name || userEmail;

    if (!meeting.attendees || meeting.attendees.length === 0) {
      meeting.attendees = [{
        email: userEmail,
        name: userName,
        response_status: "accepted",
        joined_at: new Date(),
      }];
    } else if (typeof meeting.attendees[0] === 'string') {
      if (!meeting.attendees.includes(userEmail)) {
        meeting.attendees.push(userEmail);
      }
    } else {
      const existingAttendee = meeting.attendees.find((a) => a.email === userEmail);

      if (!existingAttendee) {
        meeting.attendees.push({
          email: userEmail,
          name: userName,
          response_status: "accepted",
          joined_at: new Date(),
        });
      } else {
        existingAttendee.response_status = "accepted";
        existingAttendee.joined_at = new Date();
      }
    }

    meeting.analytics.participant_count += 1;
    meeting.analytics.max_participants = Math.max(
      meeting.analytics.max_participants,
      meeting.analytics.participant_count
    );

    if (meeting.status === "scheduled") {
      meeting.status = "ongoing";
    }

    await meeting.save();

    const meetingLink = buildMeetingLink(meeting);

    res.json({
      success: true,
      message: "Successfully joined the meeting",
      data: {
        meeting_link: meetingLink,
        meeting_code: meeting.meeting_code,
        meeting_id: meeting._id,
      },
    });
  } catch (error) {
    console.error("Join meeting error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error while joining meeting" });
  }
};

exports.leaveMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const userEmail = req.user.email;

    if (meeting.attendees && meeting.attendees.length > 0 && typeof meeting.attendees[0] === 'object') {
      const attendee = meeting.attendees.find((a) => a.email === userEmail);

      if (attendee) {
        attendee.left_at = new Date();
        attendee.response_status = "declined";
        meeting.analytics.participant_count = Math.max(0, meeting.analytics.participant_count - 1);
      }
    } else if (meeting.attendees && meeting.attendees.length > 0 && typeof meeting.attendees[0] === 'string') {
      const index = meeting.attendees.indexOf(userEmail);
      if (index > -1) {
        meeting.attendees.splice(index, 1);
        meeting.analytics.participant_count = Math.max(0, meeting.analytics.participant_count - 1);
      }
    }

    if (meeting.analytics.participant_count === 0 && meeting.status === "ongoing") {
      meeting.status = "completed";
    }

    await meeting.save();

    res.json({ success: true, message: "Successfully left the meeting" });
  } catch (error) {
    console.error("Leave meeting error:", error);
    res.status(500).json({ success: false, message: "Server error while leaving meeting" });
  }
};

exports.addMeetingMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    meeting.meeting_messages.push({
      user_id: req.user.id,
      message: message,
      timestamp: new Date(),
    });

    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate("meeting_messages.user_id", "name email avatar");

    res.json({ success: true, data: populatedMeeting.meeting_messages });
  } catch (error) {
    console.error("Add meeting message error:", error);
    res.status(500).json({ success: false, message: "Server error while adding message" });
  }
};

exports.getMeetingMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    }).populate("meeting_messages.user_id", "name email avatar");

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    res.json({ success: true, data: meeting.meeting_messages });
  } catch (error) {
    console.error("Get meeting messages error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching messages" });
  }
};

exports.sharePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const { file_id, file_name } = req.body;

    if (!file_id || !file_name) {
      return res.status(400).json({ success: false, message: "File ID and name are required" });
    }

    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    meeting.presentation = {
      file_id,
      file_name,
      shared_by: req.user.id,
      shared_at: new Date(),
    };

    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate("presentation.shared_by", "name email avatar");

    res.json({ success: true, data: populatedMeeting.presentation });
  } catch (error) {
    console.error("Share presentation error:", error);
    res.status(500).json({ success: false, message: "Server error while sharing presentation" });
  }
};

exports.getMeetingAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const analytics = {
      meeting_code: meeting.meeting_code,
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      status: meeting.status,
      total_attendees: meeting.attendees ? meeting.attendees.length : 0,
      participant_count: meeting.analytics.participant_count,
      max_participants: meeting.analytics.max_participants,
      average_join_time: meeting.analytics.average_join_time,
      total_duration: meeting.analytics.total_duration,
      attendees: meeting.attendees || [],
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Get meeting analytics error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching analytics" });
  }
};

exports.notifyGroupAboutMeeting = async (req, res) => {
  try {
    const { id, groupId } = req.params;
    
    const meeting = await Meeting.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    if (meeting.created_by.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only organizer can send notifications" });
    }

    const group = await Group.findOne({
      _id: groupId,
      "members.user_id": req.user.id,
      is_active: true,
    }).populate("members.user_id", "name email");

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found or you're not a member" });
    }

    const io = getIO();
    const groupName = group.name || 'Group';
    const membersList = group.members.map(m => m.user_id.name || m.user_id.email?.split('@')[0] || 'Member').join(', ');
    const messageText = `📢 Meeting notification for ${groupName}\n\n${buildMeetingMessageText(meeting, `Team ${groupName}`)}\n\n👥 Members: ${membersList}`;

    const groupMessage = new GroupMessage({
      group_id: groupId,
      sender_id: req.user.id,
      company_id: group.company_id,
      content: messageText,
      system_message: false,
      read_by: [{ user_id: req.user.id, read_at: new Date() }],
      reactions: [],
      deleted_for: [],
      deleted_for_everyone: false,
    });

    await groupMessage.save();

    const populated = await GroupMessage.findById(groupMessage._id)
      .populate("sender_id", "name avatar_url");

    await Group.findByIdAndUpdate(groupId, {
      last_message: groupMessage._id,
      last_message_time: groupMessage.createdAt,
    });

    if (io) {
      for (const member of group.members) {
        const memberId = String(member.user_id._id || member.user_id);
        const socketId = getUserSocketId(memberId);
        if (socketId) {
          io.to(socketId).emit("group_message", {
            group_id: groupId,
            message: {
              ...populated.toObject(),
              group_name: group.name,
            },
          });
        }
      }
    }

    await Meeting.findByIdAndUpdate(id, {
      $addToSet: { notified_groups: groupId }
    });

    res.json({ 
      success: true, 
      message: "Meeting notification sent to group" 
    });
  } catch (error) {
    console.error("Error sending meeting to group:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while sending notification" 
    });
  }
};