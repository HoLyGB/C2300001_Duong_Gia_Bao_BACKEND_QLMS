const DocGiaService = require("../services/docgia.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    // 1. Validation cơ bản (nếu cần)
    if (!req.body?.maDG || !req.body?.hoLot || !req.body?.ten) {
         return next(new ApiError(400, "Mã độc giả và Họ tên là bắt buộc"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);

        // --- BẮT ĐẦU CHECK TRÙNG ---

        // 1. Kiểm tra Mã Độc Giả
        const existingMa = await docGiaService.findByMaDG(req.body.maDG);
        if (existingMa) {
            return res.status(409).json({ 
                field: "maDG", 
                message: "Mã độc giả này đã tồn tại!" 
            });
        }

        // 2. Kiểm tra Email (nếu có nhập)
        if (req.body.email) {
            const existingEmail = await docGiaService.findByEmail(req.body.email);
            if (existingEmail) {
                return res.status(409).json({ 
                    field: "email", 
                    message: "Email này đã được sử dụng!" 
                });
            }
        }

        // 3. Kiểm tra Số điện thoại (nếu có nhập)
        if (req.body.soDienThoai) {
            const existingSDT = await docGiaService.findBySDT(req.body.soDienThoai);
            if (existingSDT) {
                return res.status(409).json({ 
                    field: "soDienThoai", 
                    message: "Số điện thoại này đã được sử dụng!" 
                });
            }
        }

        // --- HẾT CHECK TRÙNG ---

        const document = await docGiaService.create(req.body);
        return res.send({ message: "Độc giả được thêm thành công", data: document });

    } catch (error) {
        console.log("Lỗi tạo Độc giả:", error); // Log để debug
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo Độc giả")
        );
    }
};

// Lấy tất cả Độc giả từ CSDL
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const { ten } = req.query; // Tìm kiếm theo tenSach
        if (ten) {
            documents = await docGiaService.findByTen(ten);
        } else {
            documents = await docGiaService.find({});
        }
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách của Độc giả")
        );
    }
};


// Tìm một Độc giả bằng ID
// 1. KIỂM TRA DÒNG NÀY CÓ Ở ĐẦU FILE CHƯA?
const { ObjectId } = require("mongodb"); 

exports.findOne = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const { id } = req.params; 

        let document = null;

        // 2. LOGIC QUAN TRỌNG ĐỂ KHÔNG BỊ SẬP (500)
        // ObjectId.isValid("DG001") trả về FALSE -> Chạy xuống else -> Không bị crash
        if (ObjectId.isValid(id)) {
            document = await docGiaService.findById(id);
        } else {
            // Nếu chạy vào đây mà vẫn lỗi 500 -> Kiểm tra xem Service có hàm findByMaDG chưa?
            document = await docGiaService.findByMaDG(id);
        }

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy Độc giả"));
        }
        return res.send(document);
    } catch (error) {
        console.log("Lỗi Backend:", error); // In lỗi ra xem nó báo gì
        return next(new ApiError(500, `Lỗi Server: ${error.message}`));
    }
};

// Cập nhật thông tin Độc giả bằng ID
exports.update = async (req, res, next) => {
    // Kiểm tra dữ liệu rỗng
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        let idDangSua = req.params.id; // Đang là "DG001"

        // ============================================================
        // --- BƯỚC KHẮC PHỤC LỖI 404: CHUẨN HÓA ID ---
        // Nếu id trên URL không phải là ObjectId chuẩn (nghĩa là nó là DG001)
        // Ta phải tìm xem DG001 này ứng với _id thật là bao nhiêu.
        if (!ObjectId.isValid(idDangSua)) {
            // Tìm người dùng theo mã DG001
            const userFound = await docGiaService.findByMaDG(idDangSua);
            
            if (!userFound) {
                return next(new ApiError(404, "Không tìm thấy Độc giả (Mã sai)"));
            }
            
            // Lấy ID thật (68ff...) gán ngược lại biến idDangSua
            idDangSua = userFound._id.toString();
        }
        // ============================================================

        // --- CHECK TRÙNG LẶP (Logic cũ của bạn) ---
        // 1. Check SĐT
        if (req.body.soDienThoai) {
            const existingSDT = await docGiaService.findBySDT(req.body.soDienThoai);
            if (existingSDT && existingSDT._id.toString() !== idDangSua) {
                return res.status(409).json({ 
                    field: "soDienThoai", 
                    message: "Số điện thoại này đã được sử dụng bởi độc giả khác!" 
                });
            }
        }
        // 2. Check Email (nếu cần)
        if (req.body.email) {
            const existingEmail = await docGiaService.findByEmail(req.body.email);
            if (existingEmail && existingEmail._id.toString() !== idDangSua) {
                return res.status(409).json({ 
                    field: "email", 
                    message: "Email này đã được sử dụng bởi độc giả khác!" 
                });
            }
        }
        // ------------------------------------------

        // --- THỰC HIỆN UPDATE ---
        // Lúc này idDangSua chắc chắn là ID chuẩn, nên hàm update sẽ chạy ngon lành
        const document = await docGiaService.update(idDangSua, req.body);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy Độc giả"));
        }

        return res.send({ message: "Độc giả đã được cập nhật thành công", data: document });

    } catch (error) {
        console.log("Lỗi Update:", error);
        return next(
            new ApiError(500, `Lỗi khi cập nhật Độc giả với id=${req.params.id}`)
        );
    }
};

// Xóa một Độc giả bằng ID
exports.delete = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const document = await docGiaService.delete(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy Độc giả"));
        }

        return res.send({ message: "Độc giả đã được xóa thành công" });
    } catch (error) {
        return next(
            new ApiError(500, `Không thể xóa Độc giả với id=${req.params.id}`)
        );
    }
};

// Xóa tất cả Độc giả
exports.deleteAll = async (_req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const deletedCount = await docGiaService.deleteAll();
        return res.send({
            message: `${deletedCount} Độc giả đã được xóa thành công`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả độc giả")
        );
    }
};
const bcrypt = require("bcryptjs"); // Nhớ require bcrypt ở đầu file

// ... Các hàm cũ giữ nguyên ...

exports.changePassword = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const { id } = req.params;
        const { matKhauCu, matKhauMoi } = req.body;

        if (!matKhauCu || !matKhauMoi) {
            return next(new ApiError(400, "Vui lòng nhập đầy đủ mật khẩu cũ và mới"));
        }

        // 1. Tìm user trong DB
        const user = await docGiaService.findById(id);
        if (!user) {
            return next(new ApiError(404, "Không tìm thấy người dùng"));
        }

        // 2. Kiểm tra mật khẩu cũ có khớp không
        // Lưu ý: User của bạn dùng trường passwordHash hoặc matKhau
        const dbPassword = user.passwordHash || user.matKhau;
        if (!dbPassword) {
             return next(new ApiError(400, "Tài khoản này chưa thiết lập mật khẩu (Đăng ký sai quy cách)"));
        }

        const isMatch = await bcrypt.compare(matKhauCu, dbPassword);
        if (!isMatch) {
            return next(new ApiError(401, "Mật khẩu cũ không chính xác!"));
        }

        // 3. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(matKhauMoi, salt);

        // 4. Cập nhật vào DB
        // Chúng ta tái sử dụng hàm update của Service, chỉ gửi passwordHash
        await docGiaService.update(id, { passwordHash: newPasswordHash });

        return res.send({ message: "Đổi mật khẩu thành công!" });

    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Lỗi khi đổi mật khẩu"));
    }
};