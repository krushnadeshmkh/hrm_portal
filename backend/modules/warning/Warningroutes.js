const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");
const warningController = require("./Warningcontroller");

router.post("/", auth, roleCheck(["manager", "super_admin"]), warningController.createWarning);
router.get("/", auth, roleCheck(["manager", "super_admin"]), warningController.getWarnings);
router.delete("/:id", auth, roleCheck(["manager", "super_admin"]), warningController.deleteWarning);
router.patch("/:id/status", auth, roleCheck(["manager", "super_admin"]), warningController.updateWarningStatus);

router.get("/my", auth, warningController.getMyWarnings);
router.patch("/:id/acknowledge", auth, warningController.acknowledgeWarning);

module.exports = router;