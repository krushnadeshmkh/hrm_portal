const Message = require("../../models/Message");
const Employee = require("../../models/Employee");
const User = require("../../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, "../../uploads/chat");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/webm",
    "audio/mpeg", "audio/ogg", "audio/wav",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

function getFileType(mimetype) {
  if (!mimetype) return null;
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  return "document";
}

exports.uploadMiddleware = upload.single("file");

exports.getContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;
    const role = req.user.role;

    const currentEmployee = await Employee.findOne({ user_id: userId })
      .populate("manager_id", "name email")
      .populate("user_id", "name email avatar_url");

    if (!currentEmployee) {
      return res.status(404).json({ success: false, error: "Employee record not found." });
    }

    let contacts = [];

    if (role === "employee") {
      if (!currentEmployee.manager_id) {
        return res.json({ success: true, data: [] });
      }

      const managerEmployee = await Employee.findOne({
        _id: currentEmployee.manager_id,
        company_id: companyId,
      }).populate("user_id", "_id name email avatar_url");

      if (managerEmployee?.user_id) {
        const lastMsg = await Message.findOne({
          $or: [
            { sender_id: userId, receiver_id: managerEmployee.user_id._id },
            { sender_id: managerEmployee.user_id._id, receiver_id: userId },
          ],
        }).sort({ createdAt: -1 });

        contacts = [{
          user_id: managerEmployee.user_id._id,
          name: managerEmployee.user_id.name,
          email: managerEmployee.user_id.email,
          avatar: managerEmployee.user_id.avatar_url || null,
          role: "manager",
          last_message_time: lastMsg?.createdAt || null,
          last_message: lastMsg?.content || null,
        }];
      }
    } else if (role === "manager" || role === "company_admin") {
      const reportees = await Employee.find({
        manager_id: currentEmployee._id,
        company_id: companyId,
      }).populate("user_id", "_id name email avatar_url");

      contacts = await Promise.all(
        reportees
          .filter(e => e.user_id)
          .map(async (e) => {
            const lastMsg = await Message.findOne({
              $or: [
                { sender_id: userId, receiver_id: e.user_id._id },
                { sender_id: e.user_id._id, receiver_id: userId },
              ],
            }).sort({ createdAt: -1 });

            return {
              user_id: e.user_id._id,
              name: e.user_id.name,
              email: e.user_id.email,
              avatar: e.user_id.avatar_url || null,
              role: "employee",
              last_message_time: lastMsg?.createdAt || null,
              last_message: lastMsg?.content || null,
            };
          })
      );
    }

    res.json({ success: true, data: contacts });
  } catch (err) {
    console.error("getContacts Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const myUserId = req.user.id;
    const otherUserId = req.params.userId;
    const companyId = req.user.company_id;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 30;

    const query = {
      deleted_for_everyone: false,
      deleted_for: { $nin: [myUserId] },
      $or: [
        { sender_id: myUserId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: myUserId },
      ],
    };

    if (companyId) {
      query.company_id = companyId;
    }

    const totalCount = await Message.countDocuments(query);

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("sender_id", "name avatar_url")
      .populate("receiver_id", "name avatar_url")
      .populate("reply_to", "content sender_id file_type file_name");

    messages.reverse();

    await Message.updateMany(
      { sender_id: otherUserId, receiver_id: myUserId, is_read: false },
      { $set: { is_read: true } }
    );

    res.json({ success: true, data: messages, totalCount });
  } catch (err) {
    console.error("getMessages Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded." });
    }

    const fileUrl = `/uploads/chat/${req.file.filename}`;
    const fileType = getFileType(req.file.mimetype);

    res.json({
      success: true,
      data: {
        file_url: fileUrl,
        file_name: req.file.originalname,
        file_type: fileType,
        file_size: req.file.size,
      },
    });
  } catch (err) {
    console.error("uploadFile Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found." });
    }

    const isSender = message.sender_id.toString() === userId.toString();

    if (type === "everyone") {
      if (!isSender) {
        return res.status(403).json({ success: false, error: "Only sender can delete for everyone." });
      }
      message.deleted_for_everyone = true;
      message.content = "";
      message.file_url = null;
      await message.save();
    } else {
      if (!message.deleted_for.includes(userId)) {
        message.deleted_for.push(userId);
        await message.save();
      }
    }

    res.json({ success: true, message: "Message deleted." });
  } catch (err) {
    console.error("deleteMessage Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found." });
    }

    const existingIdx = message.reactions.findIndex(
      r => r.user_id.toString() === userId.toString()
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

    res.json({ success: true, reactions: message.reactions });
  } catch (err) {
    console.error("reactToMessage Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver_id: req.user.id,
      is_read: false,
      deleted_for_everyone: false,
      deleted_for: { $ne: req.user.id },
    });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUnreadPerSender = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const result = await Message.aggregate([
      {
        $match: {
          receiver_id: new mongoose.Types.ObjectId(req.user.id),
          is_read: false,
          deleted_for_everyone: false,
          deleted_for: { $ne: new mongoose.Types.ObjectId(req.user.id) },
        },
      },
      { $group: { _id: "$sender_id", count: { $sum: 1 } } },
    ]);

    const map = {};
    result.forEach(r => { map[r._id.toString()] = r.count; });

    res.json({ success: true, data: map });
  } catch (err) {
    console.error("getUnreadPerSender Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};