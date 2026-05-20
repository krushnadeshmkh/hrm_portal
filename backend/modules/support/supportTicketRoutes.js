const express = require("express");
const router = express.Router();

const SupportTicket = require("../../models/SupportTicket");
const User = require("../../models/User");

const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");

const {
  createNotification,
  getCompanyAdmins,
  getSuperAdmins,
} = require("../notifications/notificationHelper");

const isAdmin = roleCheck(["company_admin", "super_admin", "software_owner"]);

router.post("/", auth, async (req, res) => {
  try {
    const { id: userId, company_id } = req.user;
    const { subject, message } = req.body;

    if (!subject)
      return res.status(400).json({ message: "Subject required" });

    const user = await User.findById(userId);

    const ticket = await SupportTicket.create({
      user_id: userId,
      company_id,
      subject,
      messages: [
        {
          role: "user",
          sender: user.name,
          content: message || "Ticket created",
        },
      ],
    });

    const admins = [
      ...(await getCompanyAdmins(company_id)),
      ...(await getSuperAdmins()),
    ];

    for (let adminId of [...new Set(admins)]) {
      await createNotification(
        adminId,
        "new_ticket",
        `New ticket from ${user.name}: "${subject}"`,
        ticket._id
      );
    }

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post("/:id/message", auth, async (req, res) => {
  try {
    const { id: userId, role, company_id } = req.user;
    const { content, message } = req.body;
    const finalContent = content || message;
    if (!finalContent || finalContent.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    ticket.messages.push({
      role: role === "employee" ? "user" : "admin",
      sender: user.name,
      content: finalContent,
    });

    if (role !== "employee") {
      ticket.admin_reply = finalContent;
      ticket.replied_by = userId;
      ticket.replied_at = new Date();
      ticket.status = "inprogress";
    }

    await ticket.save();
    if (role === "employee") {
      const admins = [
        ...(await getCompanyAdmins(company_id)),
        ...(await getSuperAdmins()),
      ];

      for (let adminId of [...new Set(admins)]) {
        await createNotification(
          adminId,
          "employee_message",
          `${user.name}: "${finalContent.slice(0, 50)}"`,
          ticket._id
        );
      }
    } else {
      await createNotification(
        ticket.user_id,
        "admin_reply",
        `${user.name}: "${finalContent.slice(0, 50)}"`,
        ticket._id
      );
    }

    res.json({
      success: true,
      data: ticket,
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
router.get("/", auth, isAdmin, async (req, res) => {
  try {
    const { role, company_id } = req.user;

    const query =
      role === "super_admin" || role === "software_owner"
        ? {}
        : { company_id };

    const tickets = await SupportTicket.find(query)
      .populate("user_id", "name email")
      .populate("replied_by", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      user_id: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/count", auth, isAdmin, async (req, res) => {
  try {
    const { role, company_id } = req.user;

    const query =
      role === "super_admin" || role === "software_owner"
        ? { status: "open" }
        : { status: "open", company_id };

    const count = await SupportTicket.countDocuments(query);

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/react", auth, async (req, res) => {
  try {
    const { messageIndex, emoji } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    const key = `message-${messageIndex}`;

    ticket.reactions.set(key, ticket.reactions.get(key) || {});
    const reactionObj = ticket.reactions.get(key);

    reactionObj[emoji] = reactionObj[emoji] || [];

    const idx = reactionObj[emoji].indexOf(req.user.id);

    if (idx === -1) reactionObj[emoji].push(req.user.id);
    else reactionObj[emoji].splice(idx, 1);

    ticket.markModified("reactions");

    await ticket.save();

    res.json({ success: true, reactions: ticket.reactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id/message", auth, async (req, res) => {
  try {
    const { messageIndex } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    ticket.messages.splice(messageIndex, 1);

    await ticket.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/status", auth, isAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    await SupportTicket.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;