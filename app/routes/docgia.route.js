const express = require("express");
const docgia = require("../controllers/docgia.controller");
const router = express.Router();

router.route("/")
 
    .get(docgia.findAll)
    .post(docgia.create)
    .delete(docgia.deleteAll);

router.route("/:id")
    .get(docgia.findOne)
    .put(docgia.update)
    .delete(docgia.delete);
// Thêm vào trong router
router.route("/:id/password")
    .put(docgia.changePassword); // API đổi mật khẩu
module.exports = router;