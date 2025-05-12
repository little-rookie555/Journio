const { Trip, TripReviewRecord, User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const db = require('../config/db');
const { Op } = require('sequelize'); // 添加 Op 导入

// 登录
exports.loginAdmin = async (req, res) => {
  const userinfo = req.body;

  try {
    // 根据username查询用户信息
    const user = await User.findOne({
      where: { username: userinfo.username },
    });

    // 管理员不存在
    if (!user) return res.cc('登录失败！管理员不存在');

    // 判断密码是否正确
    const compareResult = bcrypt.compareSync(userinfo.password, user.password);
    if (!compareResult) return res.cc('登录失败！密码错误');

    // 判断用户是否被禁用
    if (user.status === 0) return res.cc('登录失败！管理员被禁用');

    // 判断用户是否为管理员
    if (user.role !== 3 && user.role !== 2) return res.cc('登录失败！您不是管理员');

    // 在服务器端生成 Token 的字符串
    const userForToken = {
      id: user.id,
      role: user.role,
    };
    // 对用户的信息进行加密，生成 Token 字符串
    const tokenStr = jwt.sign(userForToken, config.jwtSecretKey, { expiresIn: config.expiresIn });

    res.send({
      code: 200,
      message: '登录成功！',
      data: {
        token: tokenStr,
        role: user.role,
        userInfo: {
          // 新增用户信息返回
          id: user.id,
          username: user.username,
          avatar: user.icon || '',
          createTime: user.create_time || new Date(),
        },
      },
    });
  } catch (error) {
    console.log('登录失败：', error);
    return res.status(500).json({
      message: '登陆失败',
    });
  }
};

// 登出
exports.logoutAdmin = async (req, res) => {
  try {
    // TODO: 登出操作
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to logout' });
  }
};

// 获取访问某个审核状态的所有游记
exports.getTripByStatus = async (req, res) => {
  try {
    if (req.role !== 2 && req.role !== 3) {
      return res.status(403).json({ message: '无权限获取审核游记列表' });
    }
    const status = req.params.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: trips } = await Trip.findAndCountAll({
      where: {
        is_deleted: 0,
        status: status,
      },
      limit,
      offset,
      order: [['create_time', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon', 'username'],
        },
        {
          model: TripReviewRecord,
          as: 'reviewRecords',
          attributes: ['reason'],
        },
      ],
    });

    if (offset >= count && count !== 0) {
      return res.status(404).json({ code: 404, message: '页码超出范围' });
    }

    // 修改返回数据格式以匹配前端AuditItem接口
    const formattedTrips = trips.map((trip) => ({
      key: trip.id,
      title: trip.title,
      author: trip.user.username,
      status: trip.status,
      createTime: trip.create_time,
      updateTime: trip.update_time,
      content: trip.content,
      rejectReason: trip.reviewRecords.length > 0 ? trip.reviewRecords[0].reason : '',
    }));

    res.status(200).json({
      code: 200,
      data: formattedTrips,
      total: count, // 新增total字段，用于前端分页组件的totalInf
      message: '获取成功',
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 获取所有游记
exports.getTripList = async (req, res) => {
  try {
    if (req.role !== 2 && req.role !== 3) {
      return res.status(403).json({ message: '无权限获取审核游记列表' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: trips } = await Trip.findAndCountAll({
      where: {
        is_deleted: 0, // 修复语法错误
      },
      limit,
      offset,
      order: [['create_time', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon', 'username'], // 添加username字段
        },
      ],
    });

    if (offset >= count && count !== 0) {
      return res.status(404).json({ code: 404, message: '页码超出范围' });
    }

    // 修改返回数据格式以匹配前端AuditItem接口
    const formattedTrips = trips.map((trip) => ({
      key: trip.id,
      title: trip.title,
      author: trip.user.username,
      status: trip.status,
      createTime: trip.create_time,
      updateTime: trip.update_time,
      content: trip.content,
    }));

    res.status(200).json({
      code: 200,
      data: formattedTrips,
      message: '获取成功',
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 获取单个游记详情
exports.getTripDetail = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon'],
        },
      ],
    });

    if (trip) {
      res.status(200).json({
        code: 200,
        data: {
          key: trip.id,
          title: trip.title,
          author: trip.user.username,
          status: trip.status,
          createTime: trip.create_time,
          content: trip.content,
        },
      });
    } else {
      return {
        code: 404,
        message: '游记不存在',
      };
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 审核通过
exports.passAuditTrip = async (req, res) => {
  try {
    // 校验身份，super和admin才能审核通过
    if (req.role !== 2 && req.role !== 3) {
      return res.status(403).json({
        code: 403,
        message: '无权限审核游记',
      });
    }

    const tripId = req.body.id;
    const reviewerId = req.id;

    // 开启事务
    const t = await db.transaction();

    try {
      // 1. 更新游记状态
      await Trip.update(
        { status: 1 }, // 1: 通过
        {
          where: { id: tripId },
          transaction: t,
        },
      );

      // 2. 创建审核记录
      await TripReviewRecord.create(
        {
          travelogue_id: tripId,
          reviewer_id: reviewerId,
          status: 1, // 1: 通过
          reviewed_at: new Date(),
        },
        { transaction: t },
      );

      // 提交事务
      await t.commit();
      res.status(200).json({
        code: 200,
        message: '审核通过',
      });
    } catch (error) {
      // 回滚事务
      await t.rollback();
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 审核拒绝
exports.rejectAuditTrip = async (req, res) => {
  try {
    if (req.role !== 2 && req.role !== 3) {
      ss;
      return res.status(403).json({
        code: 403,
        message: '无权限审核游记',
      });
    }

    const tripId = req.body.id;
    const reviewerId = req.id;
    const reason = req.body.reason;
    // 拒绝原因必填
    if (!reason || reason === '') {
      return res.status(400).json({
        code: 400,
        message: '拒绝原因不能为空',
      });
    }

    // 开启事务
    const t = await db.transaction();

    try {
      // 1. 更新游记状态
      await Trip.update(
        { status: 2 }, // 2: 拒绝
        {
          where: { id: tripId },
          transaction: t,
        },
      );

      // 2. 创建审核记录
      await TripReviewRecord.create(
        {
          travelogue_id: tripId,
          reviewer_id: reviewerId,
          status: 2, // 2: 拒绝
          reason: reason,
          reviewed_at: new Date(),
        },
        { transaction: t },
      );

      // 提交事务
      await t.commit();
      res.status(200).json({
        code: 200,
        message: '拒绝通过',
      });
    } catch (error) {
      // 回滚事务
      await t.rollback();
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 删除游记
exports.deleteAuditTrip = async (req, res) => {
  try {
    if (req.role != 2 && req.role !== 3) {
      return res.status(403).json({
        code: 403,
        message: '无权限删除游记',
      });
    }
    const tripId = req.params.id;

    try {
      // 1. 逻辑删除游记
      await Trip.update(
        { is_deleted: 1 },
        {
          where: { id: tripId },
        },
      );

      res.status(200).json({
        code: 200,
        message: '游记删除成功',
      });
    } catch (error) {
      // 回滚事务
      await t.rollback();
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 管理页面
// 获取所有用户
exports.getAllUsers = async (req, res) => {
  const userRole = req.role;
  // TODO：审核员可以获取吗？
  if (userRole !== 3) {
    return res.status(403).json({ message: '权限不足' });
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
      limit: limit,
    });
    if (skip >= count) {
      throw new Error('页码超出范围');
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
    return res.status(403).json({ message: '权限不足' });
  }
  try {
    await User.destroy({ where: { id: req.query.id } });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 创建用户
exports.createUser = async (req, res) => {
  const userRole = req.userRole;
  if (userRole !== 'super') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  const { username, password } = req.body;
  //   如果没有传入密码，则默认密码为adminadmin
  if (!password) {
    password = 'adminadmin';
  }

  try {
    // 检查用户名是否已存在
    const exist_user = await User.findOne({ where: { username } });
    if (exist_user) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      nick_name: username,
      password: hashedPassword,
      role: 1, // 默认普通用户角色
    });
    const userInfo = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    res.status(201).json({ message: 'User created', userInfo });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  const userRole = req.userRole;
  if (userRole !== 'super') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  password = 'adminadmin';
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.update({ password: hashedPassword }, { where: { id: req.params.id } });
    res.status(200).json({ message: 'Password reset' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
