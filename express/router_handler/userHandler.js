const { User } = require("../models");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

// 获取用户基本信息
exports.getUserInfo = async (req, res) => {
  const query = req.query
  console.log(query)
  try {
    const user = await User.findByPk(query.id, {
      attributes: ['id', 'nick_name', 'phone', 'icon']
    });
    
    if (!user) return res.cc('获取用户信息失败！')
    
    res.send({
      status: 0,
      message: '获取用户信息成功！',
      data: user
    })
    console.log('获取用户信息成功')
  } catch (error) {
    res.cc(error)
  }
};


// 更新用户基本信息
exports.updateUserInfo = async (req, res) => {
  try {
    const {nick_name, email } = req.body;
    const result = await User.update(
      { nick_name, email, updateTime: new Date() },
      { where: { id } }
    );
    
    if (result[0] !== 1) return res.cc('更新用户的基本信息失败！')
    res.cc('更新用户信息成功！', 0)
  } catch (error) {
    res.cc(error)
  }
}


// 注册新用户
exports.registerUser = async (req, res) => {
  // 获取客户端提交到服务器的用户信息
  const userinfo = req.body
  console.log(userinfo)
  // 对用户名和密码进行合法性的校验
  if (!userinfo.nick_name || !userinfo.password) {
    return res.cc('用户名或密码不能为空！')
  }
  
  try {
    // 查询用户名是否被占用
    const existUser = await User.findOne({ where: { nick_name: userinfo.nick_name } })
    
    // 判断用户名是否被占用
    if (existUser) {
      return res.cc('用户名被占用，请更换其他用户名！')
    }
    
    // 对密码进行加密
    const hashedPassword = bcrypt.hashSync(userinfo.password, 10)
    
    // 创建新用户
    const newUser = await User.create({
      nick_name: userinfo.nick_name,
      password: hashedPassword,
      phone: userinfo.phone || null
    })
    
    if (!newUser) return res.cc('注册用户失败，请稍后再试！')
    
    // 注册用户成功
    res.cc('注册成功！', 0)
  } catch (error) {
    res.cc(error)
  }
};

// 登录
exports.loginUser = async (req, res) => {
  // 接收表单的数据
  const userinfo = req.body;
  
  try {
    // 根据用户名查询用户信息
    const user = await User.findOne({ 
      where: { nick_name: userinfo.nick_name }
    });
    
    // 用户不存在
    if (!user) return res.cc('登录失败！用户名不存在');

    // 判断密码是否正确
    const compareResult = bcrypt.compareSync(userinfo.password, user.password);
    if (!compareResult) return res.cc('登录失败！密码错误');

    // 在服务器端生成 Token 的字符串
    const userForToken = {
      id: user.id,
      nick_name: user.nick_name,
    };
    
    // 对用户的信息进行加密，生成 Token 字符串
    const tokenStr = jwt.sign(userForToken, config.jwtSecretKey, { expiresIn: config.expiresIn });
    
    // 调用 res.send() 将 Token 响应给客户端
    console.log('登录用户成功：', tokenStr);
    res.send({
      status: 0,
      message: '登录成功！',
      token: 'Bearer ' + tokenStr,
    });
  } catch (error) {
    res.cc(error);
  }
}