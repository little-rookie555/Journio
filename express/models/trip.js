const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键'
  },
  user_id: { 
    type: DataTypes.BIGINT.UNSIGNED, 
    allowNull: false,
    field: 'user_id',
    comment: '用户id'
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: false,
    comment: '标题'
  },
  status: { 
    type: DataTypes.TINYINT, 
    allowNull: false,
    defaultValue: 0,
    comment: '审核状态（0：待审查，1：通过，2：拒绝）'
  },
  images: { 
    type: DataTypes.STRING(2048), 
    allowNull: false,
    defaultValue: '',
    comment: '探店的照片，最多9张，多张以","隔开',
    get() {
      const rawValue = this.getDataValue('images');
      return rawValue ? rawValue.split(',') : [];
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('images', value.join(','));
      } else {
        this.setDataValue('images', value || '');
      }
    }
  },
  video_url: {
    type: DataTypes.STRING(2048),
    allowNull: true,
    field: 'video_url',
    comment: '视频链接'
  },
  content: { 
    type: DataTypes.STRING(2048), 
    allowNull: false,
    comment: '文字描述'
  },
  liked: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: 0,
    comment: '点赞数量'
  },
  comments: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: '评论数量'
  },
  create_time: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW,
    field: 'create_time',
    comment: '创建时间'
  },
  update_time: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW,
    field: 'update_time',
    comment: '更新时间'
  }
}, {
  tableName: 'tb_blog',
  timestamps: false,
  underscored: true // 使用下划线命名法
});

module.exports = Trip;