const express = require('express');
const router = express.Router();

// user相关路由
const userRoutes = require('./userRouter');
const tripRoutes = require('./tripRoutes');
const auditRoutes = require('./auditRoutes');
const adminRoutes = require('./adminRoutes');
const statisticRoutes = require('./statisticRoutes');
const imageRouter = require('./imageRoutes');

router.use('/user', userRoutes);
router.use('/travel', tripRoutes);
router.use('/audit', auditRoutes);
router.use('/admin', adminRoutes);
router.use('/statistic', statisticRoutes);
router.use('/image', imageRouter);

module.exports = router;
