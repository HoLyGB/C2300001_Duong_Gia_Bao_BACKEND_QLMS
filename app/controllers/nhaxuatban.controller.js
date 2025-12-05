const NhaXuatBanService = require("../services/nhaxuatban.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {

    if (!req.body?.tenNXB) {
        return next(new ApiError(400, "Tên nhà xuất bản không được để trống"));
    }

    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const document = await nhaXuatBanService.create(req.body);
        return res.send({ message: "Nhà xuất bản được thêm thành công" });
        
    } catch (error) {
        
        if (error.code === 11000) {
            return next(
                new ApiError(409, "Tên nhà xuất bản đã tồn tại.") 
            );
        }

        console.log(error); 
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo nhà xuất bản")
        );
    }
};

// Lấy tất cả nhà xuất bản từ CSDL
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const { tenNXB } = req.query; // Tìm kiếm theo tenNXB
        if (tenNXB) {
            documents = await nhaXuatBanService.findByTen(tenNXB);
        } else {
            documents = await nhaXuatBanService.find({});
        }
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách nhà xuất bản")
        );
    }
};
// const Nxb = require("../models/nxb.model");

// exports.findAll = async (req, res) => {
//   try {
//     const data = await Nxb.find();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// Tìm một nhà xuất bản bằng ID
exports.findOne = async (req, res, next) => {
    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const document = await nhaXuatBanService.findById(req.params.id);

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
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const document = await nhaXuatBanService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
        }

        return res.send({ message: "Nhà xuất bản đã được cập nhật thành công" });
    } catch (error) {
        if (error.code === 11000) {
            return next(
                new ApiError(409, "Tên nhà xuất bản đã tồn tại.") 
            );
        }

        console.log(error); 
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi cập nhật nhà xuất bản")
        );
    }
};

// Xóa một nhà xuất bản bằng ID
exports.delete = async (req, res, next) => {
    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const document = await nhaXuatBanService.delete(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
        }

        return res.send({ message: "Nhà xuất bản đã được xóa thành công" });
    } catch (error) {
        return next(
            new ApiError(500, `Không thể xóa nhà xuất bản với id=${req.params.id}`)
        );
    }
};

// Xóa tất cả nhà xuất bản
exports.deleteAll = async (_req, res, next) => {
    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const deletedCount = await nhaXuatBanService.deleteAll();
        return res.send({
            message: `${deletedCount} nhà xuất bản đã được xóa thành công`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả nhà xuất bản")
        );
    }
};