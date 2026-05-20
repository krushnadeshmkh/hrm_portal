const express = require("express");
const router = express.Router();

const WebsiteSetting = require("../../models/WebsiteSetting");

const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");

const superOnly = roleCheck(["super_admin", "software_owner"]);


router.get("/", async (req, res) => {
  try {
    const settings = await WebsiteSetting.find();

    const grouped = {};

    settings.forEach((doc) => {
      grouped[doc.section] = Object.fromEntries(doc.settings);
    });

    res.json({ success: true, data: grouped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get("/:section", async (req, res) => {
  try {
    const { section } = req.params;

    const setting = await WebsiteSetting.findOne({ section });

    if (!setting) {
      return res.json({ success: true, data: {} });
    }

    res.json({
      success: true,
      data: Object.fromEntries(setting.settings),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.put("/:section", auth, superOnly, async (req, res) => {
  try {
    const { section } = req.params;
    const fields = req.body;

    let setting = await WebsiteSetting.findOne({ section });

    if (!setting) {
      setting = new WebsiteSetting({
        section,
        settings: fields,
      });
    } else {
      Object.entries(fields).forEach(([key, value]) => {
        setting.settings.set(key, String(value));
      });
    }

    await setting.save();

    res.json({ success: true, message: "Settings saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;