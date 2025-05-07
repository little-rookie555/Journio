const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const joi = require('@hapi/joi');

// 定义Sequelize用户模型
const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true
  },
  password: { 
    type: DataTypes.STRING(128), 
    allowNull: false 
  },
  icon: { 
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  create_time: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // 1-正常，0-禁用
    allowNull: false
  },
  role: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // 1-普通用户 2-审核人员 3-管理员
    allowNull: false
  }
}, {
  tableName: 'tb_user',
  timestamps: false
});

// 导出User模型
module.exports = Admin;
