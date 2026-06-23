const { Server } = require("socket.io");
const Message = require("../models/Message");
const GroupMessage = require("../models/GroupMessage");
const Group = require("../models/Group");
const Meeting = require("../models/Meeting");
const jwt = require("jsonwebtoken");

const userSockets = new Map();
let ioInstance = null;

function getIO() {
  return ioInstance;
}

function getUserSocketId(userId) {
  return userSockets.get(String(userId));
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:4173",
        "https://hrm-portal-frontend.onrender.com",
      ],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      socket.userName = decoded.name || decoded.email || "User";
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    userSockets.set(userId, socket.id);
    io.emit("user_online", { userId });
    io.emit("user_status_update", { userId, status: "online" });

    socket.on("join-meeting-room", (data) => {
      const { meetingCode, userId: providedUserId, userName, userEmail } = data;

      socket.join(meetingCode);
      socket.currentRoom = meetingCode;
      socket.meetingUserId = providedUserId || socket.userId;
      socket.meetingUserName = userName || socket.userName;
      socket.meetingUserEmail = userEmail || socket.userEmail;

      const room = io.sockets.adapter.rooms.get(meetingCode);
      const participants = [];
      if (room) {
        room.forEach((socketId) => {
          const s = io.sockets.sockets.get(socketId);
          if (s && s.meetingUserId) {
            participants.push({
              userId: s.meetingUserId,
              userName: s.meetingUserName || s.meetingUserId,
              userEmail: s.meetingUserEmail || "",
              socketId: socketId,
            });
          }
        });
      }

      socket.emit("meeting-joined", {
        meetingCode,
        participants,
        joinedAt: new Date(),
      });

      socket.to(meetingCode).emit("user-joined", {
        userId: socket.meetingUserId,
        userName: socket.meetingUserName,
        userEmail: socket.meetingUserEmail,
        socketId: socket.id,
        joinedAt: new Date(),
      });
    });

    socket.on("offer", (data) => {
      const { offer, to } = data;
      socket.to(to).emit("offer", { offer, from: socket.id });
    });

    socket.on("answer", (data) => {
      const { answer, to } = data;
      socket.to(to).emit("answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", (data) => {
      const { candidate, to } = data;
      socket.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    socket.on("meeting-chat-message", (data) => {
      const { message, meetingCode } = data;
      socket.to(meetingCode).emit("new-chat-message", {
        message,
        userName: socket.meetingUserName || "User",
        userId: socket.meetingUserId || socket.userId,
        timestamp: new Date(),
        socketId: socket.id,
      });
    });

    socket.on("toggle-audio", (data) => {
      const { meetingCode, isMuted } = data;
      socket.to(meetingCode).emit("participant-audio-toggled", {
        userId: socket.meetingUserId || socket.userId,
        userName: socket.meetingUserName || socket.userName,
        isMuted,
      });
    });

    socket.on("toggle-video", (data) => {
      const { meetingCode, isVideoOff } = data;
      socket.to(meetingCode).emit("participant-video-toggled", {
        userId: socket.meetingUserId || socket.userId,
        userName: socket.meetingUserName || socket.userName,
        isVideoOff,
      });
    });

    socket.on("start-screen-share", (data) => {
      const { meetingCode } = data;
      socket.to(meetingCode).emit("screen-share-started", {
        userId: socket.meetingUserId || socket.userId,
        userName: socket.meetingUserName || socket.userName,
        socketId: socket.id,
      });
    });

    socket.on("stop-screen-share", (data) => {
      const { meetingCode } = data;
      socket.to(meetingCode).emit("screen-share-stopped", {
        userId: socket.meetingUserId || socket.userId,
        userName: socket.meetingUserName || socket.userName,
      });
    });

    socket.on("raise-hand", (data) => {
      const { meetingCode } = data;
      socket.to(meetingCode).emit("hand-raised", {
        userId: socket.meetingUserId || socket.userId,
        userName: socket.meetingUserName || socket.userName,
      });
    });

    socket.on("lower-hand", (data) => {
      const { meetingCode } = data;
      socket.to(meetingCode).emit("hand-lowered", {
        userId: socket.meetingUserId || socket.userId,
        userName: socket.meetingUserName || socket.userName,
      });
    });

    socket.on("send_message", async (data) => {
      try {
        const { receiver_id, content, reply_to, file_url, file_name, file_type, file_size } = data;

        const message = new Message({
          sender_id: userId,
          receiver_id,
          content: content || "",
          reply_to,
          file_url,
          file_name,
          file_type,
          file_size,
          company_id: null,
          is_read: false,
          deleted_for: [],
          deleted_for_everyone: false,
          reactions: [],
        });

        await message.save();

        const populated = await Message.findById(message._id)
          .populate("sender_id", "name avatar_url")
          .populate("receiver_id", "name avatar_url")
          .populate("reply_to", "content file_type file_name sender_id");

        const receiverSocket = userSockets.get(receiver_id);
        if (receiverSocket) {
          io.to(receiverSocket).emit("receive_message", populated);
        }
        socket.emit("message_sent", populated);
      } catch (err) {
        console.error("Send message error:", err);
        socket.emit("message_error", { error: err.message });
      }
    });

    socket.on("send_group_message", async (data) => {
      try {
        const { group_id, content, reply_to, file_url, file_name, file_type, file_size } = data;

        const group = await Group.findOne({ _id: group_id, is_active: true });
        if (!group) {
          socket.emit("message_error", { error: "Group not found" });
          return;
        }

        const isMember = group.members.some(m => String(m.user_id) === String(userId));
        if (!isMember) {
          socket.emit("message_error", { error: "You are not a member of this group" });
          return;
        }

        const message = new GroupMessage({
          group_id,
          sender_id: userId,
          company_id: group.company_id,
          content: content || "",
          reply_to,
          file_url,
          file_name,
          file_type,
          file_size,
          read_by: [{ user_id: userId, read_at: new Date() }],
          reactions: [],
          deleted_for: [],
          deleted_for_everyone: false,
          system_message: false,
        });

        await message.save();

        const populated = await GroupMessage.findById(message._id)
          .populate("sender_id", "name avatar_url")
          .populate("reply_to", "content file_type file_name sender_id");

        await Group.findByIdAndUpdate(group_id, {
          last_message: message._id,
          last_message_time: message.createdAt,
        });

        const messageData = {
          group_id,
          message: {
            ...populated.toObject(),
            group_name: group.name,
          },
        };

        for (const member of group.members) {
          const memberId = String(member.user_id);
          const memberSocketId = userSockets.get(memberId);
          if (memberSocketId) {
            io.to(memberSocketId).emit("group_message", messageData);
          }
        }
      } catch (err) {
        console.error("Send group message error:", err);
        socket.emit("message_error", { error: err.message });
      }
    });

    socket.on("typing_start", (data) => {
      const { receiver_id } = data;
      const receiverSocket = userSockets.get(receiver_id);
      if (receiverSocket) {
        io.to(receiverSocket).emit("user_typing", { userId });
      }
    });

    socket.on("typing_stop", (data) => {
      const { receiver_id } = data;
      const receiverSocket = userSockets.get(receiver_id);
      if (receiverSocket) {
        io.to(receiverSocket).emit("user_stopped_typing", { userId });
      }
    });

    socket.on("group_typing_start", (data) => {
      const { group_id } = data;
      socket.to(`group_${group_id}`).emit("group_user_typing", { userId, group_id });
    });

    socket.on("group_typing_stop", (data) => {
      const { group_id } = data;
      socket.to(`group_${group_id}`).emit("group_user_stopped_typing", { userId, group_id });
    });

    socket.on("mark_read", async (data) => {
      const { sender_id } = data;
      await Message.updateMany(
        { sender_id, receiver_id: userId, is_read: false },
        { $set: { is_read: true } }
      );
    });

    socket.on("mark_group_read", async (data) => {
      const { group_id } = data;
      await GroupMessage.updateMany(
        { group_id, "read_by.user_id": { $ne: userId } },
        { $addToSet: { read_by: { user_id: userId, read_at: new Date() } } }
      );
    });

    socket.on("delete_message", async (data) => {
      const { message_id, type, receiver_id } = data;
      const message = await Message.findById(message_id);
      if (!message) return;

      if (type === "everyone" && String(message.sender_id) === String(userId)) {
        message.deleted_for_everyone = true;
        message.content = "";
        message.file_url = null;
        await message.save();
        const receiverSocket = userSockets.get(receiver_id);
        if (receiverSocket) {
          io.to(receiverSocket).emit("message_deleted", { message_id, type });
        }
        socket.emit("message_deleted", { message_id, type });
      } else if (type === "me") {
        if (!message.deleted_for.includes(userId)) {
          message.deleted_for.push(userId);
          await message.save();
          socket.emit("message_deleted", { message_id, type });
        }
      }
    });

    socket.on("delete_group_message", async (data) => {
      const { message_id, type, group_id } = data;
      const message = await GroupMessage.findById(message_id);
      if (!message) return;

      const group = await Group.findOne({ _id: group_id });
      if (!group) return;

      if (type === "everyone" && String(message.sender_id) === String(userId)) {
        message.deleted_for_everyone = true;
        message.content = "";
        message.file_url = null;
        await message.save();

        for (const member of group.members) {
          const memberId = String(member.user_id);
          const socketId = userSockets.get(memberId);
          if (socketId) {
            io.to(socketId).emit("group_message_deleted", { message_id, type, group_id });
          }
        }
      } else if (type === "me") {
        if (!message.deleted_for.includes(userId)) {
          message.deleted_for.push(userId);
          await message.save();
          socket.emit("group_message_deleted", { message_id, type, group_id });
        }
      }
    });

    socket.on("react_message", async (data) => {
      const { message_id, emoji, receiver_id } = data;
      const message = await Message.findById(message_id);
      if (!message) return;

      const existingIdx = message.reactions.findIndex(r => String(r.user_id) === String(userId));
      if (existingIdx !== -1) {
        if (message.reactions[existingIdx].emoji === emoji) {
          message.reactions.splice(existingIdx, 1);
        } else {
          message.reactions[existingIdx].emoji = emoji;
        }
      } else {
        message.reactions.push({ user_id: userId, emoji });
      }

      await message.save();

      const receiverSocket = userSockets.get(receiver_id);
      if (receiverSocket) {
        io.to(receiverSocket).emit("message_reaction", { message_id, reactions: message.reactions });
      }
      socket.emit("message_reaction", { message_id, reactions: message.reactions });
    });

    socket.on("react_group_message", async (data) => {
      const { message_id, emoji, group_id } = data;
      const message = await GroupMessage.findById(message_id);
      if (!message) return;

      const existingIdx = message.reactions.findIndex(r => String(r.user_id) === String(userId));
      if (existingIdx !== -1) {
        if (message.reactions[existingIdx].emoji === emoji) {
          message.reactions.splice(existingIdx, 1);
        } else {
          message.reactions[existingIdx].emoji = emoji;
        }
      } else {
        message.reactions.push({ user_id: userId, emoji });
      }

      await message.save();

      const group = await Group.findOne({ _id: group_id });
      if (group) {
        for (const member of group.members) {
          const memberId = String(member.user_id);
          const socketId = userSockets.get(memberId);
          if (socketId) {
            io.to(socketId).emit("group_message_reaction", { message_id, reactions: message.reactions, group_id });
          }
        }
      }
    });

    socket.on("join_group_room", (data) => {
      const { group_id } = data;
      socket.join(`group_${group_id}`);
    });

    socket.on("leave_group_room", (data) => {
      const { group_id } = data;
      socket.leave(`group_${group_id}`);
    });

    socket.on("disconnect", () => {
      userSockets.delete(userId);
      io.emit("user_offline", { userId });
      io.emit("user_status_update", { userId, status: "offline" });

      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit("user-left", {
          userId: socket.meetingUserId || userId,
          userName: socket.meetingUserName || socket.userName,
          socketId: socket.id,
        });
      }
    });
  });

  return io;
}

module.exports = { setupSocket, getIO, getUserSocketId };