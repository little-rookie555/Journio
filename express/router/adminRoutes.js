const express = require("express");
const adminHandler = require("../router_handler/adminHandler");
const checkAuth = require("../middlewares/checkAuth");

const router = express.Router();

router.post("/login", adminHandler.loginAdmin);
router.post("/logout", adminHandler.logoutAdmin);

// 超级管理员获取所有用户
router.get("/user", checkAuth, adminHandler.getAllUsers);
// 超级管理员删除用户
router.delete("/user", checkAuth, adminHandler.deleteUser);
// 超级管理员新增用户
router.post("/user", checkAuth, adminHandler.createUser);
// 超级管理员为用户重置密码
router.put("/user", checkAuth, adminHandler.resetPassword);

module.exports = router;
