const { ObjectId } = require("mongodb");

class TheoDoiMuonSachService {
  constructor(client) {
    this.TheoDoi = client.db().collection("theodoimuonsach");
  }

  // Tách dữ liệu hợp lệ từ payload
  extractTheoDoiData(payload) {
    const { ObjectId } = require("mongodb");

    const theoDoi = {
      maDocGia: payload.maDocGia?.trim() || "",
      maSach: ObjectId.isValid(payload.maSach) ? new ObjectId(payload.maSach) : null,
      ngayMuon: payload.ngayMuon 
        ? payload.ngayMuon.split("T")[0]   // chỉ lấy phần yyyy-mm-dd
        : new Date().toISOString().split("T")[0],
      ngayTra: payload.ngayTra 
        ? payload.ngayTra.split("T")[0]
        : null,
    };


    Object.keys(theoDoi).forEach(
      (key) => theoDoi[key] === undefined && delete theoDoi[key]
    );
    return theoDoi;
  }

  // Thêm mới bản ghi theo dõi mượn sách
  async create(payload) {
    const theoDoi = this.extractTheoDoiData(payload);
    const result = await this.TheoDoi.insertOne(theoDoi);
    return await this.findById(result.insertedId);
  }

  // Tìm tất cả theo filter (ví dụ: theo mã độc giả)
  async find(filter) {
    const cursor = await this.TheoDoi.find(filter);
    return await cursor.toArray();
  }

  // Tìm theo ID MongoDB
  async findById(id) {
    return await this.TheoDoi.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  
  // Tìm theo mã độc giả
  // async findByMaDocGia(maDocGia) {
  //   return await this.find({ maDocGia: maDocGia.trim() });
  // }
  async findByMaDocGia(maDocGia) {
    if (!maDocGia || typeof maDocGia !== "string") return null;
    return await this.TheoDoi.findOne({ maDocGia: maDocGia.trim() });
  }
  // Cập nhật
  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const filter = { _id: new ObjectId(id) };
    const update = this.extractTheoDoiData(payload);

    if (Object.keys(update).length === 0) return null;

    const result = await this.TheoDoi.updateOne(filter, { $set: update });
    if (result.matchedCount === 0) return null;

    return await this.findById(id);
  }

  // Xóa theo ID
  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.TheoDoi.findOneAndDelete({ _id: new ObjectId(id) });
  return result?.value || result || null;
  }

  // Xóa tất cả
  async deleteAll() {
    const result = await this.TheoDoi.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = TheoDoiMuonSachService;
