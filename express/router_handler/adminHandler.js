const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require('../config/config')

// 管理员登录
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ 
        where: { username }
      });
    if (!user) {
      return res.status(404).json({
        message: "管理员不存在！",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "密码错误！" });
    }
    const payload = {
      userId: user.id,
      userRole: user.role, 
    };
    // 生成token
    const token = jwt.sign(payload, config.jwtSecretKey, { expiresIn: config.expiresIn });
    const tokenStr = 'Bearer ' + token;
    const userInfo = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    res.status(200).json({ message: "登陆成功！", tokenStr, userInfo });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "登陆失败",
    });
  }
};

// 管理员登出
exports.logoutAdmin = async (req, res) => {
  try {
    // req.session.destroy();
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to logout" });
  }
};

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  const userRole = req.role;
  // TODO：审核员可以获取吗？
  if (userRole !== 3) {
    return res.status(403).json({ message: "权限不足" });
  }
  // 分页查询
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  try {
    // 不返回密码字段
    const { count, rows } = await User.findAndCountAll({
      where: { role: 1 },
      attributes: { exclude: ['password'] },
      offset: skip,
      limit: limit
    });
    if (skip >= count) {
      throw new Error("页码超出范围");
    }
    res.status(200).json({ data: rows, count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 删除单个用户
exports.deleteUser = async (req, res) => {
  const userRole = req.userRole;
  if (userRole !== 3) {
    return res.status(403).json({ message: "权限不足" });
  }
  try {
    await User.destroy({ where: { id: req.query.id } });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 创建用户
exports.createUser = async (req, res) => {
  const userRole = req.userRole;
  if (userRole !== "super") {
    return res.status(403).json({ message: "Unauthorized" });
  }
  const { username, password } = req.body;
  //   如果没有传入密码，则默认密码为adminadmin
  if (!password) {
    password = "adminadmin";
  }

  try {
    // 检查用户名是否已存在
    const exist_user = await User.findOne({ where: { username } });
    if (exist_user) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      username,
      nick_name: username,
      password: hashedPassword,
      role: 1 // 默认普通用户角色
    });
    const userInfo = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    res.status(201).json({ message: "User created", userInfo });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  const userRole = req.userRole;
  if (userRole !== "super") {
    return res.status(403).json({ message: "Unauthorized" });
  }
  password = "adminadmin";
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.update({ password: hashedPassword }, { where: { id: req.params.id } });
    res.status(200).json({ message: "Password reset" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
