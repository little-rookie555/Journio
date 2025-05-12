const express = require('express');
const tripHandler = require('../router_handler/tripHandler');
const followHandler = require('../router_handler/followHandler');
const multer = require('multer');
const parseForm = multer().none();
const checkAuth = require('../middlewares/checkAuth');

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

console.log('tripRoutes');
// 创建游记
router.post('/publish', checkAuth, parseForm, tripHandler.createTrip);
// 更新游记
router.put('/update/:id', checkAuth, parseForm, tripHandler.updateTrip);
// 删除游记
router.delete('/:id', checkAuth, tripHandler.deleteTrip);
// 获取所有游记 - 浏览游记，无需鉴权
router.get('/list', tripHandler.getAllTrips);
// 获取单个游记详情 - 浏览游记，无需鉴权
router.get('/detail/:id', tripHandler.getTripDetail); // 通过query参数传递搜索关键词
// 获取某个用户的所有游记
router.get('/user/:userId', checkAuth, tripHandler.getTripsByUser); // 通过URL参数传递用户ID
// 通过标题的关键词搜索游记 - 浏览游记，无需鉴权
router.get('/search', tripHandler.searchTrip); // 通过query参数传递搜索关键词
// // 获取访问当前用户某个审核状态的所有游记
// router.get("/status/", checkAuth, tripHandler.getTripByStatus); // 通过URL参数传递审核状态

// 为游记点赞或取消点赞
router.post('/like', checkAuth, tripHandler.likeTrip);
// 收藏游记或取消收藏
router.post('/star', checkAuth, tripHandler.starTrip);
// 评论
router.post('/comment', checkAuth, tripHandler.createComment);
// 获取评论
router.get('/comment/list/:travelId', tripHandler.getCommentList);

// 上传游记图片列表或视频
router.post('/upload', tripHandler.uploadTripMedia); // 使用POST方法
// TODO：更新游记的浏览量
router.post('/trips/:id/views', tripHandler.updateViews);

// 关注用户
router.post('/follow', checkAuth, followHandler.followUser);
// 查询是否关注
router.get('/follow/check', checkAuth, followHandler.checkIsFollow);
// 获取关注列表
router.get('/follow/list', checkAuth, followHandler.getFollowList);
// 获取粉丝列表
router.get('/fan/list', checkAuth, followHandler.getFanList);
// 获取收藏列表
router.get('/star/list', checkAuth, followHandler.getStarList);

module.exports = router;
