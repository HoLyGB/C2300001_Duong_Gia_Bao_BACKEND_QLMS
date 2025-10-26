const express = require("express");
const nhaXuatBan = require("../controllers/nhaxuatban.controller");
const router = express.Router();

router.route("/")
    // 2. Trỏ các hàm xử lý đến controller của nhà xuất bản
    .get(nhaXuatBan.findAll)
    .post(nhaXuatBan.create)
    .delete(nhaXuatBan.deleteAll);

// 3. Route "/:id" giữ nguyên cấu trúc
router.route("/:id")
    .get(nhaXuatBan.findOne)
    .put(nhaXuatBan.update)
    .delete(nhaXuatBan.delete);

module.exports = router;