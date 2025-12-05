const { ObjectId } = require("mongodb");

class sachService {

    constructor(client) {
        this.sach = client.db().collection("sach");
    }


// Trong file backend/app/services/sach.service.js

extractsachData(payload) {
    const sach = {
        tenSach: payload.tenSach,
        donGia: Number(payload.donGia ?? 0),
        soQuyen: Number(payload.soQuyen ?? 0),
        namXuatBan: Number(payload.namXuatBan ?? 0),
        tacGia: payload.tacGia,
        
        // --- SỬA DÒNG NÀY ---
        // Kiểm tra kỹ: Nếu maNXB tồn tại VÀ là ID hợp lệ thì mới tạo ObjectId
        // Nếu không thì gán null (để tránh lỗi BSONError: Argument passed in must be a string of 12 bytes...)
        maNXB: (payload.maNXB && ObjectId.isValid(payload.maNXB)) 
                ? new ObjectId(payload.maNXB) 
                : null,

        // Xử lý ảnh
        hinhAnh: payload.hinhAnh || undefined, // Dùng undefined để bộ lọc bên dưới xử lý
    };

    // Xóa các trường undefined hoặc null
    Object.keys(sach).forEach(
        (key) => (sach[key] === undefined || sach[key] === null) && delete sach[key]
    );
    return sach;
}


async create(payload) {
    const sach = this.extractsachData(payload);
    
    // Thêm vào Database
    const result = await this.sach.insertOne(sach);
    
    // SỬA LẠI DÒNG NÀY:
    // Trả về object sách vừa tạo kèm theo _id mới sinh ra
    return { 
        ...sach, 
        _id: result.insertedId 
    }; 
}

    async find(filter) {
        const cursor = await this.sach.find(filter);
        return await cursor.toArray();
    }


    async findByTen(tenNXB) {
        return await this.find({
            tenNXB: { $regex: new RegExp(tenNXB), $options: "i" },
        });
    }

  
    async findById(id) {
        return await this.sach.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractsachData(payload);

        // Trả về null nếu payload rỗng
        if (Object.keys(update).length === 0) {
            return null;
        }

        const result = await this.sach.updateOne(filter, { $set: update });

        // Nếu không có document nào được cập nhật, trả về null
        if (result.matchedCount === 0) {
            return null;
        }
        
        // Trả về document sau khi đã cập nhật
        return await this.findById(id);
    }

async delete(id) {
  if (!ObjectId.isValid(id)) return null;

  const result = await this.sach.findOneAndDelete({ _id: new ObjectId(id) });

  return result?.value || result || null;
}




    async deleteAll() {
        const result = await this.sach.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = sachService;