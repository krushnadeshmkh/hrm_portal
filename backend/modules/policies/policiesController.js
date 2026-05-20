const Policy = require("../../models/Policy");
const User = require("../../models/User");

const { createNotification, getCompanyAdmins } = require("../notifications/notificationHelper");

const fs = require("fs");
const path = require("path");
exports.uploadPolicy = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const fileName = req.file.filename;

    const policy = await Policy.create({
      title: title.trim(),
      file: fileName,
      company_id: req.user.company_id,
    });

    const company_id = req.user.company_id;
    const adminIds = await getCompanyAdmins(company_id);
    for (let id of adminIds) {
      await createNotification(id, "policy", `📎 New policy attached: ${title}`);
    }
    const employees = await User.find({
      company_id,
      role: "employee",
    }).select("_id");

    for (let emp of employees) {
      await createNotification(emp._id, "policy", `New policy updated: ${title}`);
    }

    res.json({
      message: "Policy uploaded successfully",
      data: policy,
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find()
      .sort({ createdAt: -1 });

    res.json(policies);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Policy ID required" });
    }

    const policy = await Policy.findById(id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const filePath = path.join(
      __dirname,
      "../../uploads/policies",
      policy.file
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Policy.findByIdAndDelete(id);

    res.json({ message: "Policy deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};