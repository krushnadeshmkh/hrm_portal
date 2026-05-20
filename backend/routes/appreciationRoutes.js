const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  sendAppreciation,
  saveDraft,
  getHistory,
  getAppreciationById,
  updateAppreciation,
  getMyAppreciations,
  debugTable,
} = require("../controller/appreciationController");

router.get("/debug/table", authMiddleware, debugTable);

router.post("/send", authMiddleware, sendAppreciation);
router.post("/draft", authMiddleware, saveDraft);

router.get("/history", authMiddleware, getHistory);
router.get("/my", authMiddleware, getMyAppreciations);

router.get("/:id", authMiddleware, getAppreciationById);
router.put("/:id", authMiddleware, updateAppreciation);

module.exports = router;