const express = require('express');
const router = express.Router();

// user相关路由
const userRouter = require('./userRouter');
const tripRouter = require('./tripRouter');
const auditRouter = require('./auditRouter');
const adminRouter = require('./adminRouter');
const statisticRouter = require('./statisticRouter');
const imageRouter = require('./imageRouter');

router.use('/user', userRouter);
router.use('/travel', tripRouter);
router.use('/audit', auditRouter);
router.use('/admin', adminRouter);
router.use('/statistic', statisticRouter);
router.use('/image', imageRouter);

module.exports = router;
