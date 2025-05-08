const sequelize = require('../config/db');
const User = require('./user');
const { Trip, TripLike, TripStar } = require('./trip');
const TripReviewRecord = require('./tripReviewRecord');
const Comment = require('./comment');

// 定义模型之间的关联关系
User.hasMany(Trip, {
  foreignKey: 'userId',
  as: 'trips',
});
Trip.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// 建立关联关系
Trip.hasMany(TripLike, { foreignKey: 'travel_id' });
TripLike.belongsTo(Trip, { foreignKey: 'travel_id' });

Trip.hasMany(TripStar, { foreignKey: 'travel_id' });
TripStar.belongsTo(Trip, { foreignKey: 'travel_id' });
Trip.hasMany(TripReviewRecord, {
  foreignKey: 'travelogue_id',
  as: 'reviewRecords',
});

TripReviewRecord.belongsTo(Trip, {
  foreignKey: 'travelogue_id',
  as: 'trip',
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

// 评论关联关系
Trip.hasMany(Comment, {
  foreignKey: 'travel_id',
  as: 'travelComments',
});
Comment.belongsTo(Trip, {
  foreignKey: 'travel_id',
  as: 'trip',
});
User.hasMany(Comment, {
  foreignKey: 'user_id',
  as: 'userComments',
});
Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

module.exports = {
  sequelize,
  User,
  Trip,
  TripReviewRecord,
  TripLike,
  TripStar,
  Comment,
};
