const sequelize = require('../config/db');
const User = require('./user');
const Trip = require('./trip');
const TripReviewRecord = require('./tripReviewRecord');

// 定义模型之间的关联关系
User.hasMany(Trip, { 
  foreignKey: 'userId',
  as: 'trips'  
});
Trip.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'  
});

// 建立关联关系
Trip.hasMany(TripReviewRecord, {
  foreignKey: 'travelogue_id',
  as: 'reviewRecords'
});

TripReviewRecord.belongsTo(Trip, {
  foreignKey: 'travelogue_id',
  as: 'trip'
});

// 同步所有模型到数据库
const syncModels = async () => {
  try {
    // 根据模型创建表（如果表不存在）
    // force: true 会先删除表再创建（危险操作，生产环境不建议使用）
    // alter: true 会根据模型更新表结构
    await sequelize.sync({ alter: true });
    console.log('数据库表同步成功');
  } catch (error) {
    console.error('数据库表同步失败:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Trip,
  TripReviewRecord
};