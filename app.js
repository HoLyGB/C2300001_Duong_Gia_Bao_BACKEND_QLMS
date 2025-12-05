const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

// --- Import routers ---
const contactsRouter = require("./app/routes/contact.route");
const nxbRouter = require("./app/routes/nhaxuatban.route");
const sachRouter = require("./app/routes/sach.route");
const nhanVienRouter = require("./app/routes/nhanvien.route");
const docGiaRouter = require("./app/routes/docgia.route");
const theodoimuonsachRouter = require("./app/routes/theodoimuonsach.route");
const taiKhoanAuthRouter = require("./app/routes/taikhoan.route");
console.log("✅ Routes loaded: /api/taikhoan");


// --- Routes ---
app.use("/api/contacts", contactsRouter);
app.use("/api/nhaxuatban", nxbRouter);
app.use("/api/sach", sachRouter);
app.use("/api/nhanvien", nhanVienRouter);
app.use("/api/docgia", docGiaRouter);
app.use("/api/theodoimuonsach", theodoimuonsachRouter);
app.use("/api/taikhoan", taiKhoanAuthRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
app.use((req, res, next) => {
 
  return next(new ApiError(404, "Resource not found"));
});


app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;

