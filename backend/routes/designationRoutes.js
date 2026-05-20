const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Designation = require("../models/Designation");


router.get("/", async (req, res) => {
  try {
    const data = await Designation.find()
      .sort({ createdAt: -1 })
      .populate("company_id", "company_name");

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch designations" });
  }
});


router.post("/", async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { designation_name, company_id } = req.body;

    if (!designation_name || !company_id) {
      return res.status(400).json({
        error: "designation_name and company_id are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(company_id)) {
      return res.status(400).json({ error: "Invalid company_id" });
    }


    const companyObjectId = new mongoose.Types.ObjectId(company_id);

    const data = await Designation.create({
      designation_name,
      company_id: companyObjectId,
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const data = await Designation.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Designation not found" });
    }

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete designation" });
  }
});

module.exports = router;