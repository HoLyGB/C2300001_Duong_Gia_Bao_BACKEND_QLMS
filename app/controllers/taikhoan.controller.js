const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const { JWT_SECRET, JWT_EXPIRES } = require("../config/jwt.config");

const NhanVienService = require("../services/nhanvien.service");
const DocGiaService = require("../services/docgia.service");

// --- ĐĂNG KÝ (Giữ nguyên) ---
exports.register = async (req, res, next) => {
    // ... (Code đăng ký cũ của bạn ở đây) ...
    // Nếu bạn chưa có code đăng ký, hãy báo mình gửi lại.
    // Tạm thời return lỗi để tránh crash nếu gọi nhầm
    res.status(400).json({ message: "Tính năng đăng ký đang cập nhật" });
};

// --- ĐĂNG NHẬP (SỬA LẠI THEO ĐÚNG DB) ---
exports.login = async (req, res, next) => {
    try {
        // 1. Lấy username/password từ Frontend
        const body = req.body || {};
        const username = body.username || body.maDG; 
        const password = body.password || body.matKhau;

        if (!username || !password) {
            return next(new ApiError(400, "Vui lòng nhập tài khoản và mật khẩu"));
        }

        let user = null;
        let role = "";
        let dbPassword = ""; 

        // =================================================
        // 🔍 TÌM TRONG BẢNG NHÂN VIÊN (ADMIN)
        // =================================================
        const nhanVienService = new NhanVienService(MongoDB.client);
        
        // ⚠️ LƯU Ý: Bạn cần đảm bảo trong file 'services/nhanvien.service.js' 
        // có hàm findByMaNV hoặc findByMSNV
        // Ở đây mình gọi theo logic chung là tìm theo Mã
        let nhanVien = null;
        try {
             // Thử tìm bằng các hàm có thể bạn đã đặt tên
             if (nhanVienService.findByMaNV) {
                 nhanVien = await nhanVienService.findByMaNV(username);
             } else if (nhanVienService.findByMSNV) {
                 nhanVien = await nhanVienService.findByMSNV(username);
             } else if (nhanVienService.findById) {
                 nhanVien = await nhanVienService.findById(username);
             }
        } catch (e) {
            console.log("Không tìm thấy trong bảng NV");
        }

        if (nhanVien) {
            // ✅ SỬA CHÍNH XÁC THEO DB CỦA BẠN: dùng .matKhau
            dbPassword = nhanVien.matKhau; 
            
            if (dbPassword) {
                const isMatch = await bcrypt.compare(password, dbPassword);
                if (isMatch) {
                    user = nhanVien;
                    if(user.chucVu  === 'Nhân viên mượn trả') {
                        role = "muontra";
                    }if(user.chucVu  === 'Nhân viên kho sách') {
                        role = "khosach";
                    }if(user.chucVu === 'Thủ thư') {
                        role = "thuthu";
                    }if(user.chucVu  === 'Quản lý thư viện') {
                        role = "admin";
                    }
                   
                }
            }
        }

        // =================================================
        // 🔍 TÌM TRONG BẢNG ĐỘC GIẢ (NẾU CHƯA PHẢI ADMIN)
        // =================================================
        if (!user) {
            const docGiaService = new DocGiaService(MongoDB.client);
            const docGia = await docGiaService.findByMaDG(username);

            if (docGia) {
                // Độc giả cũng dùng trường .matKhau (hoặc passwordHash tùy lúc bạn tạo)
                // Mình sẽ check cả 2 cho chắc
                dbPassword = docGia.matKhau || docGia.passwordHash;

                if (dbPassword) {
                    const isMatch = await bcrypt.compare(password, dbPassword);
                    if (isMatch) {
                        user = docGia;
                        role = "docgia";
                    }
                }
            }
        }

        // =================================================
        // ❌ KẾT QUẢ
        // =================================================
        if (!user) {
            return next(new ApiError(401, "Sai tài khoản hoặc mật khẩu"));
        }

        // Tạo Token
        const token = jwt.sign(
            {
                id: user._id,
                // Nếu là admin thì lấy maNV, độc giả thì lấy maDG
                sub: role === 'admin' ? user.maNV : user.maDG,
                role: role,
            },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Trả về kết quả
        return res.json({
            message: "Đăng nhập thành công",
            token,
            role,
            // ✅ SỬA CHÍNH XÁC THEO DB: dùng .hoTen
            hoTen: role === 'admin'|| role === 'thuthu'||role === 'muontra'||role === 'khosach'? user.hoTen : (user.hoLot + " " + user.ten),
            maDG: role === 'docgia' ? user.maDG : null,
            _id: user._id
        });

    } catch (err) {
        console.error(err);
        next(new ApiError(500, "Lỗi server: " + err.message));
    }
};

// --- API /me ---
exports.me = async (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Chưa đăng nhập"));
    res.json({ user: req.user });
};