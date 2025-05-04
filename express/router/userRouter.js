const express = require('express')
const userHandler = require('../router_handler/userHandler')
checkAuth = require('../middlewares/checkAuth')
// 创建路由对象
const router = express.Router()

// 导入验证数据的中间件
const Joi = require('@hapi/joi')
const validator = require('express-joi-validation').createValidator({})

// 导入需要的验证规则对象
const { reg_login_schema } = require('../middlewares/checkUser')


// 挂载具体的路由

// 注册新用户 - 应用验证规则 - 没用上
router.post('/reguser', validator.body(reg_login_schema), userHandler.registerUser);
// 登录 - 应用验证规则
router.post('/login', validator.body(reg_login_schema), userHandler.loginUser)
// 退出登录
router.post("/logout", userHandler.logoutUser);
// 获取用户基本信息
router.get("/getInfo", checkAuth, userHandler.getUserInfo);
// // 更新用户基本信息
// router.put("/update", checkAuth, userHandler.updateUserInfo);
// // 上传用户头像
// router.post("/upload/avatar", checkAuth, userHandler.uploadAvatar);



// 将路由对象共享出去
module.exports = router