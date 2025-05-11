const express = require('express');
const router = express.Router();
const imageHandler = require('../router_handler/imageHandler');
// const expressJoi = require('@escook/express-joi');
const checkAuth = require('../middlewares/checkAuth');

// 生成图片
router.post('/generate', imageHandler.generateImage);

// 上传并处理图片
router.post('/upload', checkAuth, imageHandler.uploadAndProcessImage);

// 添加水印
// router.post('/watermark', checkAuth, imageHandler.addWatermark);

// 从视频提取缩略图
// router.post('/thumbnail', checkAuth, imageHandler.extractThumbnail);

module.exports = router;
