const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");

const {
  getActions,
  reactMessage,
  deleteForMe,
  deleteForEveryone,
} = require("./messageActionController");

router.get("/:ticket_id", auth, getActions);

router.post("/reaction", auth, reactMessage);

router.post("/delete-for-me", auth, deleteForMe);

router.post("/delete-for-everyone", auth, deleteForEveryone);

module.exports = router;