const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const DocGiaService = require("../services/docgia.service");

// Có thể đưa vào .env sau này
const JWT_SECRET = "docgia-secret";
const JWT_EXPIRES = "7d";

// =========================
// 📌 ĐĂNG KÝ ĐỘC GIẢ
// =========================
exports.register = async (req, res, next) => {
  try {
    const {maDG, matKhau, hoLot, ten, ngaySinh, gioiTinh, diaChi, soDienThoai, email, vaiTro } = req.body || {};

    if (!ten || !email || !matKhau) {
      return next(new ApiError(400, "Thiếu thông tin bắt buộc (tên, email, mật khẩu)"));
    }

    const docGiaService = new DocGiaService(MongoDB.client);
    const existed = await docGiaService.findByEmail(email);
    if (existed) {
      return next(new ApiError(409, "Email đã được đăng ký"));
    }

    // Mã hoá mật khẩu
    const passwordHash = await bcrypt.hash(matKhau, 10);

    const newDocGia = await docGiaService.create({
      maDG,
      passwordHash,
      hoLot,
      ten,
      ngaySinh: ngaySinh ? new Date(ngaySinh) : null,
      gioiTinh: Boolean(gioiTinh),
      diaChi,
      soDienThoai,
      email,
    });

    res.status(201).json({ message: "Đăng ký thành công", docGia: newDocGia });
  } catch (err) {
    next(new ApiError(500, err.message || "Lỗi khi đăng ký độc giả"));
  }
};

// =========================
// 📌 ĐĂNG NHẬP
// =========================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return next(new ApiError(400, "Thiếu email hoặc mật khẩu"));
    }

    const docGiaService = new DocGiaService(MongoDB.client);
    const docGia = await docGiaService.findByEmail(email);
    if (!docGia) {
      return next(new ApiError(401, "Sai email hoặc mật khẩu"));
    }

    const ok = await bcrypt.compare(password, docGia.passwordHash);
    if (!ok) {
      return next(new ApiError(401, "Sai email hoặc mật khẩu"));
    }

    // Tạo token JWT
    const token = jwt.sign(
      {
        sub: docGia._id,
        email: docGia.email,
        ten: docGia.ten,
        role: "docgia",
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({ message: "Đăng nhập thành công", token });
  } catch (err) {
    next(new ApiError(500, err.message || "Đăng nhập thất bại"));
  }
};

// =========================
// 📌 LẤY THÔNG TIN CÁ NHÂN (/me)
// =========================
exports.me = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(new ApiError(500, "Không lấy được thông tin người dùng"));
  }
};
