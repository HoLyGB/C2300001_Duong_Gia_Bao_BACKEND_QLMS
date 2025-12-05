const SachService = require("../services/sach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const fs = require("fs"); // Thư viện thao tác file (File System)
const path = require("path"); // Thư viện xử lý đường dẫn
// Hàm xóa file ảnh cũ trên máy tính
const deleteImage = (filename) => {
    if (!filename) return; // Không có tên thì thôi

    // Tạo đường dẫn tuyệt đối tới file ảnh
    // Giả sử thư mục uploads nằm ngang hàng với app.js (như cấu trúc mình đã chỉ)
    // Đi từ controller (app/controllers) ra ngoài root thì phải lùi 2 cấp (../../)
    const uploadDir = path.join(__dirname, "../../uploads"); 
    const filePath = path.join(uploadDir, filename);

    // Kiểm tra xem file có tồn tại không rồi mới xóa
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
            // Thực hiện xóa
            fs.unlink(filePath, (err) => {
                if (err) console.log(`Không thể xóa ảnh cũ: ${err}`);
                else console.log(`Đã xóa ảnh cũ: ${filename}`);
            });
        }
    });
};
exports.create = async (req, res, next) => {
    // Debug xem dữ liệu đến chưa
console.log("--- CHECK BACKEND ---");

    if (!req.body?.tenSach) {
        return next(new ApiError(400, "Tên sách không được để trống"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        
        // --- SỬA LỖI QUAN TRỌNG Ở ĐÂY ---
        // Gộp dữ liệu từ req.body và tên file từ req.file
        const document = await sachService.create({
            ...req.body,
            // Nếu có file ảnh thì lấy tên file, nếu không thì thôi
            hinhAnh: req.file ? req.file.filename : null 
        });
        
        return res.send({ message: "Sách được thêm thành công", data: document });
    } catch (error) {
         if (error.code === 11000) {
            return next(
                new ApiError(409, "Tên sách đã tồn tại.") 
            );
        }

        console.log(error); 
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo sách")
        );
    }
};

// Lấy tất cả sách
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const sachService = new SachService(MongoDB.client);
        const { tenSach } = req.query;
        if (tenSach) {
            documents = await sachService.findByTen(tenSach);
        } else {
            documents = await sachService.find({});
        }
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách sách")
        );
    }
};

// Tìm một sách bằng ID
exports.findOne = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.findById(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi tìm sách với id=${req.params.id}`)
        );
    }
};

// Cập nhật thông tin sách (Đã thêm logic cập nhật ảnh)
// File: backend/app/controllers/sach.controller.js - Hàm update

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0 && !req.file) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        
        // 1. Chuẩn bị dữ liệu update
        const dataToUpdate = { ...req.body };
        
        // 2. Nếu có ảnh mới được upload
        if (req.file) {
            // --- ĐOẠN MỚI THÊM: XÓA ẢNH CŨ ---
            // Lấy thông tin sách hiện tại trong DB để biết tên ảnh cũ
            const sachCu = await sachService.findById(req.params.id);
            if (sachCu && sachCu.hinhAnh) {
                deleteImage(sachCu.hinhAnh); // Gọi hàm xóa đã viết ở Bước 2
            }
            // ---------------------------------

            // Gán tên ảnh mới vào dữ liệu update
            dataToUpdate.hinhAnh = req.file.filename;
        }

        const document = await sachService.update(req.params.id, dataToUpdate);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách"));
        }

        return res.send({ message: "Sách đã được cập nhật thành công" });
    } catch (error) {
          if (error.code === 11000) {
            return next(
                new ApiError(409, "Tên sách đã tồn tại.") 
            );
        }

        console.log(error); 
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi cập nhật sách")
        );
    }
};

// Xóa sách
exports.delete = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        
        // 1. Tìm sách trước để lấy tên ảnh
        const sachCanXoa = await sachService.findById(req.params.id);
        
        if (!sachCanXoa) {
            return next(new ApiError(404, "Không tìm thấy sách"));
        }

        // 2. Xóa sách trong Database
        await sachService.delete(req.params.id);

        // 3. Xóa ảnh trên ổ cứng (nếu có)
        if (sachCanXoa.hinhAnh) {
            deleteImage(sachCanXoa.hinhAnh);
        }

        return res.send({ message: "Sách và ảnh bìa đã được xóa thành công" });
    } catch (error) {
        return next(new ApiError(500, `Không thể xóa sách: ${error.message}`));
    }
};

// Xóa tất cả
exports.deleteAll = async (_req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const deletedCount = await sachService.deleteAll();
        return res.send({
            message: `${deletedCount} sách đã được xóa thành công`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả sách")
        );
    }
};