
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
class NhanVienService {
  constructor(client) {
    if (!client) throw new Error("MongoDB client chưa được truyền vào!");
    this.NhanVien = client.db().collection("nhanvien"); // tên collection đúng
    // Tạo index cho maNV nếu muốn unique
    this.NhanVien.createIndex({ maNV: 1 }, { unique: true }).catch(() => {});
  }


    extractNhanVienData(payload) {
        const nhanvien = {
            _id: payload.maNV,
            maNV: payload.maNV,
            hoTen: payload.hoTen,
            matKhau: payload.matKhau,
            chucVu: payload.chucVu ,
            diaChi: payload.diaChi,
            email: payload.email,
            soDienThoai: payload.soDienThoai ?? null,
            gioiTinh: payload.gioiTinh ?? null,
            vaiTro: payload.vaiTro?.trim() || "admin"
        };

        // Xoá các trường không xác định (undefined)
        Object.keys(nhanvien).forEach(
            (key) => nhanvien[key] === undefined && delete nhanvien[key]
        );
        return nhanvien;
    }

    async create(payload) {
        const nhanvien = this.extractNhanVienData(payload);

       
        nhanvien.matKhau = await bcrypt.hash(nhanvien.matKhau, 10);
      

        const result = await this.NhanVien.insertOne(nhanvien);
        return result.value;

    }

  // Tìm tất cả
  async find(filter = {}) {
    return await this.NhanVien.find(filter).toArray();
  }

  // Tìm theo maNV
  async findByMaNV(maNV) {
    if (!maNV || typeof maNV !== "string") return null;
    return await this.NhanVien.findOne({ maNV: maNV.trim() });
  }
// 1. Thêm hàm tìm theo Email
    async findByEmail(email) {
        return await this.NhanVien.findOne({ email: email });
    }

    // 2. Thêm hàm tìm theo Số điện thoại
    async findBySDT(sdt) {
        // Lưu ý: Trong DB bạn lưu là "soDienThoai" nên ở đây phải query theo key đó
        return await this.NhanVien.findOne({ soDienThoai: sdt });
    }
  // Cập nhật
  async update(maNV, payload) {
    if (!maNV || Object.keys(payload).length === 0) return null;
    const result = await this.NhanVien.updateOne(
      { maNV: maNV.trim() },
      { $set: payload }
    );
    if (result.matchedCount === 0) return null;
    return await this.findByMaNV(maNV);
  }

  // Xóa
async delete(maNV) {
  if (!maNV) return null;
  const result = await this.NhanVien.findOneAndDelete({ maNV: maNV.trim() });
  // result.value là document đã xóa, null nếu không tìm thấy
  return result.value|| result || null; 
}


  // Xóa tất cả
  async deleteAll() {
    const result = await this.NhanVien.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = NhanVienService;
