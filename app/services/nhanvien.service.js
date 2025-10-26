// const { ObjectId } = require("mongodb");
// const bcrypt = require("bcryptjs");

// class NhanVienService {
//     constructor(client) {
//         this.NhanVien = client.db().collection("nhanvien");
//         // Tạo chỉ mục duy nhất cho mã nhân viên (code)
//         this.nhanvien.createIndex({ maNV: 1 }, { unique: true }).catch(() => {});
//     }

//     extractNhanVienData(payload) {
//         const nhanvien = {
//             _id: payload.maNV,
//             maNV: payload.maNV,
//             hoTen: payload.hoTen,
//             matKhau: payload.matKhau,
//             chucVu: payload.chucVu ,
//             diaChi: payload.diaChi,
//             soDienThoai: payload.soDienThoai ? String(payload.soDienThoai):NonNullable,
//         };

//         // Xoá các trường không xác định (undefined)
//         Object.keys(nhanvien).forEach(
//             (key) => nhanvien[key] === undefined && delete nhanvien[key]
//         );
//         return nhanvien;
//     }

//     async create(payload) {
//         const nhanvien = this.extractNhanVienData(payload);

//         // Mã hoá mật khẩu
//         nhanvien.matKhau = await bcrypt.hash(nhanvien.matKhau, 10);
      

//         const result = await this.NhanVien.insertOne(nhanvien);
//         return await this.findById(result.insertedId);
//     }

//     async find(filter) {
//         const cursor = await this.NhanVien.find(filter);
//         return await cursor.toArray();
//     }



// // async findById(maNV) {
// //   if (!maNV || typeof maNV !== "string" || maNV.trim() === "") return null;
// //   return await this.NhanVien.findOne({ _id: maNV.trim() });
// // }



// async findByMaNV(maNV) {
//   try {
//     if (!maNV || typeof maNV !== "string" || maNV.trim() === "") {
//       console.log("maNV không hợp lệ:", maNV);
//       return null;
//     }

//     console.log("Tìm nhân viên với maNV:", maNV);
//     const doc = await this.NhanVien.findOne({ maNV: maNV.trim() });
//     console.log("Kết quả tìm kiếm:", doc);
//     return doc;
//   } catch (error) {
//     console.error("findByMaNV error:", error);
//     return null;
//   }
// }



//     async update(id, payload) {
//         const filter = {
//             _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
//         };

//         const update = this.extractNhanVienData(payload);

//         // Nếu có mật khẩu mới thì mã hoá lại
//         if (update.matKhau) {
//             update.matKhau = await bcrypt.hash(update.matKhau, 10);
//         }

//         if (Object.keys(update).length === 0) {
//             return null;
//         }

//         const result = await this.NhanVien.updateOne(filter, { $set: update });

//         if (result.matchedCount === 0) {
//             return null;
//         }

//         return await this.findById(id);
//     }

//     async delete(id) {
//         if (!ObjectId.isValid(id)) return null;

//         const result = await this.NhanVien.findOneAndDelete({ _id: new ObjectId(id) });
//         return result?.value || result || null;
//     }

//     async deleteAll() {
//         const result = await this.NhanVien.deleteMany({});
//         return result.deletedCount;
//     }
// }

// module.exports = NhanVienService;

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
            soDienThoai: payload.soDienThoai ?? null,
        };

        // Xoá các trường không xác định (undefined)
        Object.keys(nhanvien).forEach(
            (key) => nhanvien[key] === undefined && delete nhanvien[key]
        );
        return nhanvien;
    }

    async create(payload) {
        const nhanvien = this.extractNhanVienData(payload);

        // Mã hoá mật khẩu
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
