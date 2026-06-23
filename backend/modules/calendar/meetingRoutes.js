const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");
const {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingLink,
  getMeetingByCode,
  getMeetingParticipants,
  joinMeeting,
  leaveMeeting,
  addMeetingMessage,
  getMeetingMessages,
  sharePresentation,
  getMeetingAnalytics,
  notifyGroupAboutMeeting,
} = require("./meetingController");

router.get("/", auth, roleCheck(["employee", "manager", "super_admin"]), getMeetings);
router.post("/", auth, roleCheck(["employee", "manager", "super_admin"]), createMeeting);
router.put("/:id", auth, roleCheck(["employee", "manager", "super_admin"]), updateMeeting);
router.delete("/:id", auth, roleCheck(["employee", "manager", "super_admin"]), deleteMeeting);
router.get("/:id/link", auth, roleCheck(["employee", "manager", "super_admin"]), getMeetingLink);
router.get("/by-code/:code", auth, roleCheck(["employee", "manager", "super_admin"]), getMeetingByCode);
router.get("/:id/participants", auth, roleCheck(["employee", "manager", "super_admin"]), getMeetingParticipants);
router.post("/:id/join", auth, roleCheck(["employee", "manager", "super_admin"]), joinMeeting);
router.post("/:id/leave", auth, roleCheck(["employee", "manager", "super_admin"]), leaveMeeting);
router.post("/:id/messages", auth, roleCheck(["employee", "manager", "super_admin"]), addMeetingMessage);
router.get("/:id/messages", auth, roleCheck(["employee", "manager", "super_admin"]), getMeetingMessages);
router.post("/:id/presentation", auth, roleCheck(["employee", "manager", "super_admin"]), sharePresentation);
router.get("/:id/analytics", auth, roleCheck(["employee", "manager", "super_admin"]), getMeetingAnalytics);
router.post("/:id/notify-group/:groupId", auth, roleCheck(["manager", "super_admin"]), notifyGroupAboutMeeting);

module.exports = router;