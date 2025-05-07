const express = require("express");
const auditHandler = require("../router_handler/auditHandler");
const checkAuth = require("../middlewares/checkAuth");

const router = express.Router();

router.post("/login", auditHandler.loginAdmin);
router.post("/logout", auditHandler.logoutAdmin);


// 审核页面
// 获取某个审核状态的所有游记
router.get(
    "/list",
    checkAuth,
    auditHandler.getTripList
  ); // 通过query传递审核状态
// 获取单个游记详情 - 浏览游记，无需鉴权
router.get("/detail/:id", auditHandler.getTripDetail); // 通过query参数传递搜索关键词
// 审核通过游记
router.put("/pass", checkAuth, auditHandler.passAuditTrip); // 使用PUT方法，并通过URL参数传递ID
// 审核拒绝游记
router.put("/reject", checkAuth, auditHandler.rejectAuditTrip); // 使用PUT方法，并通过URL参数传递ID
// TODO: 逻辑删除游记
router.put("/delete/:id", checkAuth, auditHandler.deleteAuditTrip);


// 超级管理员获取所有用户
router.get("/user", checkAuth, auditHandler.getAllUsers);
// 超级管理员删除用户
router.delete("/user", checkAuth, auditHandler.deleteUser);
// 超级管理员新增用户
router.post("/user", checkAuth, auditHandler.createUser);
// 超级管理员为用户重置密码
router.put("/user", checkAuth, auditHandler.resetPassword);

module.exports = router;
