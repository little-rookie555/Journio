const { User } = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require('sequelize');

// 获取管理员列表
exports.getAllAdmins = async (req, res) => {
  const userRole = req.role;
  // console.log('userRole', userRole);
  // TODO:谁可以访问？
  if (userRole !== 2 && userRole !== 3) {
    return res.status(403).json({ code: 403, message: "权限不足!" });
  }
  
  // 分页查询
  const { page = 1, pageSize = 10, search = '' } = req.query;
  const offset = (page - 1) * pageSize;
  
  try {
    // 构建查询条件
    // TODO:查询所有用户？
    const whereCondition = {
      role: {
        [Op.in]: [2, 3] // 只查询管理员角色
      }
    };
    
    // 如果有搜索关键词，添加搜索条件
    if (search) {
      whereCondition.username = {
        [Op.like]: `%${search}%`
      };
    }
    
    // 不返回密码字段
    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['password'] },
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });
    
    // 格式化返回数据，符合前端期望的格式
    const formattedData = rows.map(user => ({
      key: user.id.toString(),
      username: user.username,
      role: user.role,
      updateTime: user.update_time,
      status: user.status // 默认为激活状态
    }));

    console.log('formattedData', formattedData); // 打印 formattedData 以查看其内容
    
    res.status(200).json({ 
      code: 200,
      data: formattedData, 
      total: count,
      message: "获取成功"
    });
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    return res.status(500).json({ code: 500, message: error.message });
  }
};

// 禁用管理员
exports.deleteAdmin = async (req, res) => {
  const userRole = req.role;
  if (userRole !== 3) {
    return res.status(403).json({ code: 403, message: "权限不足" });
  }
  
  const { id } = req.body.data || req.body;
  
  try {
    // await User.destroy({ where: { id } });
    await User.update({ status: 0 }, { where: { id } }); // 恢复为普通用户角色
    res.status(200).json({ code: 200, message: "删除管理员成功" });
  } catch (error) {
    console.error('删除管理员失败:', error);
    return res.status(500).json({ code: 500, message: error.message });
  }
};

// 创建管理员
exports.createAdmin = async (req, res) => {
  console.log('req.body', req.body); // 打印 req.body 以查看其内容
  const userRole = req.role;
  if (userRole !== 2 && userRole!== 3) {
    return res.status(403).json({ code: 403, message: "权限不足" });
  }
  
  const { username, password, role } = req.body;
  
  try {
    // 检查用户名是否已存在
    const existUser = await User.findOne({ where: { username } });
    if (existUser) {
      return res.status(400).json({ code: 400, message: "用户名已存在" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      username,
      nick_name: username,
      password: hashedPassword,
      role,
      status: 1 // 默认激活状态
    });
    
    res.status(201).json({ 
      code: 200, 
      message: "创建管理员成功"
    });
  } catch (error) {
    console.error('创建管理员失败:', error);
    return res.status(500).json({ code: 500, message: error.message });
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  console.log('req.body', req.body); // 打印 req.body 以查看其内容
  const userRole = req.role;
  if (userRole !== 2 && userRole!== 3) {
    return res.status(403).json({ code: 403, message: "权限不足" });
  }
  
  const { id, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.update({ password: hashedPassword }, { where: { id } });
    res.status(200).json({ code: 200, message: "重置密码成功" });
  } catch (error) {
    console.error('重置密码失败:', error);
    return res.status(500).json({ code: 500, message: error.message });
  }
};
