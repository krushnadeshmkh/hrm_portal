const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  updateGuestStatus,
} = require("./calendarController");

router.get("/events", auth, roleCheck(["employee", "manager", "super_admin"]), getEvents);
router.get("/events/:id", auth, roleCheck(["employee", "manager", "super_admin"]), getEventById);
router.post("/events", auth, roleCheck(["employee", "manager", "super_admin"]), createEvent);
router.put("/events/:id", auth, roleCheck(["employee", "manager", "super_admin"]), updateEvent);
router.delete("/events/:id", auth, roleCheck(["employee", "manager", "super_admin"]), deleteEvent);
router.patch("/events/:id/guest-status", auth, roleCheck(["employee", "manager", "super_admin"]), updateGuestStatus);

module.exports = router;