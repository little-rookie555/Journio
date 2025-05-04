const express = require("express");
const tripHandler = require("../router_handler/tripHandler");
const multer = require("multer");
const parseForm = multer().none();
const checkAuth = require("../middlewares/checkAuth");

const router = express.Router();

// // 在路由之前配置解析 Token 的中间件
// const expressJWT = require('express-jwt')
// const config = require('./config/config')
// app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api/] }))
// // 定义一个中间件，用于将解析后的 Token 信息挂载到 req.user 上
// app.use((req, res, next) => {
//     if (req.user) {
//         res.userId = req.user.userId;
//     }
//     next();
// });


console.log("tripRoutes");
// 创建游记
router.post("/create", checkAuth, parseForm, tripHandler.createTrip);
// 更新游记
router.put("/:id", checkAuth, parseForm, tripHandler.updateTrip); 
// 删除游记
router.delete("/:id", checkAuth, tripHandler.deleteTrip); 
// 获取所有游记 - 浏览游记，无需鉴权
router.get("/list", tripHandler.getAllTrips);
// 获取单个游记详情 - 浏览游记，无需鉴权
router.get("/detail", tripHandler.getTripDetail); // 通过query参数传递搜索关键词
// 通过标题的关键词搜索游记 - 浏览游记，无需鉴权
router.get("/search", tripHandler.searchTrip); // 通过query参数传递搜索关键词
// 获取访问当前用户某个审核状态的所有游记
router.get("/status/", checkAuth, tripHandler.getTripByStatus); // 通过URL参数传递审核状态
// // 为游记点赞或取消点赞
// // router.post("/like", tripController.likeTrip); // 使用URL参数传递游记ID

// 获取某个审核状态的所有游记
router.get(
    "/audit/status",
    checkAuth,
    tripHandler.getTripByAuditStatus
  ); // 通过query传递审核状态
// 审核通过游记
router.put("/audit/pass", checkAuth, tripHandler.passAuditTrip); // 使用PUT方法，并通过URL参数传递ID
// 审核拒绝游记
router.put("/audit/reject", checkAuth, tripHandler.rejectAuditTrip); // 使用PUT方法，并通过URL参数传递ID
// TODO: 逻辑删除游记
// router.put("/audit/del", checkAuth, tripHandler.deleteAuditTrip);

// 上传游记图片列表或视频
router.post("/upload", checkAuth, tripHandler.uploadTripMedia); // 使用POST方法
// 上传一组游记图片
router.post(
  "/upload/images",
  checkAuth,
  tripHandler.uploadTripMediaMultiple
); // 使用POST方法

module.exports = router;
