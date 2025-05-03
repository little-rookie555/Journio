const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  content: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  createTime: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  updateTime: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  userId: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  images: { 
    type: DataTypes.TEXT, 
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('images');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value || []));
    }
  },
  // 审核状态：wait-待审核，pass-审核通过，reject-审核拒绝
  auditStatus: { 
    type: DataTypes.STRING, 
    defaultValue: "wait" 
  },
  // 审核时间
  auditTime: { 
    type: DataTypes.DATE,
    allowNull: true
  },
  // 审核人
  auditor: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  // 删除原因
  deleteReason: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  // 逻辑删除标识
  isDeleted: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  // 拒绝原因
  rejectReason: { 
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'trips',
  timestamps: false
});

module.exports = Trip;