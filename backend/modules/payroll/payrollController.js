const Payroll = require("../../models/Payroll");
const Employee = require("../../models/Employee");
const Company = require("../../models/Company");
const Department = require("../../models/Department");

const { sendPayslipEmail } = require("../../utils/emailHelper");

exports.getPayrollList = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const employees = await Employee.find({ company_id: companyId })
      .populate("department_id", "department_name")
      .sort({ name: 1 });

    const data = [];

    for (let emp of employees) {
      const latestPayroll = await Payroll.findOne({ employee_id: emp._id })
        .sort({ pay_date: -1 });

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

        salary: latestPayroll?.salary || 0,
        bonus: latestPayroll?.bonus || 0,
        allowances: latestPayroll?.allowances || 0,
        deductions: latestPayroll?.deductions || 0,
        tax: latestPayroll?.tax || 0,
        last_net_salary: latestPayroll?.net_salary || 0,

        pay_date: latestPayroll?.pay_date || null,
        pay_period: latestPayroll?.pay_period || null,
        notes: latestPayroll?.notes || null,

        payment_status,
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
      tax,
      tax_reason,
      notes,
    } = req.body;

    const base = parseFloat(salary || 0);
    const bonusAmt = parseFloat(bonus || 0);
    const allowanceAmt = parseFloat(allowances || 0);
    const deductionAmt = parseFloat(deductions || 0);
    const taxAmt = parseFloat(tax || 0);

    const netSalary =
      base + bonusAmt + allowanceAmt - deductionAmt - taxAmt;

    const payroll = await Payroll.create({
      employee_id,
      salary: base,
      bonus: bonusAmt,
      bonus_reason,
      allowances: allowanceAmt,
      allowance_reason,
      deductions: deductionAmt,
      deduction_reason,
      tax: taxAmt,
      tax_reason,
      net_salary: netSalary,
      pay_date: pay_date || new Date(),
      pay_period,
      notes,
    });

    const emp = await Employee.findById(employee_id);
    const company = await Company.findById(emp.company_id);

    if (emp && company) {
      sendPayslipEmail({
        name: emp.name,
        email: emp.email,
        companyName: company.company_name,
        employeeId: emp._id,
        payrollId: payroll._id,
        baseSalary: base,
        bonus: bonusAmt,
        bonusReason: bonus_reason,
        allowances: allowanceAmt,
        allowanceReason: allowance_reason,
        deductions: deductionAmt,
        deductionReason: deduction_reason,
        tax: taxAmt,
        taxReason: tax_reason,
        netSalary,
        payDate: payroll.pay_date,
        payPeriod: pay_period || "",
        notes: notes || "",
      }).catch(err =>
        console.error("Payslip email failed:", err.message)
      );
    }

    res.json({
      success: true,
      msg: "Payment processed and email sent",
      data: payroll,
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
      .populate("employee_id");

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
    const companyId = req.user.company_id;

    const payroll = await Payroll.findById(id)
      .populate({
        path: "employee_id",
        populate: { path: "department_id" },
      });

    if (
      !payroll ||
      payroll.employee_id.company_id.toString() !== companyId.toString()
    ) {
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
      payroll.employee_id.company_id !== companyId
    ) {
      return res.status(404).json({
        error: "Record not found",
      });
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