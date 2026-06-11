const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

const onlineUsers = new Map();

function addUser(userId, socketId) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
}

function removeUser(userId, socketId) {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) onlineUsers.delete(userId);
}

function isOnline(userId) {
  return onlineUsers.has(userId.toString());
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: no token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id.toString();
    const companyId = socket.user.company_id?.toString();

    addUser(userId, socket.id);
    socket.join(userId);
    if (companyId) socket.join(`company:${companyId}`);
    socket.broadcast.emit("user_online", { userId });

    socket.on("send_message", async ({ receiver_id, content, file_url, file_name, file_type, file_size, reply_to }) => {
      try {
        if (!receiver_id || (!content?.trim() && !file_url)) return;

        const message = await Message.create({
          sender_id: userId,
          receiver_id,
          company_id: companyId,
          content: content?.trim() || "",
          file_url: file_url || null,
          file_name: file_name || null,
          file_type: file_type || null,
          file_size: file_size || null,
          reply_to: reply_to || null,
        });

        const populated = await message.populate([
          { path: "sender_id", select: "name avatar_url" },
          { path: "receiver_id", select: "name avatar_url" },
          { path: "reply_to", select: "content sender_id file_type file_name" },
        ]);

        io.to(receiver_id.toString()).emit("receive_message", populated);
        io.to(userId).emit("message_sent", populated);
      } catch (err) {
        console.error("send_message socket error:", err);
        socket.emit("message_error", { error: "Failed to send message." });
      }
    });

    socket.on("delete_message", async ({ message_id, type, receiver_id }) => {
      try {
        const message = await Message.findById(message_id);
        if (!message) return;

        const isSender = message.sender_id.toString() === userId;

        if (type === "everyone" && isSender) {
          message.deleted_for_everyone = true;
          message.content = "";
          message.file_url = null;
          await message.save();
          io.to(receiver_id.toString()).emit("message_deleted", { message_id, type: "everyone" });
          io.to(userId).emit("message_deleted", { message_id, type: "everyone" });
        } else {
          if (!message.deleted_for.includes(userId)) {
            message.deleted_for.push(userId);
            await message.save();
          }
          socket.emit("message_deleted", { message_id, type: "me" });
        }
      } catch (err) {
        console.error("delete_message socket error:", err);
      }
    });

    socket.on("react_message", async ({ message_id, emoji, receiver_id }) => {
      try {
        const message = await Message.findById(message_id);
        if (!message) return;

        const existingIdx = message.reactions.findIndex(
          r => r.user_id.toString() === userId
        );

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

        const payload = { message_id, reactions: message.reactions };
        io.to(receiver_id.toString()).emit("message_reaction", payload);
        io.to(userId).emit("message_reaction", payload);
      } catch (err) {
        console.error("react_message socket error:", err);
      }
    });

    socket.on("typing_start", ({ receiver_id }) => {
      if (!receiver_id) return;
      io.to(receiver_id.toString()).emit("user_typing", { userId, name: socket.user.name });
    });

    socket.on("typing_stop", ({ receiver_id }) => {
      if (!receiver_id) return;
      io.to(receiver_id.toString()).emit("user_stopped_typing", { userId });
    });

    socket.on("mark_read", async ({ sender_id }) => {
      try {
        await Message.updateMany(
          { sender_id, receiver_id: userId, is_read: false },
          { $set: { is_read: true } }
        );
        io.to(sender_id.toString()).emit("messages_read", { by: userId });
      } catch (err) {
        console.error("mark_read error:", err);
      }
    });

    socket.on("disconnect", () => {
      removeUser(userId, socket.id);
      if (!isOnline(userId)) {
        socket.broadcast.emit("user_offline", { userId });
      }
    });
  });

  return io;
}

module.exports = { setupSocket };