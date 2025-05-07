// 导入定义验证规则的包
const joi = require('@hapi/joi')

// 定义用户名和密码的验证规则
const username = joi.string().alphanum().min(1).max(32).required();

const nick_name = joi.string()
  .min(1)
  .max(32)
  .pattern(/^[\u4E00-\u9FA5A-Za-z0-9_]+$/)
  .required()
  .messages({
    'string.pattern.base': '昵称只能包含中文、英文、数字和下划线'
  })
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
exports.reg_login_schema = joi.object({
  username,
  password,
})

exports.reg_reg_schema = joi.object({
  username,
  nickname: nick_name,
  password,
  avatar: joi.string().allow('').optional()
})


// 验证规则对象 - 更新用户基本信息
exports.update_userinfo_schema = joi.object({
  id,
  phone,
})

// 验证规则对象 - 更新密码
exports.update_password_schema = joi.object({
  old_password: password,
  new_password: joi.not(joi.ref('old_password')).concat(password),
})

// 验证规则对象 - 更新头像
exports.update_avatar_schema = joi.object({
  icon
})
