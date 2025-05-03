// 导入定义验证规则的包
const joi = require('@hapi/joi')

// 定义用户名和密码的验证规则
const nick_name = joi.string().alphanum().min(1).max(32).required()
const password = joi
  .string()
  .pattern(/^[\S]{6,12}$/)
  .required()

// 定义 id 和 phone 的验证规则
const id = joi.number().integer().min(1).required()
const phone = joi.string().pattern(/^1[3-9]\d{9}$/).required()

// 定义验证 icon 头像的验证规则
const icon = joi.string().dataUri().required()

// 定义验证注册和登录表单数据的规则对象
exports.reg_login_schema = {
  body: {
    nick_name,
    password,
  },
}

// 验证规则对象 - 更新用户基本信息
exports.update_userinfo_schema = {
  // 需要对 req.body 里面的数据进行验证
  body: {
    id,
    phone,
  },
}

// 验证规则对象 - 更新密码
exports.update_password_schema = {
  body: {
    old_password: password,
    new_password: joi.not(joi.ref('old_password')).concat(password),
  },
}

// 验证规则对象 - 更新头像
exports.update_avatar_schema = {
  body: {
    icon
  }
}
