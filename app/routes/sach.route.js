const express = require("express");
const sach = require("../controllers/sach.controller");
const router = express.Router();
const upload = require("../middlewares/upload");

  
router.route("/")
 
    .get(sach.findAll)
    .delete(sach.deleteAll)
    .post(upload.single("hinhAnh"), sach.create);
router.route("/:id")
    .get(sach.findOne)
  .put(upload.single("hinhAnh"), sach.update)
    .delete(sach.delete);

module.exports = router;