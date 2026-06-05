const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");
const resignationController = require("./Resignationcontroller");

router.post("/", auth, resignationController.submitResignation);
router.get("/my", auth, resignationController.getMyResignation);
router.patch("/:id/withdraw", auth, resignationController.withdrawResignation);

router.get("/", auth, roleCheck(["company_admin", "super_admin"]), resignationController.getAllResignations);
router.patch("/:id/review", auth, roleCheck(["company_admin", "super_admin"]), resignationController.reviewResignation);

module.exports = router;