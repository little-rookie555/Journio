const express = require("express");
const auditHandler = require("../router_handler/auditHandler");
const checkAuth = require("../middlewares/checkAuth");

const router = express.Router();

router.post("/login", auditHandler.loginAdmin);
router.post("/logout", auditHandler.logoutAdmin);


// 审核页面
// 获取某个审核状态的所有游记
router.get(
    "/audit/status",
    checkAuth,
    auditHandler.getTripByAuditStatus
  ); // 通过query传递审核状态
// 审核通过游记
router.put("/pass", checkAuth, auditHandler.passAuditTrip); // 使用PUT方法，并通过URL参数传递ID
// 审核拒绝游记
router.put("/reject", checkAuth, auditHandler.rejectAuditTrip); // 使用PUT方法，并通过URL参数传递ID
// TODO: 逻辑删除游记
// router.put("/audit/del", checkAuth, tripHandler.deleteAuditTrip);


// 超级管理员获取所有用户
router.get("/user", checkAuth, auditHandler.getAllUsers);
// 超级管理员删除用户
router.delete("/user", checkAuth, auditHandler.deleteUser);
// 超级管理员新增用户
router.post("/user", checkAuth, auditHandler.createUser);
// 超级管理员为用户重置密码
router.put("/user", checkAuth, auditHandler.resetPassword);

module.exports = router;
