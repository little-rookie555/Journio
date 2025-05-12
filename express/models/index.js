const sequelize = require('../config/db');
// const redisClient = require('../config/redis');
const User = require('./user');
const { Trip, TripLike, TripStar, TripFollow } = require('./trip');
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

// 添加User与TripStar的关联关系
User.hasMany(TripStar, {
  foreignKey: 'user_id',
  as: 'userStars',
});
TripStar.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});
Trip.hasMany(TripReviewRecord, {
  foreignKey: 'travelogue_id',
  as: 'reviewRecords',
});

TripReviewRecord.belongsTo(Trip, {
  foreignKey: 'travelogue_id',
  as: 'trip',
});

// 添加TripFollow的关联关系
TripFollow.belongsTo(User, {
  foreignKey: 'follow_user_id',
  as: 'followUser',
});
TripFollow.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'fanUser',
});

// 同步所有模型到数据库
const syncModels = async () => {
  try {
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
  TripFollow,
  Comment,
};
