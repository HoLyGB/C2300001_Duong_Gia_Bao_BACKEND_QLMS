const { ObjectId } = require("mongodb");

class NhaXuatBanService {

    constructor(client) {
        this.NhaXuatBan = client.db().collection("nhaxuatban");
    }


    extractNhaXuatBanData(payload) {
        const nhaXuatBan = {
            tenNXB: payload.tenNXB,
            diaChi: payload.diaChi,
        };

        // Xóa các trường có giá trị là undefined
        Object.keys(nhaXuatBan).forEach(
            (key) => nhaXuatBan[key] === undefined && delete nhaXuatBan[key]
        );
        return nhaXuatBan;
    }


    async create(payload) {
        const nhaXuatBan = this.extractNhaXuatBanData(payload);
        const result = await this.NhaXuatBan.insertOne(nhaXuatBan);
        // Trả về document vừa được tạo bằng cách tìm lại qua _id
        return result.value;
    }


    async find(filter) {
        const cursor = await this.NhaXuatBan.find(filter);
        return await cursor.toArray();
    }


    async findByTen(tenNXB) {
        return await this.find({
            tenNXB: { $regex: new RegExp(tenNXB), $options: "i" },
        });
    }

  
    async findById(id) {
        return await this.NhaXuatBan.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractNhaXuatBanData(payload);

        // Trả về null nếu payload rỗng
        if (Object.keys(update).length === 0) {
            return null;
        }

        const result = await this.NhaXuatBan.updateOne(filter, { $set: update });

        // Nếu không có document nào được cập nhật, trả về null
        if (result.matchedCount === 0) {
            return null;
        }
        
        // Trả về document sau khi đã cập nhật
        return await this.findById(id);
    }


 async delete(id) {
  if (!ObjectId.isValid(id)) return null;

  const result = await this.NhaXuatBan.findOneAndDelete({ _id: new ObjectId(id) });

  return result?.value || result || null;
}

    async deleteAll() {
        const result = await this.NhaXuatBan.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = NhaXuatBanService;