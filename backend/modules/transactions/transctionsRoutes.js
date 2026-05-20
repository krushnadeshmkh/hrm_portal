const express = require("express");
const router = express.Router();
const Transaction = require("../../models/Transaction");
const Company = require("../../models/Company");

const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");

const isSuperAdmin = roleCheck(["super_admin", "software_owner"]);
const isAdmin = roleCheck(["company_admin"]);


router.post("/", auth, isSuperAdmin, async (req, res) => {
  try {
    const { company_id, amount, payment_date, note, plan_name,status } = req.body;

    if (!company_id) {
      return res.status(400).json({ success: false, message: "Company is required" });
    }

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: "Valid amount required" });
    }

    
    const transaction = await Transaction.create({
      company_id,
      amount,
      payment_date: payment_date || new Date(),
      note,
      plan_name,
      status,
    });

    res.status(201).json({
      success: true,
      data: transaction,
      message: "Payment submitted successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



router.get("/my", auth, isAdmin, async (req, res) => {
  try {
    const { company_id } = req.user;

    const transactions = await Transaction.find({ company_id })
      .populate("company_id", "company_name")
      .sort({ payment_date: -1 });

    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


router.get("/", auth, isSuperAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("company_id", "company_name")
      .sort({ payment_date: -1, createdAt: -1 });

    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


router.get("/stats", auth, isSuperAdmin, async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    let result = {
      total: 0,
      totalAmount: 0,
      approved: 0,
      approvedAmount: 0,
      pending: 0,
      pendingAmount: 0,
      rejected: 0,
    };

    stats.forEach((s) => {
      result.total += s.count;
      result.totalAmount += s.totalAmount;

      if (s._id === "approved") {
        result.approved = s.count;
        result.approvedAmount = s.totalAmount;
      }
      if (s._id === "pending") {
        result.pending = s.count;
        result.pendingAmount = s.totalAmount;
      }
      if (s._id === "rejected") {
        result.rejected = s.count;
      }
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});




router.put("/:id", auth, isSuperAdmin, async (req, res) => {
  try {
    const { company_id, amount, payment_date, status, note, plan_name } = req.body;

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        company_id,
        amount,
        payment_date,
        status,
        note,
        plan_name,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: updated,
      message: "Transaction updated successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});


router.put("/approve/:id", auth, isSuperAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: "approved", reviewed_at: new Date() },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({
      success: true,
      data: transaction,
      message: "Transaction approved",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


router.put("/reject/:id", auth, isSuperAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        reject_reason: reason || null,
        reviewed_at: new Date(),
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false });
    }

    res.json({
      success: true,
      data: transaction,
      message: "Transaction rejected",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


router.delete("/:id", auth, isSuperAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false });
    }

    res.json({
      success: true,
      message: "Transaction deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;