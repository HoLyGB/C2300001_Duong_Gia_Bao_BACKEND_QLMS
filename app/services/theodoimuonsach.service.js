const { ObjectId } = require("mongodb");

class TheoDoiMuonSachService {
  constructor(client) {
    this.TheoDoi = client.db().collection("theodoimuonsach");
    // Khai báo thêm 2 collection để phục vụ việc tìm tên thủ công
    this.Sach = client.db().collection("sach");
    this.DocGia = client.db().collection("docgia");
  }

  // --- 1. SỬA HÀM EXTRACT ĐỂ KHÔNG BỊ NULL ---
// Hàm tách dữ liệu (Hỗ trợ cả Thêm mới và Cập nhật 1 phần)
  extractTheoDoiData(payload) {
    const theoDoi = {};

    // 1. Xử lý Mã Độc Giả (Chỉ cập nhật nếu có gửi lên)
    if (payload.maDocGia !== undefined) {
        theoDoi.maDocGia = ObjectId.isValid(payload.maDocGia) 
            ? new ObjectId(payload.maDocGia) 
            : payload.maDocGia;
    }

    // 2. Xử lý Mã Sách
    if (payload.maSach !== undefined) {
        theoDoi.maSach = ObjectId.isValid(payload.maSach) 
            ? new ObjectId(payload.maSach) 
            : payload.maSach;
    }

    // 3. Xử lý Ngày Mượn
    if (payload.ngayMuon !== undefined) {
        theoDoi.ngayMuon = payload.ngayMuon 
            ? payload.ngayMuon.split("T")[0] 
            : new Date().toISOString().split("T")[0];
    }

    // 4. Xử lý Ngày Trả (QUAN TRỌNG: Chỉ sửa nếu payload có chứa ngayTra)
    if (payload.ngayTra !== undefined) {
        theoDoi.ngayTra = payload.ngayTra 
            ? payload.ngayTra.split("T")[0] 
            : null;
    }

    // 5. Xử lý Trạng Thái
    if (payload.trangThai !== undefined) {
        theoDoi.trangThai = payload.trangThai.trim();
    }
  Object.keys(theoDoi).forEach(
      (key) => theoDoi[key] === undefined && delete theoDoi[key]
    );
    return theoDoi;
  }

  async create(payload) {
    const theoDoi = this.extractTheoDoiData(payload);
    const result = await this.TheoDoi.insertOne(theoDoi);
    return await this.findById(result.insertedId);
  }

  // --- 2. SỬA HÀM FIND THỦ CÔNG ĐỂ TÌM ĐƯỢC TÊN ---
  async find(filter) {
    const cursor = await this.TheoDoi.find(filter);
    const documents = await cursor.toArray();

    // Chạy vòng lặp để gán thông tin Sách và Độc Giả vào
    const results = await Promise.all(documents.map(async (doc) => {
        
        // --- TÌM SÁCH ---
        if (doc.maSach) {
            let sach = null;
            // 1. Thử tìm bằng ObjectId (nếu mã trong DB là ObjectId)
            if (ObjectId.isValid(doc.maSach)) {
                sach = await this.Sach.findOne({ _id: new ObjectId(doc.maSach) });
            }
            // 2. Nếu không thấy, thử tìm bằng String (nếu mã trong DB là "S001")
            if (!sach) {
                sach = await this.Sach.findOne({ _id: doc.maSach });
            }
            
            // Nếu tìm thấy thì gán object sách đè lên ID
            if (sach) doc.maSach = sach; 
        }

        // --- TÌM ĐỘC GIẢ ---
        if (doc.maDocGia) {
            let docgia = null;
            // 1. Thử tìm bằng ObjectId
            if (ObjectId.isValid(doc.maDocGia)) {
                docgia = await this.DocGia.findOne({ _id: new ObjectId(doc.maDocGia) });
            }
            // 2. Nếu không thấy, tìm bằng String (trường hợp _id="DG001")
            if (!docgia) {
                docgia = await this.DocGia.findOne({ _id: doc.maDocGia }); 
            }
             // 3. Nếu vẫn không thấy, tìm theo cột 'maDocGia' riêng (nếu có)
             if (!docgia) {
                docgia = await this.DocGia.findOne({ maDocGia: doc.maDocGia });
            }

            if (docgia) doc.maDocGia = docgia; 
        }

        return doc;
    }));

    return results;
  }

  async findById(id) {
    return await this.TheoDoi.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByMaDocGia(maDocGia) {
    if (!maDocGia) return [];
    // Gọi hàm find ở trên để nó tự động populate
    return await this.find({ maDocGia: maDocGia.trim() });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;
    const filter = { _id: new ObjectId(id) };
    const update = this.extractTheoDoiData(payload);

    if (Object.keys(update).length === 0) return null;
    const result = await this.TheoDoi.updateOne(filter, { $set: update });
    return await this.findById(id);
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.TheoDoi.findOneAndDelete({ _id: new ObjectId(id) });
    return result?.value || result || null;
  }

  async deleteAll() {
    const result = await this.TheoDoi.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = TheoDoiMuonSachService;