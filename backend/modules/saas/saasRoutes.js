const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");

const {
  createCompany,
  getCompanies,
  getGlobalSummary,
  getAllUsers,
  deleteCompany,
} = require("./saasController");

const isAdmin = roleCheck(["super_admin", "software_owner"]);



router.post("/companies", auth, isAdmin, createCompany);

router.get("/companies", auth, isAdmin, getCompanies);

router.get("/summary", auth, isAdmin, getGlobalSummary);

router.get("/users", auth, isAdmin, getAllUsers);

router.delete("/companies/:id", auth, isAdmin, deleteCompany);


module.exports = router;