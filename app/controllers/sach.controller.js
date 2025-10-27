const SachService = require("../services/sach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {

    if (!req.body?.tenSach) {
        return next(new ApiError(400, "Tên nhà xuất bản không được để trống"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.create(req.body);
        return res.send({ message: "Nhà xuất bản được thêm thành công" });
        // return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo nhà xuất bản")
        );
    }
};

// Lấy tất cả nhà xuất bản từ CSDL
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const sachService = new SachService(MongoDB.client);
        const { tenSach } = req.query; // Tìm kiếm theo tenSach
        if (tenSach) {
            documents = await sachService.findByTen(tenSach);
        } else {
            documents = await sachService.find({});
        }
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách của sách")
        );
    }
};



// Tìm một nhà xuất bản bằng ID
exports.findOne = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.findById(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Lỗi khi tìm nhà xuất bản với id=${req.params.id}`
            )
        );
    }
};

// Cập nhật thông tin nhà xuất bản bằng ID
exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
        }

        return res.send({ message: "Nhà xuất bản đã được cập nhật thành công" });
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi cập nhật nhà xuất bản với id=${req.params.id}`)
        );
    }
};

// Xóa một nhà xuất bản bằng ID
exports.delete = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.delete(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách"));
        }

        return res.send({ message: "Sách đã được xóa thành công" });
    } catch (error) {
        return next(
            new ApiError(500, `Không thể xóa sách với id=${req.params.id}`)
        );
    }
};

// Xóa tất cả nhà xuất bản
exports.deleteAll = async (_req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const deletedCount = await sachService.deleteAll();
        return res.send({
            message: `${deletedCount} nhà xuất bản đã được xóa thành công`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả nhà xuất bản")
        );
    }
};