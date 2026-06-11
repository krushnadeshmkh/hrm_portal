const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const chatController = require("./chatController");

router.get("/contacts", auth, chatController.getContacts);
router.get("/messages/:userId", auth, chatController.getMessages);
router.get("/unread-count", auth, chatController.getUnreadCount);
router.get("/unread-per-sender", auth, chatController.getUnreadPerSender);
router.post("/upload", auth, chatController.uploadMiddleware, chatController.uploadFile);
router.delete("/messages/:messageId", auth, chatController.deleteMessage);
router.post("/messages/:messageId/react", auth, chatController.reactToMessage);

module.exports = router;