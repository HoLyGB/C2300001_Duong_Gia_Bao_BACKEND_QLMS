const NhanVienService = require("../services/nhanvien.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// ➕ Thêm nhân viên mới
exports.create = async (req, res, next) => {

    
    // 1. Validate cơ bản
    if (!req.body?.hoTen || !req.body?.maNV) {
        return next(new ApiError(400, "Tên nhân viên và mã nhân viên không được để trống"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);

        // --- BẮT ĐẦU ĐOẠN CODE BẠN ĐANG THIẾU ---
        
        // 2. Check xem mã NV đã có chưa?
        // (Đây chính là chỗ gọi hàm findByMaNV mà nãy giờ mình nhắc)
        const existingMaNV = await nhanVienService.findByMaNV(req.body.maNV);
        if (existingMaNV) {
            return res.status(409).json({ 
                field: "maNV",
                message: "Mã nhân viên này đã tồn tại!" 
            });
        }
        if (req.body.email) {
                    const existingEmail = await nhanVienService.findByEmail(req.body.email);
                    if (existingEmail) {
                        return res.status(409).json({ 
                            field: "email",
                            message: "Email này đã được sử dụng!" 
                        });
                    }
                }
        // 3. Check xem SĐT đã có chưa?
        if (req.body.soDienThoai) {
            const existingSDT = await nhanVienService.findBySDT(req.body.soDienThoai);
            if (existingSDT) {
                return res.status(409).json({ 
                     field: "soDienThoai",
                     message: "Số điện thoại này đã được sử dụng!" 
                });
            }
        }
        // --- KẾT THÚC ĐOẠN CODE THIẾU ---

        // 4. Nếu không trùng thì mới tạo
        const document = await nhanVienService.create(req.body);
        return res.send({ message: "Nhân viên đã được thêm thành công", data: document });

    } catch (error) {
        console.log("Lỗi Server:", error); // Log ra để dễ debug
        return next(new ApiError(500, "Đã xảy ra lỗi khi thêm nhân viên"));
    }
};

// 📋 Lấy danh sách nhân viên
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const { hoTen } = req.query; // tìm theo tên nhân viên nếu có

        if (hoTen) {
            documents = await nhanVienService.findByTen(hoTen);
        } else {
            documents = await nhanVienService.find({});
        }

        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách nhân viên"));
    }
};

// 🔍 Tìm một nhân viên theo ID
exports.findOne = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.findByMaNV(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhân viên"));
        }

        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi tìm nhân viên với id=${req.params.maNV}`)
        );
    }
};

// ✏️ Cập nhật thông tin nhân viên
exports.update = async (req, res, next) => {
    // 1. Kiểm tra dữ liệu rỗng

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const idDangSua = req.params.id; // Lấy ID của nhân viên đang được sửa

        if (req.body.email) {
            const existingEmail = await nhanVienService.findByEmail(req.body.email);
            
            // Logic: Tìm thấy người dùng email này VÀ ID của người đó KHÁC ID đang sửa
            if (existingEmail && existingEmail._id.toString() !== idDangSua) {
                return res.status(409).json({ 
                    field: "email",
                    message: "Email này đã thuộc về nhân viên khác!" 
                });
            }
        }

        // 3. Kiểm tra trùng Số điện thoại
        if (req.body.soDienThoai) {
            const existingSDT = await nhanVienService.findBySDT(req.body.soDienThoai);
            
            // Logic: Tìm thấy SĐT này VÀ ID của người đó KHÁC ID đang sửa
            if (existingSDT && existingSDT._id.toString() !== idDangSua) {
                return res.status(409).json({ 
                    field: "soDienThoai",
                    message: "Số điện thoại này đã thuộc về nhân viên khác!" 
                });
            }
        }
        


        const document = await nhanVienService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhân viên"));
        }

        return res.send({ message: "Nhân viên đã được cập nhật thành công" });

    } catch (error) {
        console.log("Lỗi Update:", error); // Log ra xem lỗi gì
        return next(
            new ApiError(500, `Lỗi khi cập nhật nhân viên với id=${req.params.id}`)
        );
    }
};

// 🗑️ Xóa 1 nhân viên
exports.delete = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.delete(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhân viên"));
        }

        return res.send({ message: "Nhân viên đã được xóa thành công" });
    } catch (error) {
        return next(
            new ApiError(500, `Không thể xóa nhân viên với id=${req.params.id}`)
        );
    }
};

// 🧹 Xóa tất cả nhân viên
exports.deleteAll = async (_req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const deletedCount = await nhanVienService.deleteAll();

        return res.send({
            message: `${deletedCount} nhân viên đã được xóa thành công`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả nhân viên")
        );
    }
};
