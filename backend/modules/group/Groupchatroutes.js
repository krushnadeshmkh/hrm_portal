const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const gc = require("./Groupchatcontroller");

router.post("/", auth, gc.uploadMiddleware, gc.createGroup);
router.get("/", auth, gc.getMyGroups);
router.get("/contacts", auth, gc.getAvailableContacts);
router.get("/:groupId", auth, gc.getGroupById);
router.put("/:groupId", auth, gc.uploadMiddleware, gc.updateGroup);
router.delete("/:groupId", auth, gc.deleteGroup);
router.get("/:groupId/messages", auth, gc.getGroupMessages);
router.post("/:groupId/members", auth, gc.addMembers);
router.delete("/:groupId/members/:memberId", auth, gc.removeMember);
router.put("/:groupId/members/:memberId/admin", auth, gc.makeAdmin);
router.delete("/messages/:messageId", auth, gc.deleteGroupMessage);
router.post("/messages/:messageId/react", auth, gc.reactToGroupMessage);

module.exports = router;