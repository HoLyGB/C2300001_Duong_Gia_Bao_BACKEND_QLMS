const TheoDoiMuonSachService = require("../services/theodoimuonsach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Tạo mới bản ghi theo dõi mượn sách
exports.create = async (req, res, next) => {
    if (!req.body?.maDocGia) {
        return next(new ApiError(400, "Mã độc giả không được để trống"));
    }
    if (!req.body?.maSach) {
        return next(new ApiError(400, "Mã sách không được để trống"));
    }

    try {
        const theoDoiService = new TheoDoiMuonSachService(MongoDB.client);
        const document = await theoDoiService.create(req.body);
        return res.send({ message: "Theo dõi mượn sách được thêm thành công" });
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo bản ghi theo dõi mượn sách")
        );
    }
};

// Lấy danh sách theo dõi mượn sách
// controller.js

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const theoDoiService = new TheoDoiMuonSachService(MongoDB.client);
        const { maDocGia, maSach } = req.query;

        // Tạo bộ lọc (filter) dựa trên query params
        let filter = {};
        if (maDocGia) {
            filter.maDocGia = new ObjectId(maDocGia); // Nếu maDocGia lưu dạng ObjectId
        }
        if (maSach) {
            filter.maSach = new ObjectId(maSach); // Nếu maSach lưu dạng ObjectId
        }

        // Gọi hàm find đã sửa ở Service
        documents = await theoDoiService.find(filter);

        return res.send(documents);
    } catch (error) {
        console.log(error); // Log lỗi ra terminal để dễ debug
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách theo dõi mượn sách")
        );
    }
};

// Tìm 1 bản ghi theo ID
exports.findOne = async (req, res, next) => {
    try {
        const theoDoiService = new TheoDoiMuonSachService(MongoDB.client);
        const document = await theoDoiService.findById(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy bản ghi theo dõi mượn sách"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi tìm bản ghi theo dõi với id=${req.params.id}`)
        );
    }
};

// Cập nhật bản ghi theo ID
exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
    }

    try {
        const theoDoiService = new TheoDoiMuonSachService(MongoDB.client);
        const document = await theoDoiService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy bản ghi theo dõi mượn sách"));
        }

        return res.send({ message: "Bản ghi theo dõi mượn sách đã được cập nhật thành công" });
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi cập nhật bản ghi theo dõi với id=${req.params.id}`)
        );
    }
};

// Xóa 1 bản ghi theo ID
exports.delete = async (req, res, next) => {
    try {
        const theoDoiService = new TheoDoiMuonSachService(MongoDB.client);
        const document = await theoDoiService.delete(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy bản ghi theo dõi mượn sách"));
        }

        return res.send({ message: "Bản ghi theo dõi mượn sách đã được xóa thành công" });
    } catch (error) {
        return next(
            new ApiError(500, `Không thể xóa bản ghi theo dõi với id=${req.params.id}`)
        );
    }
};

// Xóa tất cả bản ghi
exports.deleteAll = async (_req, res, next) => {
    try {
        const theoDoiService = new TheoDoiMuonSachService(MongoDB.client);
        const deletedCount = await theoDoiService.deleteAll();
        return res.send({
            message: `${deletedCount} bản ghi theo dõi mượn sách đã được xóa thành công`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả bản ghi theo dõi mượn sách")
        );
    }
};
