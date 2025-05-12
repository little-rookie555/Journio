const express = require('express');
const statisticHandler = require('../router_handler/statisticHandler');
const checkAuth = require('../middlewares/checkAuth');

const router = express.Router();

// 获取用户总量
router.get('/user', checkAuth, statisticHandler.getUserNumber);
// 获取游记总量
router.get('/trip', checkAuth, statisticHandler.getContentNumber);
// 获取总点赞数
router.get('/like', checkAuth, statisticHandler.getLikeNumber);
// 获取总收藏数
router.get('/star', checkAuth, statisticHandler.getStarNumber);
// 获取前一周的新增用户数、新增游记数
router.get('/last-week', checkAuth, statisticHandler.getAccessStats);
// 获取待审核的笔记数量
router.get('/pending', checkAuth, statisticHandler.getPendingNumber);
// 获取高质量游记比例
router.get('/quality', checkAuth, statisticHandler.getQualityRate);

module.exports = router;
