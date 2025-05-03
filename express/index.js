const express = require("express");
const cors = require('cors'); // 导入 cors 中间件
const userRouter = require('./router/index');  // 导入路由
const app = express();
const send = require("./middlewares/send");

// 使用 express.json() 中间件解析 JSON 格式的请求体
app.use(express.json());
// 允许跨域请求
app.use(cors());  
// 挂载中间件-send
app.use(send);
// 在路由之前配置解析 Token 的中间件
const expressJWT = require('express-jwt')
const config = require('./config/config')
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api/] }))
// 定义一个中间件，用于将解析后的 Token 信息挂载到 req.user 上
app.use((req, res, next) => {
    if (req.user) {
        res.userId = req.user.userId;
    }
    next();
});

// 使用路由 处理所有以 /api 开头的请求
app.use('/api', userRouter); 

// 定义错误级别的中间件
app.use((err, req, res, next) => {
    // TODO:验证失败导致的错误
    if (err instanceof joi.ValidationError) return res.cc(err)
    // 身份认证失败后的错误
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    // 未知的错误
    res.cc(err)
  })

// 启动服务器 监听指定端口
app.listen(3007, () => {
    console.log("Server is running on http://127.0.0.1:3007");
});