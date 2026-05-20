const express = require("express");
const router = express.Router();

const User = require("../models/User");

const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `admin_${req.user.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        department: user.department || "Administration",
        role: "Admin",
        avatar: user.avatar_url
          ? `${req.protocol}://${req.get("host")}${user.avatar_url}`
          : null,
        joined_at: user.createdAt,
      },
    });
  } catch (err) {
    console.error("GET profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", auth, upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, department } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.file && user.avatar_url) {
      const oldPath = path.join(__dirname, "..", user.avatar_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarUrl = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : user.avatar_url;

    user.name = name;
    user.email = email;
    user.phone = phone || null;
    user.department = department || "Administration";
    user.avatar_url = avatarUrl;

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("UPDATE profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/avatar", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user || !user.avatar_url) {
      return res.status(404).json({ message: "No avatar found" });
    }

    const filePath = path.join(__dirname, "..", user.avatar_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    user.avatar_url = null;
    await user.save();

    res.json({ message: "Avatar deleted successfully" });
  } catch (err) {
    console.error("DELETE avatar error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/change-password", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Both fields required" });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: "Min 6 characters required" });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;