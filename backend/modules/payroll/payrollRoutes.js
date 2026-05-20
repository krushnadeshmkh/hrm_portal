const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");

const payrollController = require("./payrollController");

const isAdmin = roleCheck(["company_admin", "super_admin"]);
const isEmployee = roleCheck(["employee", "company_admin", "super_admin"]);
router.get("/", auth, isAdmin, payrollController.getPayrollList);
router.get("/history", auth, isAdmin, payrollController.getAllPayrollHistory);
router.post("/generate", auth, isAdmin, payrollController.processPayment);
router.get("/my-payslips", auth, isEmployee, payrollController.getMyPayslips);
router.get("/download/:id", auth, isAdmin, payrollController.downloadPayslip);
router.delete("/:id", auth, isAdmin, payrollController.deletePayroll);

module.exports = router;