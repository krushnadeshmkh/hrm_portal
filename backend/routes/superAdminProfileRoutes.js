const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const SuperAdminProfile = require("../models/SuperAdminProfile");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `super_${req.user.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  },
});

const getUserId = (req) => req.user?.id;
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = getUserId(req);

    const user = await User.findById(userId).select("name email createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = await SuperAdminProfile.findOne({ user_id: userId });
    console.log(profile);

    return res.json({
      data: {
        name: user.name,
        email: user.email,
        phone: profile?.phone || null,
        department: profile?.department || "Super Administration",
        role: "Super Admin",
        avatar: profile?.avatar_url
          ? `${req.protocol}://${req.get("host")}${profile.avatar_url}`
          : null,
        joined_at: user.createdAt,
      },
    });
  } catch (err) {
    console.error("GET super admin profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", auth, upload.single("avatar"), async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, email, phone, department } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email required" });
    }

    let avatarUrl = null;

    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    let profile = await SuperAdminProfile.findOne({ user_id: userId });

    if (!profile) {
      profile = new SuperAdminProfile({
        user_id: userId,
        name,
        email,
        phone,
        department,
        avatar_url: avatarUrl,
      });
    } else {
      profile.name = name;
      profile.email = email;
      profile.phone = phone;
      profile.department = department;

      if (avatarUrl) profile.avatar_url = avatarUrl;
    }

    await profile.save();

    await User.findByIdAndUpdate(userId, { name, email });

    res.json({ message: "Super admin profile updated" });
  } catch (err) {
    console.error("UPDATE super admin profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/avatar", auth, async (req, res) => {
  try {
    const userId = getUserId(req);

    const profile = await SuperAdminProfile.findOne({ user_id: userId });

    if (!profile || !profile.avatar_url) {
      return res.status(404).json({ message: "No avatar found" });
    }

    const filePath = path.join(__dirname, "..", profile.avatar_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    profile.avatar_url = null;
    await profile.save();

    res.json({ message: "Avatar removed" });
  } catch (err) {
    console.error("DELETE avatar error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/change-password", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Both fields required" });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: "Min 6 characters required" });
    }

    const user = await User.findById(userId).select("password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;