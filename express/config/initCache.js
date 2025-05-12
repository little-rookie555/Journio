const { Trip, TripLike, TripStar } = require('../models');
const redisClient = require('./redis');

// 初始化点赞和收藏缓存
async function initLikeAndStarCache() {
  try {
    console.log('开始初始化点赞和收藏缓存...');
    // 清空缓存
    await redisClient.flushAll();

    // 1. 初始化游记点赞数量和收藏数量
    // 获取所有游记
    const trips = await Trip.findAll({
      where: { is_deleted: 0 },
      attributes: ['id', 'liked', 'starred'],
    });

    // 获取所有点赞记录
    const likes = await TripLike.findAll({
      where: { is_liked: 1 },
      attributes: ['travel_id', 'user_id'],
    });

    // 获取所有收藏记录
    const stars = await TripStar.findAll({
      where: { is_starred: 1 },
      attributes: ['travel_id', 'user_id'],
    });

    // 初始化游记点赞计数
    for (const trip of trips) {
      await redisClient.set(`travel:likeCount:${trip.id}`, String(trip.liked || 0));
      await redisClient.set(`travel:starCount:${trip.id}`, String(trip.starred || 0));
    }

    // 2. 初始化用户点赞记录和收藏记录
    const userLikes = {};
    const tripLikes = {};

    for (const like of likes) {
      // 用户点赞列表
      if (!userLikes[like.user_id]) {
        userLikes[like.user_id] = [];
      }
      userLikes[like.user_id].push(like.travel_id);

      // 游记被点赞用户列表
      if (!tripLikes[like.travel_id]) {
        tripLikes[like.travel_id] = [];
      }
      tripLikes[like.travel_id].push(like.user_id);
    }

    // 初始化用户收藏记录
    const userStars = {};
    const tripStars = {};

    for (const star of stars) {
      // 用户收藏列表
      if (!userStars[star.user_id]) {
        userStars[star.user_id] = [];
      }
      userStars[star.user_id].push(star.travel_id);

      // 游记被收藏用户列表
      if (!tripStars[star.travel_id]) {
        tripStars[star.travel_id] = [];
      }
      tripStars[star.travel_id].push(star.user_id);
    }

    // 将数据写入Redis
    for (const userId in userLikes) {
      if (userLikes[userId].length > 0) {
        await redisClient.sAdd(`user:likes:${userId}`, userLikes[userId].map(String));
      }
    }

    // for (const tripId in tripLikes) {
    //   if (tripLikes[tripId].length > 0) {
    //     await redisClient.sAdd(`travel:likes:${tripId}`, tripLikes[tripId].map(String));
    //   }
    // }

    for (const userId in userStars) {
      if (userStars[userId].length > 0) {
        await redisClient.sAdd(`user:stars:${userId}`, userStars[userId].map(String));
      }
    }

    // for (const tripId in tripStars) {
    //   if (tripStars[tripId].length > 0) {
    //     await redisClient.sAdd(`travel:stars:${tripId}`, tripStars[tripId].map(String));
    //   }
    // }

    console.log('点赞和收藏缓存初始化完成');
  } catch (error) {
    console.error('初始化点赞和收藏缓存失败:', error);
  }
}

module.exports = { initLikeAndStarCache };
