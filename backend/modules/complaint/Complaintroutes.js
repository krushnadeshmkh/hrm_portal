const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");
const complaintController = require("./Complaintcontroller");

router.post("/", auth, complaintController.raiseComplaint);
router.get("/my", auth, complaintController.getMyComplaints);

router.get("/", auth, roleCheck(["company_admin", "super_admin"]), complaintController.getAllComplaints);
router.patch("/:id/resolve", auth, roleCheck(["company_admin", "super_admin"]), complaintController.resolveComplaint);

module.exports = router;