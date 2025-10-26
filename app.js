const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");

const app = express();

app.use(cors());
app.use(express.json());

// --- Import routers ---
const contactsRouter = require("./app/routes/contact.route");
const nxbRouter = require("./app/routes/nhaxuatban.route");
const sachRouter = require("./app/routes/sach.route");
const nhanVienRouter = require("./app/routes/nhanvien.route");

// --- Routes ---
app.use("/api/contacts", contactsRouter);
app.use("/api/nhaxuatban", nxbRouter);
app.use("/api/sach", sachRouter);
app.use("/api/nhanvien", nhanVienRouter);

app.use((req, res, next) => {
 
  return next(new ApiError(404, "Resource not found"));
});


app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;

