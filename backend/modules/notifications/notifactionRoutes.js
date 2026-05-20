const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");
const Notification = require("../../models/Notification");


router.get("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const notifications = await Notification.find({ user_id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notifications,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get("/unread-count", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const count = await Notification.countDocuments({
      user_id,
      is_read: false,
    });

    res.json({
      success: true,
      count,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user_id, ticket_id, type, message } = req.body;

    if (!user_id || !type || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const notification = await Notification.create({
      user_id,
      ticket_id: ticket_id || null,
      type,
      message,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/mark-all-read", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    await Notification.updateMany(
      { user_id, is_read: false },
      { $set: { is_read: true } }
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/clear-all", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    await Notification.deleteMany({ user_id });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id/read", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    await Notification.findOneAndUpdate(
      { _id: id, user_id },
      { is_read: true }
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;