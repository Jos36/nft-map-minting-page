const express = require("express");
const path = require("path");
const { verify } = require("../middleware/auth");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.resolve(path.join(__dirname, "..", "/views/index.html")));
});

module.exports = router;
