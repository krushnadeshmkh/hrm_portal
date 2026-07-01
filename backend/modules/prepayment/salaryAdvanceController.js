const SalaryAdvance = require("../../models/SalaryAdvance");
const Employee = require("../../models/Employee");

exports.getAllAdvances = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const advances = await SalaryAdvance.find({ company_id: companyId })
      .populate({
        path: "employee_id",
        select: "name email salary designation company_id"
      })
      .populate({
        path: "approved_by",
        select: "name email"
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: advances });
  } catch (err) {
    console.error("Error in getAllAdvances:", err);
    res.status(500).json({ error: "Failed to fetch advances", details: err.message });
  }
};

exports.getAdvancesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const companyId = req.user.company_id;

    const advances = await SalaryAdvance.find({ 
      status, 
      company_id: companyId 
    })
      .populate({
        path: "employee_id",
        select: "name email salary designation company_id"
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: advances });
  } catch (err) {
    console.error("Error in getAdvancesByStatus:", err);
    res.status(500).json({ error: "Failed to fetch advances" });
  }
};

exports.requestAdvance = async (req, res) => {
  try {
    const { employee_id, amount, reason, repayment_months, notes } = req.body;

    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (employee.status !== "active") {
      return res.status(400).json({ 
        error: "Only active employees can request salary advances" 
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Please enter a valid amount" });
    }

    const months = Number(repayment_months);
    if (!Number.isInteger(months) || months < 1 || months > 24) {
      return res.status(400).json({
        error: "Repayment months must be a whole number between 1 and 24"
      });
    }

    const maxAdvance = employee.salary * 0.5;
    if (amount > maxAdvance) {
      return res.status(400).json({
        error: `Maximum advance amount is 50% of salary (₹${maxAdvance.toLocaleString()})`
      });
    }

    const pendingRequest = await SalaryAdvance.findOne({
      employee_id,
      status: "pending"
    });

    if (pendingRequest) {
      return res.status(400).json({ 
        error: "You already have a pending salary advance request" 
      });
    }

    const activeAdvances = await SalaryAdvance.find({
      employee_id,
      status: { $in: ["approved", "partially_recovered"] },
      is_fully_recovered: false
    });

    const totalOutstanding = activeAdvances.reduce((sum, adv) => sum + adv.remaining_amount, 0);
    if (totalOutstanding + amount > maxAdvance) {
      return res.status(400).json({
        error: `Total outstanding advances (₹${totalOutstanding.toLocaleString()}) plus this request exceeds the maximum limit`
      });
    }

    const monthlyDeduction = amount / months;

    const advance = new SalaryAdvance({
      employee_id,
      company_id: employee.company_id,
      amount,
      reason,
      repayment_months: months,
      monthly_deduction: monthlyDeduction,
      remaining_amount: amount,
      notes
    });

    await advance.save();

    res.status(201).json({ 
      success: true, 
      data: advance,
      message: "Advance request submitted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMyAdvances = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await Employee.findOne({ user_id: userId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const advances = await SalaryAdvance.find({
      employee_id: employee._id
    }).sort({ requested_date: -1 });

    res.json({ success: true, data: advances });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch advances" });
  }
};

exports.updateAdvanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason, notes } = req.body;

    const advance = await SalaryAdvance.findById(id);
    if (!advance) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (advance.status === "recovered" || advance.is_fully_recovered) {
      return res.status(400).json({ 
        error: "Cannot modify a fully recovered advance" 
      });
    }

    const userId = req.user.id;

    if (status === "approved") {
      if (advance.status === "approved") {
        return res.status(400).json({ error: "Request is already approved" });
      }

      const employee = await Employee.findById(advance.employee_id);
      if (!employee || employee.status !== "active") {
        return res.status(400).json({ 
          error: "Employee is not active. Cannot approve advance" 
        });
      }

      if (!advance.repayment_months || advance.repayment_months < 1) {
        advance.repayment_months = 1;
      }
      const expectedMonthly = advance.amount / advance.repayment_months;
      if (!advance.monthly_deduction || Math.abs(advance.monthly_deduction - expectedMonthly) > 0.01) {
        advance.monthly_deduction = expectedMonthly;
      }
      if (!advance.remaining_amount || advance.remaining_amount > advance.amount) {
        advance.remaining_amount = advance.amount;
      }

      advance.status = "approved";
      advance.approved_date = new Date();
      advance.approved_by = userId;
      
      if (notes) advance.notes = notes;

    } else if (status === "rejected") {
      if (advance.status === "approved") {
        return res.status(400).json({ 
          error: "Cannot reject an already approved request" 
        });
      }

      if (!rejection_reason) {
        return res.status(400).json({ 
          error: "Rejection reason is required" 
        });
      }

      advance.status = "rejected";
      advance.rejected_date = new Date();
      advance.rejected_by = userId;
      advance.rejection_reason = rejection_reason;
      advance.notes = notes || advance.notes;

    } else {
      return res.status(400).json({ error: "Invalid status" });
    }

    await advance.save();

    res.json({ 
      success: true, 
      data: advance,
      message: `Request ${status} successfully`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

exports.deleteAdvance = async (req, res) => {
  try {
    const { id } = req.params;

    const advance = await SalaryAdvance.findById(id);
    if (!advance) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (advance.status === "approved" || 
        advance.status === "partially_recovered" || 
        advance.is_fully_recovered) {
      return res.status(400).json({ 
        error: "Cannot delete approved or recovered advance requests" 
      });
    }

    await SalaryAdvance.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: "Request deleted successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete" });
  }
};

exports.getApprovedAdvancesForEmployee = async (employeeId) => {
  try {
    const advances = await SalaryAdvance.find({
      employee_id: employeeId,
      status: { $in: ["approved", "partially_recovered"] },
      is_fully_recovered: false
    });

    return advances;
  } catch (err) {
    console.error("Error fetching approved advances:", err);
    return [];
  }
};

exports.processAdvanceRecovery = async (employeeId, payrollId, payPeriod) => {
  try {
    const advances = await SalaryAdvance.find({
      employee_id: employeeId,
      status: { $in: ["approved", "partially_recovered"] },
      is_fully_recovered: false,
      remaining_amount: { $gt: 0 }
    });

    const recoveryResults = [];
    let totalDeduction = 0;

    for (const advance of advances) {
      let deductionAmount = advance.monthly_deduction > 0
        ? advance.monthly_deduction
        : advance.amount / (advance.repayment_months || 1);

      if (advance.remaining_amount < deductionAmount) {
        deductionAmount = advance.remaining_amount;
      }

      advance.total_recovered += deductionAmount;
      advance.remaining_amount -= deductionAmount;
      
      advance.recovery_installments.push({
        payroll_id: payrollId,
        amount: deductionAmount,
        recovered_date: new Date(),
        pay_period: payPeriod
      });

      if (advance.remaining_amount <= 0) {
        advance.remaining_amount = 0;
        advance.is_fully_recovered = true;
        advance.status = "recovered";
      } else {
        advance.status = "partially_recovered";
      }

      await advance.save();

      totalDeduction += deductionAmount;
      recoveryResults.push({
        advance_id: advance._id,
        amount: deductionAmount,
        remaining: advance.remaining_amount,
        is_fully_recovered: advance.is_fully_recovered
      });
    }

    return {
      total_deduction: totalDeduction,
      recoveries: recoveryResults
    };
  } catch (err) {
    console.error("Error processing advance recovery:", err);
    throw new Error("Failed to process advance recovery");
  }
};