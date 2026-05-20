const express = require("express");
const router = express.Router();

const upload = require("./upload");
const auth = require("../../middleware/authMiddleware");

const {
  uploadPolicy,
  getPolicies,
  deletePolicy,
} = require("./policiesController");

const path = require("path");
const fs = require("fs");
router.post("/upload", auth, (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.log("Upload error:", err.message);
      return res.status(400).json({ message: err.message });
    }
    console.log("User:", req.user?.id);
    console.log("File:", req.file?.filename);

    uploadPolicy(req, res);
  });
});
router.get("/", auth, getPolicies);
router.delete("/:id", auth, deletePolicy);
router.get("/view/:filename", (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      "../../uploads/policies",
      req.params.filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }

    res.sendFile(filePath);

  } catch (err) {
    console.error("View file error:", err);
    res.status(500).send("Error loading file");
  }
});


module.exports = router;