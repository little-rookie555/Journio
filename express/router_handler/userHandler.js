const { User, TripFollow, TripStar, Trip } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// 获取用户基本信息
exports.getUserInfo = async (req, res) => {
  const userId = req.query.id;
  try {
    // 1. 查询用户表 基本信息
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nick_name', 'icon', 'desc', 'follow_count', 'fan_count'],
    });

    if (!user) return res.cc('获取用户信息失败！');

    // 2. 查询获赞数（通过用户发布的所有游记获得的点赞总数）
    const travels = await Trip.findAll({
      where: {
        user_id: userId,
        is_deleted: 0,
        status: 1,
      },
      attributes: ['id', 'liked', 'starred'],
    });
    const [likedCount, starredCount] = travels.reduce(
      (acc, travel) => [acc[0] + (travel.liked || 0), acc[1] + (travel.starred || 0)],
      [0, 0],
    );
    const approvedTripCount = travels.length;

    res.send({
      code: 200,
      message: '获取用户信息成功！',
      data: {
        id: user.id,
        nickname: user.nick_name,
        avatar: user.icon,
        desc: user.desc,
        followingCount: user.follow_count, // 关注数
        fanCount: user.fan_count, // 粉丝数
        likedCount, // 获赞数
        starredCount, // 收藏数
        approvedTripCount, // 已通过游记数
      },
    });
  } catch (error) {
    res.cc(error);
  }
};

// 更新用户基本信息
exports.updateUserInfo = async (req, res) => {
  try {
    // 获取当前用户ID和客户端提交的数据
    const id = req.id;
    const { nickname, avatar, desc } = req.body;

    // 查询昵称是否被占用（排除当前用户）
    const existnick = await User.findOne({
      where: {
        nick_name: nickname,
        id: { [Op.ne]: id }, // 排除当前用户
      },
    });

    if (existnick) {
      return res.cc('昵称被占用，请更换其他昵称！');
    }

    // 更新用户信息
    await User.update(
      {
        nick_name: nickname,
        icon: avatar,
        desc: desc,
        update_time: new Date(),
      },
      { where: { id } },
    );

    res.send({
      code: 200,
      message: '更新成功！',
      data: {
        id: id,
        desc: desc,
        nickname: nickname,
        avatar: avatar,
      },
    });
  } catch (error) {
    res.cc(error);
  }
};

// 注册新用户
exports.registerUser = async (req, res) => {
  try {
    // 获取客户端提交到服务器的用户信息
    const userinfo = req.body;

    // 查询用户名是否被占用
    const existUser = await User.findOne({ where: { username: userinfo.username } });
    const existnick = await User.findOne({ where: { nick_name: userinfo.nickname } });

    // 判断用户名是否被占用
    if (existUser) {
      return res.cc('用户名被占用，请更换其他用户名！');
    }
    if (existnick) {
      return res.cc('昵称被占用，请更换其他昵称！');
    }

    // 对密码进行加密
    const hashedPassword = bcrypt.hashSync(userinfo.password, 10);

    // 处理头像URL
    const avatarUrl = userinfo.avatar && userinfo.avatar[0] ? userinfo.avatar[0].url.trim() : '';

    // 创建新用户
    const newUser = await User.create({
      username: userinfo.username,
      nick_name: userinfo.nickname,
      password: hashedPassword,
      desc: userinfo.desc || '这个人很懒，还没有填写简介',
      icon:
        avatarUrl ||
        'https://journio.oss-cn-beijing.aliyuncs.com/public/image/%E5%A4%B4%E5%83%8F2.png',
    });

    if (!newUser) return res.cc('注册用户失败，请稍后再试！');

    res.send({
      code: 200,
      message: '注册成功！',
      data: {
        id: newUser.id,
        username: newUser.username,
        nickname: newUser.nick_name,
        icon: newUser.icon,
      },
    });
  } catch (error) {
    console.log('注册用户失败：', error);
    res.cc(error);
  }
};

// 登录
exports.loginUser = async (req, res) => {
  // 接收表单的数据
  const userinfo = req.body;

  try {
    // 根据用户名查询用户信息
    const user = await User.findOne({
      where: { username: userinfo.username },
    });

    // 用户不存在
    if (!user) return res.cc('登录失败！用户名不存在');

    // 判断密码是否正确
    const compareResult = bcrypt.compareSync(userinfo.password, user.password);
    if (!compareResult) return res.cc('登录失败！密码错误');

    // 判断用户是否被禁用
    if (user.status === 0) return res.cc('登录失败！用户被禁用');

    // 在服务器端生成 Token 的字符串
    const userForToken = {
      id: user.id,
      role: user.role,
    };

    // 对用户的信息进行加密，生成 Token 字符串
    const tokenStr = jwt.sign(userForToken, config.jwtSecretKey, { expiresIn: config.expiresIn });
    const token = 'Bearer ' + tokenStr;
    res.send({
      code: 200,
      message: '登录成功！',
      data: {
        id: user.id,
        username: user.username,
        nickname: user.nick_name,
        avatar: user.icon || '',
        createTime: user.create_time || new Date(),
        token: tokenStr,
      },
    });
  } catch (error) {
    res.cc(error);
  }
};

// 退出
exports.logoutUser = async (req, res) => {
  try {
    // TODO: 增加黑名单操作 退出后先将用户加入黑名单
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to logout' });
  }
};
