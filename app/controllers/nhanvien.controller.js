const NhanVienService = require("../services/nhanvien.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// ➕ Thêm nhân viên mới
exports.create = async (req, res, next) => {
    if (!req.body?.hoTen || !req.body?.maNV) {
        return next(new ApiError(400, "Tên nhân viên và mã nhân viên không được để trống"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.create(req.body);
        return res.send({ message: "Nhân viên đã được thêm thành công", data: document });
    } catch (error) {
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
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhân viên"));
        }

        return res.send({ message: "Nhân viên đã được cập nhật thành công" });
    } catch (error) {
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
