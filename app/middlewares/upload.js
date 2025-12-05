const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu file và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Lưu vào thư mục 'uploads' ở root backend
    // Đảm bảo bạn đã tạo thư mục 'uploads' ngang hàng với file app.js
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    // Đặt tên file = Thời gian hiện tại + Số ngẫu nhiên + Đuôi file gốc
    // Ví dụ: 1763395924-123456.jpg (để tránh bị trùng tên)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = upload;