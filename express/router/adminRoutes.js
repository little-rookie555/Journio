const express = require('express');
const adminHandler = require('../router_handler/adminHandler');
const checkAuth = require('../middlewares/checkAuth');

const router = express.Router();

// 获取管理员列表
router.get('/', checkAuth, adminHandler.getAllAdmins);
// 获取用户列表
router.get('/user', checkAuth, adminHandler.getAllUsers);
// 删除管理员
router.put('/delete', checkAuth, adminHandler.deleteAdmin);
// 创建管理员
router.post('/create', checkAuth, adminHandler.createAdmin);
// 重置管理员密码
router.put('/reset', checkAuth, adminHandler.resetPassword);

module.exports = router;
