const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const joi = require('@hapi/joi');

// 定义Sequelize用户模型
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    nick_name: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: true,
      unique: false,
    },
    icon: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      defaultValue: '',
    },
    create_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    update_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1-正常，0-禁用
      allowNull: false,
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1-普通用户 2-审核人员 3-管理员
      allowNull: false,
    },
    desc: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '',
    },
    follow_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    fan_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: 'tb_user',
    timestamps: false,
  },
);

// 定义与Trip模型的关联关系
// User.associate = (models) => {
//   User.hasMany(models.Trip, {
//     foreignKey: 'userId',
//     as: 'trip'
//   });
// };

// 导出User模型
module.exports = User;

// 以下是根据User模型更新的验证规则

// 定义用户名和密码的验证规则
const nick_name = joi.string().alphanum().min(1).max(32).required();
const username = joi.string().alphanum().min(1).max(32).required();
const password = joi
  .string()
  .pattern(/^[\S]{6,12}$/)
  .required();

// 定义 id 和 phone 的验证规则
const id = joi.number().integer().min(1).required();
const phone = joi
  .string()
  .pattern(/^1[3-9]\d{9}$/)
  .required();

// 定义验证 icon 头像的验证规则
const icon = joi.string().dataUri().required();

// 定义验证注册和登录表单数据的规则对象
exports.reg_login_schema = {
  body: {
    username,
    password,
  },
};

// 定义验证注册和登录表单数据的规则对象
exports.reg_gerister_schema = {
  body: {
    username,
    password,
    nick_name,
  },
};

// 验证规则对象 - 更新用户基本信息
exports.update_userinfo_schema = {
  // 需要对 req.body 里面的数据进行验证
  body: {
    id,
    phone,
  },
};

// 验证规则对象 - 更新密码
exports.update_password_schema = {
  body: {
    old_password: password,
    new_password: joi.not(joi.ref('old_password')).concat(password),
  },
};

// 验证规则对象 - 更新头像
exports.update_avatar_schema = {
  body: {
    icon,
  },
};
