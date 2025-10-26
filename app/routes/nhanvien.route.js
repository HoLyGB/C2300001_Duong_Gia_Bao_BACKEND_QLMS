const express = require("express");
const nhanvien = require("../controllers/nhanvien.controller");
const router = express.Router();

router.route("/")
    // 2. Trỏ các hàm xử lý đến controller của nhà xuất bản
    .get(nhanvien.findAll)
    .post(nhanvien.create)
    .delete(nhanvien.deleteAll);

// 3. Route "/:id" giữ nguyên cấu trúc
router.route("/:id")
    .get(nhanvien.findOne)
    .put(nhanvien.update)
    .delete(nhanvien.delete);

module.exports = router;




