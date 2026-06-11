const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");
const {
  getAllIncrements,
  createIncrement,
  getEmployeeHistory,
  getEmployeeHistoryById,
  deleteIncrement
} = require("./incrementController");

const isAdmin = roleCheck(["manager", "super_admin"]);
const isEmployee = roleCheck(["employee", "manager", "super_admin"]);

router.get("/all", auth, isAdmin, getAllIncrements);
router.post("/create", auth, isAdmin, createIncrement);
router.delete("/:id", auth, isAdmin, deleteIncrement);
router.get("/employee/:employee_id", auth, isAdmin, getEmployeeHistoryById);
router.get("/my-history", auth, isEmployee, getEmployeeHistory);

module.exports = router;