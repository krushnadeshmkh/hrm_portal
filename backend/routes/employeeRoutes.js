const express = require("express");
const router = express.Router();

const Employee = require("../models/Employee");
router.get("/company/:company_id", async (req, res) => {
  try {
    const { company_id } = req.params;

    const employees = await Employee.find({ company_id })
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name")
      .sort({ _id: 1 });

    res.json({ success: true, data: employees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:employee_id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employee_id)
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({ success: true, data: employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department_id,
      designation_id,
      company_id,
      joining_date,
    } = req.body;

    const employee = await Employee.create({
      name,
      email,
      phone,
      department_id,
      designation_id,
      company_id,
      joining_date: joining_date || Date.now(),
    });

    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:employee_id", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department_id,
      designation_id,
      joining_date,
    } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.employee_id,
      {
        name,
        email,
        phone,
        department_id,
        designation_id,
        joining_date,
      },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({ success: true, data: employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:employee_id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.employee_id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;