const Group = require("../../models/Group");
const GroupMessage = require("../../models/Groupmessage");
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

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
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
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("File type not allowed"), false);
  },
  limits: { fileSize: 25 * 1024 * 1024 },
});

exports.uploadMiddleware = upload.single("file");

exports.createGroup = async (req, res) => {
  try {
    const { name, description, member_ids } = req.body;
    const userId = req.user.id;
    const companyId = req.user.company_id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Group name is required." });
    }

    let parsedMembers = [];
    if (member_ids) {
      parsedMembers = Array.isArray(member_ids) ? member_ids : JSON.parse(member_ids);
    }

    const uniqueMembers = [...new Set([...parsedMembers.map(String), String(userId)])];

    const members = uniqueMembers.map((uid) => ({
      user_id: uid,
      role: uid === String(userId) ? "admin" : "member",
      joined_at: new Date(),
      muted: false,
    }));

    const group = await Group.create({
      name: name.trim(),
      description: description || "",
      company_id: companyId,
      created_by: userId,
      members,
      avatar_url: req.file ? `/uploads/chat/${req.file.filename}` : null,
      is_active: true,
    });

    const populated = await Group.findById(group._id)
      .populate("members.user_id", "name email avatar_url")
      .populate("created_by", "name email");

    await GroupMessage.create({
      group_id: group._id,
      sender_id: userId,
      company_id: companyId,
      content: `Group "${name.trim()}" was created`,
      system_message: true,
      system_type: "group_created",
    });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("createGroup Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;

    const groups = await Group.find({
      company_id: companyId,
      "members.user_id": userId,
      is_active: true,
    })
      .populate("members.user_id", "name email avatar_url")
      .populate("created_by", "name email")
      .sort({ last_message_time: -1, createdAt: -1 });

    const groupsWithData = await Promise.all(
      groups.map(async (g) => {
        const lastMsg = await GroupMessage.findOne({
          group_id: g._id,
          deleted_for_everyone: false,
          deleted_for: { $nin: [userId] },
        })
          .sort({ createdAt: -1 })
          .populate("sender_id", "name");

        let preview = null;
        let senderName = null;

        if (lastMsg) {
          if (lastMsg.system_message) {
            preview = lastMsg.content;
          } else if (lastMsg.file_type) {
            preview = `📎 ${lastMsg.file_name || "File"}`;
          } else {
            preview = lastMsg.content;
          }
          senderName = lastMsg.sender_id?.name || null;
        }

        return {
          ...g.toObject(),
          last_message_preview: preview,
          last_message_sender: senderName,
          last_message_time: lastMsg?.createdAt || g.createdAt,
        };
      })
    );

    res.json({ success: true, data: groupsWithData });
  } catch (err) {
    console.error("getMyGroups Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      "members.user_id": userId,
      is_active: true,
    })
      .populate("members.user_id", "name email avatar_url")
      .populate("created_by", "name email");

    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found." });
    }

    res.json({ success: true, data: group });
  } catch (err) {
    console.error("getGroupById Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 30;

    const group = await Group.findOne({ _id: groupId, "members.user_id": userId, is_active: true });
    if (!group) {
      return res.status(403).json({ success: false, error: "Not a member of this group." });
    }

    const query = {
      group_id: groupId,
      deleted_for_everyone: false,
      deleted_for: { $nin: [userId] },
    };

    const totalCount = await GroupMessage.countDocuments(query);

    const messages = await GroupMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("sender_id", "name avatar_url")
      .populate("reply_to", "content sender_id file_type file_name");

    messages.reverse();

    const unreadIds = messages
      .filter((m) => 
        !m.system_message && 
        String(m.sender_id?._id || m.sender_id) !== String(userId) && 
        !m.read_by.some((r) => String(r.user_id) === String(userId))
      )
      .map((m) => m._id);

    if (unreadIds.length > 0) {
      await GroupMessage.updateMany(
        { _id: { $in: unreadIds } },
        { $addToSet: { read_by: { user_id: userId, read_at: new Date() } } }
      );
    }

    res.json({ success: true, data: messages, totalCount });
  } catch (err) {
    console.error("getGroupMessages Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { name, description } = req.body;

    const group = await Group.findOne({ _id: groupId, is_active: true });
    if (!group) return res.status(404).json({ success: false, error: "Group not found." });

    const member = group.members.find((m) => String(m.user_id) === String(userId));
    if (!member || member.role !== "admin") {
      return res.status(403).json({ success: false, error: "Only admins can update group settings." });
    }

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (req.file) updates.avatar_url = `/uploads/chat/${req.file.filename}`;

    const updated = await Group.findByIdAndUpdate(groupId, updates, { new: true })
      .populate("members.user_id", "name email avatar_url")
      .populate("created_by", "name email");

    if (name && name.trim() !== group.name) {
      await GroupMessage.create({
        group_id: groupId,
        sender_id: userId,
        company_id: group.company_id,
        content: `Group renamed to "${name.trim()}"`,
        system_message: true,
        system_type: "group_renamed",
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateGroup Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { member_ids } = req.body;
    const userId = req.user.id;

    const group = await Group.findOne({ _id: groupId, is_active: true });
    if (!group) return res.status(404).json({ success: false, error: "Group not found." });

    const member = group.members.find((m) => String(m.user_id) === String(userId));
    if (!member || member.role !== "admin") {
      return res.status(403).json({ success: false, error: "Only admins can add members." });
    }

    const existingIds = group.members.map((m) => String(m.user_id));
    const newIds = member_ids.filter((id) => !existingIds.includes(String(id)));

    if (newIds.length === 0) {
      return res.status(400).json({ success: false, error: "All users are already members." });
    }

    const newMembers = newIds.map((id) => ({ user_id: id, role: "member", joined_at: new Date(), muted: false }));
    group.members.push(...newMembers);
    await group.save();

    const newUsers = await User.find({ _id: { $in: newIds } }, "name");
    const names = newUsers.map((u) => u.name).join(", ");

    await GroupMessage.create({
      group_id: groupId,
      sender_id: userId,
      company_id: group.company_id,
      content: `${names} joined the group`,
      system_message: true,
      system_type: "member_added",
    });

    const updated = await Group.findById(groupId)
      .populate("members.user_id", "name email avatar_url")
      .populate("created_by", "name email");

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("addMembers Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({ _id: groupId, is_active: true });
    if (!group) return res.status(404).json({ success: false, error: "Group not found." });

    const requester = group.members.find((m) => String(m.user_id) === String(userId));
    const isSelf = String(memberId) === String(userId);

    if (!isSelf && (!requester || requester.role !== "admin")) {
      return res.status(403).json({ success: false, error: "Only admins can remove members." });
    }

    const targetMember = group.members.find((m) => String(m.user_id) === String(memberId));
    if (!targetMember) {
      return res.status(404).json({ success: false, error: "Member not found in group." });
    }

    group.members = group.members.filter((m) => String(m.user_id) !== String(memberId));
    await group.save();

    const targetUser = await User.findById(memberId, "name");
    const sysContent = isSelf ? `${targetUser?.name} left the group` : `${targetUser?.name} was removed from the group`;

    await GroupMessage.create({
      group_id: groupId,
      sender_id: userId,
      company_id: group.company_id,
      content: sysContent,
      system_message: true,
      system_type: isSelf ? "member_left" : "member_removed",
    });

    const updated = await Group.findById(groupId)
      .populate("members.user_id", "name email avatar_url")
      .populate("created_by", "name email");

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("removeMember Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({ _id: groupId, is_active: true });
    if (!group) return res.status(404).json({ success: false, error: "Group not found." });

    const requester = group.members.find((m) => String(m.user_id) === String(userId));
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({ success: false, error: "Only admins can promote members." });
    }

    const target = group.members.find((m) => String(m.user_id) === String(memberId));
    if (!target) return res.status(404).json({ success: false, error: "Member not found." });

    target.role = target.role === "admin" ? "member" : "admin";
    await group.save();

    const updated = await Group.findById(groupId)
      .populate("members.user_id", "name email avatar_url")
      .populate("created_by", "name email");

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("makeAdmin Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({ _id: groupId, is_active: true });
    if (!group) return res.status(404).json({ success: false, error: "Group not found." });

    const member = group.members.find((m) => String(m.user_id) === String(userId));
    if (!member || member.role !== "admin") {
      return res.status(403).json({ success: false, error: "Only admins can delete the group." });
    }

    await GroupMessage.deleteMany({ group_id: groupId });
    await Group.findByIdAndDelete(groupId);
    
    res.json({ success: true, message: "Group deleted." });
  } catch (err) {
    console.error("deleteGroup Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    const message = await GroupMessage.findById(messageId);
    if (!message) return res.status(404).json({ success: false, error: "Message not found." });

    const isSender = String(message.sender_id) === String(userId);

    if (type === "everyone") {
      if (!isSender) return res.status(403).json({ success: false, error: "Only sender can delete for everyone." });
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

    res.json({ success: true });
  } catch (err) {
    console.error("deleteGroupMessage Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.reactToGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await GroupMessage.findById(messageId);
    if (!message) return res.status(404).json({ success: false, error: "Message not found." });

    const idx = message.reactions.findIndex((r) => String(r.user_id) === String(userId));
    if (idx !== -1) {
      if (message.reactions[idx].emoji === emoji) message.reactions.splice(idx, 1);
      else message.reactions[idx].emoji = emoji;
    } else {
      message.reactions.push({ user_id: userId, emoji });
    }

    await message.save();
    res.json({ success: true, reactions: message.reactions });
  } catch (err) {
    console.error("reactToGroupMessage Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAvailableContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;

    const employees = await Employee.find({
      company_id: companyId,
      user_id: { $ne: userId },
    }).populate("user_id", "_id name email");

    const contacts = employees
      .filter((e) => e.user_id)
      .map((e) => ({
        user_id: e.user_id._id,
        name: e.user_id.name,
        email: e.user_id.email,
      }));

    res.json({ success: true, data: contacts });
  } catch (err) {
    console.error("getAvailableContacts Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};