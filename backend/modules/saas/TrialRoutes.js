const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");

const controller = require("./trialController");

const isSuperAdmin = roleCheck(["super_admin", "software_owner"]);
const isUser = roleCheck(["employee", "company_admin", "super_admin"]);

router.get("/users", auth, isSuperAdmin, controller.getUsers);
router.put("/users/:user_id/suspend", auth, isSuperAdmin, controller.suspendUser);
router.put("/users/:user_id/reactivate", auth, isSuperAdmin, controller.reactivateUser);
router.put("/users/:user_id/extend", auth, isSuperAdmin, controller.extendTrial);

router.get("/my-trial", auth, isUser, controller.getMyTrial);
router.post("/my-trial/request-extension", auth, isUser, controller.requestExtension);

module.exports = router;