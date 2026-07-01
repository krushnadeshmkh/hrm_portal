const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");
const payrollController = require("./payrollController");

const isManager = roleCheck(["manager", "super_admin"]);
const isEmployee = roleCheck(["employee", "manager", "super_admin"]);

router.get("/", auth, isManager, payrollController.getPayrollList);
router.get("/history", auth, isManager, payrollController.getAllPayrollHistory);
router.post("/generate", auth, isManager, payrollController.processPayment);
router.get("/my-payslips", auth, isEmployee, payrollController.getMyPayslips);
router.get("/download/:id", auth, payrollController.downloadPayslip);
router.delete("/:id", auth, isManager, payrollController.deletePayroll);
router.get("/advance-deductions/:employee_id", auth, isManager, payrollController.getAdvanceDeductions);

module.exports = router;