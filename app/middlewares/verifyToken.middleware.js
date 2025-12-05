

// module.exports = (req, _res, next) => {
//   const h = req.headers.authorization || "";
//   const token = h.startsWith("Bearer ") ? h.slice(7) : null;

//   if (!token) return next(new ApiError(401, "Thiếu token"));

//   try {
//     req.user = jwt.verify(token, JWT_SECRET);
//     next();
//   } catch(err) {
//     console.error("JWT verify lỗi:", err);
//     next(new ApiError(401, "Token không hợp lệ"));
//   }
// };

const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");
const { JWT_SECRET } = require("../config/jwt.config");

module.exports = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(new ApiError(401, "Thiếu token"));

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return next(new ApiError(401, "Token không hợp lệ"));

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    console.error("JWT verify lỗi:", err);
    next(new ApiError(401, "Token không hợp lệ hoặc đã hết hạn"));
  }
};

