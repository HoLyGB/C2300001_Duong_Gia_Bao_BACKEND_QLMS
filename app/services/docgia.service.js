const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

class DocGiaService {

    constructor(client) {
        if (!client) throw new Error("MongoDB client chưa được truyền vào!");
    this.DocGia = client.db().collection("docgia"); // tên collection đúng
    // Tạo index cho maNV nếu muốn unique
    this.DocGia.createIndex({ maDG: 1 }, { unique: true })
      .then(() => console.log("✅ Index unique cho maDG đã sẵn sàng"))
      .catch((err) => console.error("⚠️ Lỗi tạo index:", err.message));
    }


     extractDocGiaData(payload) {
    const docGia = {
      maDG: payload.maDG?.trim() || null,
      passwordHash: payload.passwordHash,
      hoLot: payload.hoLot?.trim() || "",
      ten: payload.ten?.trim() || "",
      ngaySinh: payload.ngaySinh ? new Date(payload.ngaySinh) : null,  // "YYYY-MM-DD"
      gioiTinh: Boolean(payload.gioiTinh),
      diaChi: payload.diaChi || "",
      soDienThoai: payload.soDienThoai || "",
      email: payload.email || "",
      vaiTro: payload.vaiTro?.trim() || "docgia",
    };

    Object.keys(docGia).forEach(
      (key) => docGia[key] === undefined && delete docGia[key]
    );
    return docGia;
  }

  // ✅ thêm async để dùng await
  async create(payload) {
    const docGia = this.extractDocGiaData(payload);

    // Nếu có trường matKhau thì hash trước khi lưu
    if (payload.matKhau) {
      docGia.passwordHash = await bcrypt.hash(payload.matKhau, 10);
    }

    const result = await this.DocGia.insertOne(docGia);
    return { _id: result.insertedId, ...docGia };
  }

    async find(filter) {
        const cursor = await this.DocGia.find(filter);
        return await cursor.toArray();
    }


    async findByTen(ten) {
        return await this.find({
            ten: { $regex: new RegExp(ten), $options: "i" },
        });
    }
    async findByTen(hoLot) {
            return await this.find({
                hoLot: { $regex: new RegExp(hoLot), $options: "i" },
            });
        }
    async findByEmail(email) {
            return await this.DocGia.findOne({ email });
        }

    async findById(id) {
        return await this.DocGia.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async update(id, payload) {
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const filter = { _id: new ObjectId(id) };
        const update = this.extractDocGiaData(payload);

        // Trả về null nếu payload rỗng
        if (Object.keys(update).length === 0) {
            return null;
        }

        const result = await this.DocGia.updateOne(filter, { $set: update });

        // Nếu không có document nào được cập nhật, trả về null
        if (result.matchedCount === 0) {
            return null;
        }
        
        // Trả về document sau khi đã cập nhật
        return await this.findById(id);
    }


 async delete(id) {
  if (!ObjectId.isValid(id)) return null;

  const result = await this.DocGia.findOneAndDelete({ _id: new ObjectId(id) });

  return result?.value || result || null;
}

    async deleteAll() {
        const result = await this.DocGia.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = DocGiaService;


