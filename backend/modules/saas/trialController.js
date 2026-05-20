const User = require("../../models/User");
const Company = require("../../models/Company");
const TrialRequest = require("../../models/TrialRequest");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $nin: ["super_admin", "software_owner"] }
    }).populate("company_id");

    const formatted = users.map(u => {
      let days_left = null;

      if (u.company_id?.is_trial) {
        const trialEnd = u.trial_end || new Date(u.createdAt.getTime() + 15 * 86400000);
        const diff = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));
        days_left = Math.max(diff, 0);
      }

      return {
        ...u.toObject(),
        days_left
      };
    });

    res.json({ success: true, data: formatted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findById(user_id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (["super_admin", "software_owner"].includes(user.role)) {
      return res.status(403).json({ message: "Cannot suspend super admin" });
    }

    user.is_active = false;
    await user.save();

    res.json({ success: true, data: user });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.reactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.user_id,
      { is_active: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, data: user });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.extendTrial = async (req, res) => {
  try {
    const { days } = req.body;
    const user = await User.findById(req.params.user_id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const baseDate = user.trial_end || new Date(user.createdAt.getTime() + 15 * 86400000);

    const newDate = new Date(Math.max(baseDate, new Date()));
    newDate.setDate(newDate.getDate() + parseInt(days));

    user.trial_end = newDate;
    user.is_active = true;

    await user.save();

    res.json({ success: true, data: user });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyTrial = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("company_id");

    if (!user || !user.company_id) {
      return res.json({ success: true, data: null });
    }

    const trialEnd = user.trial_end || new Date(user.createdAt.getTime() + 15 * 86400000);
    const days_left = Math.max(
      Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24)),
      0
    );

    res.json({
      success: true,
      data: {
        company_name: user.company_id.company_name,
        trial_end: trialEnd,
        days_left
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.requestExtension = async (req, res) => {
  try {
    const { message, days_requested } = req.body;

    const existing = await TrialRequest.findOne({
      company_id: req.user.company_id,
      requested_by: req.user.id,
      status: "pending"
    });

    if (existing) {
      return res.status(400).json({ message: "Already requested" });
    }

    const request = await TrialRequest.create({
      company_id: req.user.company_id,
      requested_by: req.user.id,
      message,
      days_requested
    });

    res.status(201).json({ success: true, data: request });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};