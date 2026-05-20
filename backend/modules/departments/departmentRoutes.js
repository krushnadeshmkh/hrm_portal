const express = require("express");
const router = express.Router();

const verifyToken = require("../../middleware/authMiddleware");
const checkRole = require("../../middleware/roleCheck");

const Department = require("../../models/Department");

router.get("/", verifyToken, async (req, res) => {
  try {
    const { company_id } = req.user;

    const departments = await Department.find({ company_id })
      .sort({ department_name: 1 });

    res.json({ success: true, data: departments });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { company_id } = req.user;
    const { id } = req.params;

    const department = await Department.findOne({
      _id: id,
      company_id,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.json({ success: true, data: department });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post(
  "/",
  verifyToken,
  checkRole(["company_admin"]),
  async (req, res) => {
    try {
      const { company_id } = req.user;
      const { department_name } = req.body;

      if (!department_name || department_name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Department name is required",
        });
      }

      const exists = await Department.findOne({
        company_id,
        department_name: new RegExp(`^${department_name.trim()}$`, "i"),
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Department already exists",
        });
      }

      const department = await Department.create({
        department_name: department_name.trim(),
        company_id,
      });

      res.status(201).json({
        success: true,
        data: department,
        message: "Department created successfully",
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);


router.put(
  "/:id",
  verifyToken,
  checkRole(["company_admin"]),
  async (req, res) => {
    try {
      const { company_id } = req.user;
      const { id } = req.params;
      const { department_name } = req.body;

      if (!department_name || department_name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Department name is required",
        });
      }

      const exists = await Department.findOne({
        company_id,
        _id: { $ne: id },
        department_name: new RegExp(`^${department_name.trim()}$`, "i"),
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Department name already exists",
        });
      }

      const updated = await Department.findOneAndUpdate(
        { _id: id, company_id },
        { department_name: department_name.trim() },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      res.json({
        success: true,
        data: updated,
        message: "Department updated successfully",
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);


router.delete(
  "/:id",
  verifyToken,
  checkRole(["company_admin"]),
  async (req, res) => {
    try {
      const { company_id } = req.user;
      const { id } = req.params;

      const deleted = await Department.findOneAndDelete({
        _id: id,
        company_id,
      });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      res.json({
        success: true,
        message: "Department deleted successfully",
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;