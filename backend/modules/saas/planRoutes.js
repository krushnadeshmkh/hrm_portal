const express = require("express");
const router = express.Router();

const planController = require("./planController");

const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");
const isSuperAdmin = roleCheck(["super_admin", "software_owner"]);
router.get("/", planController.getPlans);
router.post("/", auth, isSuperAdmin, planController.createPlan);
router.delete("/:id", auth, isSuperAdmin, planController.deletePlan);


module.exports = router;