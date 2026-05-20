const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const MessageAction = require("../models/MessageAction");

router.post("/", auth, async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const {
      ticket_id,
      message_key,
      action_type,
      value = null,
    } = req.body;

    if (!ticket_id || !message_key || !action_type) {
      return res.status(400).json({
        success: false,
        message: "ticket_id, message_key, action_type required",
      });
    }
    if (action_type === "reaction") {
      const existing = await MessageAction.findOne({
        ticket_id,
        message_key,
        user_id,
        action_type,
      });
      if (existing && existing.value === value) {
        await MessageAction.deleteOne({ _id: existing._id });

        return res.json({
          success: true,
          removed: true,
        });
      }

      if (existing) {
        existing.value = value;
        await existing.save();

        return res.json({
          success: true,
          updated: true,
        });
      }
      const created = await MessageAction.create({
        ticket_id,
        message_key,
        user_id,
        action_type,
        value,
      });

      return res.json({
        success: true,
        data: created,
      });
    }
    const action = await MessageAction.create({
      ticket_id,
      message_key,
      user_id,
      action_type,
      value: action_type === "delete_for_everyone" ? "true" : "true",
    });

    return res.json({
      success: true,
      data: action,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Action already exists",
      });
    }

    res.status(500).json({ success: false });
  }
});

router.get("/:ticket_id", auth, async (req, res) => {
  try {
    const actions = await MessageAction.find({
      ticket_id: req.params.ticket_id,
    }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: actions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { ticket_id, message_key, action_type } = req.body;

    await MessageAction.deleteOne({
      ticket_id,
      message_key,
      user_id,
      action_type,
    });

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;