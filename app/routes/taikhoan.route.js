const express = require("express");
const router = express.Router();
const auth = require("../controllers/taikhoan.controller");
const verifyToken = require("../middlewares/verifyToken.middleware");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/me", verifyToken, auth.me);

module.exports = router;
