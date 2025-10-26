const { MongoClient } = require("mongodb");

class MongoDB {
    static client;

    static connect = async (uri) => {
        if (this.client) return this.client;
        this.client = await MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        return this.client;
    };
}

module.exports = MongoDB;


// const mongoose = require("mongoose");

// // 1. Định nghĩa chuỗi kết nối URI
// // Thay 'QuanLyMuonSach' bằng tên CSDL của bạn
// const dbURI = "mongodb://localhost:27017/QuanLyMuonS";

// // 2. Hàm để thực hiện kết nối
// const connectDB = async () => {
//   try {
//     await mongoose.connect(dbURI);
//     console.log("✅ Kết nối CSDL MongoDB thành công!");
//   } catch (error) {
//     console.error("❌ Kết nối CSDL thất bại:", error.message);
//     // Thoát khỏi tiến trình nếu không kết nối được
//     process.exit(1);
//   }
// };

// // 3. Xuất hàm để có thể gọi ở nơi khác (ví dụ: trong file server.js)
// module.exports = connectDB;



// const mongoose = require("mongoose");

// const dbName = "QuanLyMuonSach";
// const dbURI = `mongodb://localhost:27017/${dbName}`;

// const connectDB = async () => {
//   try {
//     // 1️⃣ Kết nối đến MongoDB
//     await mongoose.connect(dbURI);
//     console.log("✅ Kết nối CSDL MongoDB thành công!");

//     // 2️⃣ Kiểm tra xem database đã tồn tại thật sự chưa
//     const admin = mongoose.connection.db.admin();
//     const dbs = await admin.listDatabases();

//     const exists = dbs.databases.some(db => db.name === dbName);

//     if (exists) {
//       console.log(`✅ Database '${dbName}' đã tồn tại trên MongoDB.`);
//     } else {
//       console.log(`⚠️ Database '${dbName}' chưa tồn tại (sẽ được tạo khi thêm dữ liệu đầu tiên).`);
//     }

//   } catch (error) {
//     console.error("❌ Kết nối CSDL thất bại:", error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
