const express = require("express");
const router = express.Router();

const verifyToken = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadAttachment");

const {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
} = require("./attechmentController");

router.post("/:ticketId", verifyToken, upload.single("file"), uploadAttachment);
router.get("/:ticketId", verifyToken, getAttachments);

router.delete("/file/:attachmentId", verifyToken, deleteAttachment);

module.exports = router;