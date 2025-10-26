const { ObjectId } = require("mongodb");

class sachService {

    constructor(client) {
        this.sach = client.db().collection("sach");
    }


    extractsachData(payload) {
        const sach = {
            tenSach: payload.tenSach,
            donGia: Number(payload.donGia ?? 0),
            soQuyen:Number(payload.soQuyen ?? 0),
            namXuatBan:Number(payload.namXuatBan ?? 0),
            maNXB:payload.maNXB ? new ObjectId(payload.maNXB) : null,
            tacGia:payload.tacGia,
            hinhAnh: payload.hinhAnh ?? null,
        };

        // Xóa các trường có giá trị là undefined
        Object.keys(sach).forEach(
            (key) => sach[key] === undefined && delete sach[key]
        );
        return sach;
    }


    async create(payload) {
        const sach = this.extractsachData(payload);
        const result = await this.sach.insertOne(sach);
        // Trả về document vừa được tạo bằng cách tìm lại qua _id
        return result.value;
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