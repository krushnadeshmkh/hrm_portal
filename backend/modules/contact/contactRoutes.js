const express = require("express");
const router = express.Router();

const Contact = require("../../models/Contact");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email address",
      });
    }

    const newMessage = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      data: newMessage,
    });

  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: messages,
    });

  } catch (err) {
    console.error("Contact fetch error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        msg: "Message not found",
      });
    }

    return res.json({
      success: true,
      message: "Message deleted",
    });

  } catch (err) {
    console.error("Contact delete error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

module.exports = router;