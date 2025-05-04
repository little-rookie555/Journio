const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TripReviewRecord = sequelize.define('TripReviewRecord', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键'
  },
  travelogue_id: { 
    type: DataTypes.BIGINT.UNSIGNED, 
    allowNull: false,
    field: 'travelogue_id',
    comment: '关联游记ID（关联游记表）'
  },
  reviewer_id: { 
    type: DataTypes.BIGINT.UNSIGNED, 
    allowNull: false,
    field: 'reviewer_id',
    comment: '审核人员ID（关联用户表）'
  },
  status: { 
    type: DataTypes.TINYINT, 
    allowNull: false,
    comment: '审核状态（0：待审查，1：通过，2：拒绝）'
  },
  reason: { 
    type: DataTypes.TEXT, 
    allowNull: true,
    defaultValue: '',
    comment: '拒绝原因（仅在拒绝时填写）'
  },
  reviewed_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW,
    field: 'reviewed_at',
    comment: '审核时间'
  }
}, {
  tableName: 'tb_review_record',
  timestamps: false,
  underscored: true // 使用下划线命名法
});

module.exports = TripReviewRecord;