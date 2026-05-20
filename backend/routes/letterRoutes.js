const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  sendLetter,
  saveDraft,
  getHistory,
  getLetterById,
  getMyLetters,
} = require("../controller/letterController");

router.post("/send", auth, sendLetter);
router.post("/draft", auth, saveDraft);
router.get("/history", auth, getHistory);
router.get("/my-letters", auth, getMyLetters);
router.get("/:id", auth, getLetterById);

module.exports = router;