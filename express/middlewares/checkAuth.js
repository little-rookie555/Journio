const jwt = require("jsonwebtoken");
const config = require("../config/config");

const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log('authHeader:', req.headers); // 添加日志，输出authHeader的内容，方便调试

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).cc('未提供token，请先登录！');
  }

  const token = authHeader.split(" ")[1];
  // console.log('开始验证用户：', token);
  jwt.verify(token, config.jwtSecretKey, (err, decoded) => {
    if (err) {
      console.log('验证错误：', err);  // 添加错误日志
      if (err.name === "TokenExpiredError") {
        return res.status(401).cc('token已过期，请重新登录！');
      } else {
        return res.status(401).cc('token验证失败，请重新登录！');
      }
    }
    // 将解码后的用户信息挂载到 req 上
    req.id = decoded.id; 
    req.role = decoded.role;
    // console.log('验证成功，用户ID：', req.id);  // 添加成功日志
    next();
  });
};

module.exports = checkAuth;
