const express = require('express');
const statisticHandler = require('../router_handler/statisticHandler');
const checkAuth = require('../middlewares/checkAuth');

const router = express.Router();

// 获取用户总量
router.get('/user', checkAuth, statisticHandler.getUserNumber);
// 获取游记总量
router.get('/trip', checkAuth, statisticHandler.getContentNumber);
// 获取前一周的新增用户数、新增游记数
router.get('/last-week', checkAuth, statisticHandler.getAccessStats);
// 获取待审核的笔记数量
router.get('/pending', checkAuth, statisticHandler.getPendingNumber);

module.exports = router;
