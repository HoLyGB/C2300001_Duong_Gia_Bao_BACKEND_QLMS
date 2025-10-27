const DocGiaService = require("../services/docgia.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {

    if (!req.body?.hoLot) {
        return next(new ApiError(400, "Họ lót không được để trống"));
    }
     if (!req.body?.ten) {
        return next(new ApiError(400, "Tên không được để trống"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const document = await docGiaService.create(req.body);
        return res.send({ message: "Độc giả được thêm thành công" });
        // return res.send(document);
    } catch (error) {
       if (error.code === 11000) {
  
        const duplicateField = Object.keys(error.keyValue || {})[0] || "Unknown";
        return next(new ApiError(409, `${duplicateField} đã tồn tại`));
    }
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
exports.findOne = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const document = await docGiaService.findById(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy Độc giả"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Lỗi khi tìm Độc giả với id=${req.params.id}`
            )
        );
    }
};

// Cập nhật thông tin Độc giả bằng ID
exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const document = await docGiaService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy Độc giả"));
        }

        return res.send({ message: "Độc giả đã được cập nhật thành công" });
    } catch (error) {
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