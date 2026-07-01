const Payroll = require("../../models/Payroll");
const Employee = require("../../models/Employee");
const Company = require("../../models/Company");
const SalaryAdvance = require("../../models/SalaryAdvance");
const { sendPayslipEmail } = require("../../utils/emailHelper");

exports.getPayrollList = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const employees = await Employee.find({ 
      company_id: companyId,
      status: "active"
    })
      .populate("department_id", "department_name")
      .sort({ name: 1 });

    const data = [];

    for (let emp of employees) {
      const latestPayroll = await Payroll.findOne({ employee_id: emp._id })
        .sort({ pay_date: -1 });

      const activeAdvances = await SalaryAdvance.find({
        employee_id: emp._id,
        status: { $in: ["approved", "partially_recovered"] },
        is_fully_recovered: false
      });

      const totalOutstanding = activeAdvances.reduce((sum, adv) => sum + adv.remaining_amount, 0);
      const monthlyAdvanceDeduction = activeAdvances.reduce((sum, adv) => sum + (adv.monthly_deduction || 0), 0);

      let payment_status = "Unpaid";

      if (latestPayroll && latestPayroll.pay_date) {
        const now = new Date();
        const payDate = new Date(latestPayroll.pay_date);

        if (
          payDate.getMonth() === now.getMonth() &&
          payDate.getFullYear() === now.getFullYear()
        ) {
          payment_status = "Paid";
        }
      }

      data.push({
        payroll_id: latestPayroll?._id || null,
        employee_id: emp._id,
        name: emp.name,
        email: emp.email,
        department_name: emp.department_id?.department_name || null,
        salary: emp.salary,
        bonus: latestPayroll?.bonus || 0,
        allowances: latestPayroll?.allowances || 0,
        deductions: latestPayroll?.deductions || 0,
        tax: latestPayroll?.tax || 0,
        pf: latestPayroll?.pf || 0,
        pt: latestPayroll?.pt || 0,
        esi: latestPayroll?.esi || 0,
        advance_deduction: latestPayroll?.advance_deduction || 0,
        total_deductions: latestPayroll?.total_deductions || 0,
        last_net_salary: latestPayroll?.net_salary || 0,
        pay_date: latestPayroll?.pay_date || null,
        pay_period: latestPayroll?.pay_period || null,
        notes: latestPayroll?.notes || null,
        payment_status,
        outstanding_advances: totalOutstanding,
        monthly_advance_deduction: monthlyAdvanceDeduction
      });
    }

    res.json({ success: true, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load payroll list" });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const {
      employee_id,
      pay_date,
      pay_period,
      salary,
      bonus,
      bonus_reason,
      allowances,
      allowance_reason,
      deductions,
      deduction_reason,
      notes,
    } = req.body;

    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const activeAdvances = await SalaryAdvance.find({
      employee_id: employee_id,
      status: { $in: ["approved", "partially_recovered"] },
      is_fully_recovered: false,
      remaining_amount: { $gt: 0 }
    });

    let totalAdvanceDeduction = 0;
    const recoveryDetails = [];

    for (const advance of activeAdvances) {
      const months = advance.repayment_months > 0 ? advance.repayment_months : 1;
      let deductionAmount = advance.monthly_deduction > 0
        ? advance.monthly_deduction
        : advance.amount / months;

      if (advance.remaining_amount < deductionAmount) {
        deductionAmount = advance.remaining_amount;
      }

      totalAdvanceDeduction += deductionAmount;
      recoveryDetails.push({
        advance_id: advance._id,
        amount: deductionAmount,
        remaining_before: advance.remaining_amount,
        remaining_after: advance.remaining_amount - deductionAmount
      });
    }

    const base = parseFloat(salary || employee.salary || 0);
    const bonusAmt = parseFloat(bonus || 0);
    const allowanceAmt = parseFloat(allowances || 0);
    const customDeductionAmt = parseFloat(deductions || 0);

    const pf = base * 0.12;
    const pt = base > 15000 ? 200 : 0;
    const esi = base * 0.0075;
    const tax = 0;

    const grossSalary = base + bonusAmt + allowanceAmt;
    const statutoryDeductions = pf + pt + esi + tax;
    const totalDeductions = statutoryDeductions + customDeductionAmt + totalAdvanceDeduction;
    const netSalary = grossSalary - totalDeductions;

    const payroll = new Payroll({
      employee_id,
      salary: base,
      bonus: bonusAmt,
      bonus_reason,
      allowances: allowanceAmt,
      allowance_reason,
      deductions: customDeductionAmt,
      deduction_reason,
      pf,
      pt,
      tax,
      esi,
      advance_deduction: totalAdvanceDeduction,
      advance_recoveries: recoveryDetails,
      total_deductions: totalDeductions,
      net_salary: netSalary,
      pay_date: pay_date || new Date(),
      pay_period: pay_period || `${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      notes,
    });

    await payroll.save();

    for (const recovery of recoveryDetails) {
      const advance = await SalaryAdvance.findById(recovery.advance_id);
      if (advance) {
        advance.total_recovered += recovery.amount;
        advance.remaining_amount -= recovery.amount;
        advance.deducted_amount += recovery.amount;

        advance.recovery_installments.push({
          payroll_id: payroll._id,
          amount: recovery.amount,
          recovered_date: new Date(),
          pay_period: pay_period || `${new Date().getMonth() + 1}/${new Date().getFullYear()}`
        });

        if (advance.remaining_amount <= 0) {
          advance.remaining_amount = 0;
          advance.is_fully_recovered = true;
          advance.status = "recovered";
        } else {
          advance.status = "partially_recovered";
        }

        await advance.save();
      }
    }

    const company = await Company.findById(employee.company_id);
    if (employee.email && company) {
      sendPayslipEmail({
        name: employee.name,
        email: employee.email,
        companyName: company.company_name,
        employeeId: employee._id,
        payrollId: payroll._id,
        baseSalary: base,
        bonus: bonusAmt,
        bonusReason: bonus_reason,
        allowances: allowanceAmt,
        allowanceReason: allowance_reason,
        pf,
        pt,
        tds: tax,
        esi,
        customDeductions: customDeductionAmt,
        customDeductionReason: deduction_reason,
        advanceDeduction: totalAdvanceDeduction,
        totalDeductions: totalDeductions,
        grossSalary: grossSalary,
        netSalary,
        payDate: payroll.pay_date,
        payPeriod: payroll.pay_period,
        notes: notes || "",
      }).catch(err =>
        console.error("Payslip email failed:", err.message)
      );
    }

    res.json({
      success: true,
      msg: "Payment processed successfully",
      data: {
        ...payroll._doc,
        gross_salary: grossSalary,
        statutory_deductions: statutoryDeductions,
        advance_recoveries: recoveryDetails,
        pf,
        pt,
        tds: tax,
        esi,
      },
    });

  } catch (err) {
    console.error("Process Payment Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMyPayslips = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await Employee.findOne({ user_id: userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const payslips = await Payroll.find({
      employee_id: employee._id,
    })
      .sort({ pay_date: -1 })
      .populate({
        path: "employee_id",
        populate: { path: "department_id" }
      });

    res.json({
      success: true,
      data: payslips,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to load payslips",
    });
  }
};

exports.downloadPayslip = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id)
      .populate({
        path: "employee_id",
        populate: { path: "department_id" },
      });

    if (!payroll) {
      return res.status(404).json({
        error: "Payslip not found",
      });
    }

    res.json({
      success: true,
      data: payroll,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error fetching payslip",
    });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const payroll = await Payroll.findById(id).populate("employee_id");

    if (
      !payroll ||
      payroll.employee_id.company_id.toString() !== companyId.toString()
    ) {
      return res.status(404).json({
        error: "Record not found",
      });
    }

    if (payroll.advance_recoveries && payroll.advance_recoveries.length > 0) {
      for (const recovery of payroll.advance_recoveries) {
        const advance = await SalaryAdvance.findById(recovery.advance_id);
        if (advance) {
          advance.total_recovered -= recovery.amount;
          advance.remaining_amount += recovery.amount;
          advance.deducted_amount -= recovery.amount;
          
          advance.recovery_installments = advance.recovery_installments.filter(
            inst => inst.payroll_id.toString() !== id
          );
          
          if (advance.remaining_amount > 0) {
            advance.is_fully_recovered = false;
            advance.status = "approved";
          }
          
          await advance.save();
        }
      }
    }

    await Payroll.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Payroll record deleted",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Delete failed",
    });
  }
};

exports.getAllPayrollHistory = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const employees = await Employee.find({ company_id: companyId }).select("_id");
    const empIds = employees.map(e => e._id);

    const history = await Payroll.find({
      employee_id: { $in: empIds },
    })
      .sort({ pay_date: -1 })
      .populate("employee_id");

    const result = history.map(p => ({
      ...p._doc,
      payment_status: "Paid",
    }));

    res.json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to load history",
    });
  }
};

exports.getAdvanceDeductions = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const companyId = req.user.company_id;

    const employee = await Employee.findOne({
      _id: employee_id,
      company_id: companyId
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const activeAdvances = await SalaryAdvance.find({
      employee_id: employee_id,
      status: { $in: ["approved", "partially_recovered"] },
      is_fully_recovered: false,
      remaining_amount: { $gt: 0 }
    });

    const totalMonthlyDeduction = activeAdvances.reduce((sum, a) => sum + (a.monthly_deduction || 0), 0);
    const totalOutstanding = activeAdvances.reduce((sum, a) => sum + a.remaining_amount, 0);

    res.json({
      success: true,
      data: {
        advances: activeAdvances,
        total_monthly_deduction: totalMonthlyDeduction,
        total_outstanding: totalOutstanding
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch advance deductions" });
  }
};