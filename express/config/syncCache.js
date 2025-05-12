const { Trip, TripLike, TripStar } = require('../models');
const redisClient = require('./redis');
const db = require('./db');

// 同步点赞和收藏数据到数据库
async function syncLikeAndStarToDatabase() {
  const transaction = await db.transaction();
  try {
    // 1. 同步每个游记的点赞、收藏数

    // 1.1 获取所有游记
    const trips = await Trip.findAll({
      where: { is_deleted: 0 },
      attributes: ['id'],
      transaction,
    });

    // 1.2 更新每个游记的点赞和收藏数
    for (const trip of trips) {
      const likeCount = await redisClient.get(`travel:likeCount:${trip.id}`);
      const starCount = await redisClient.get(`travel:starCount:${trip.id}`);

      if (likeCount !== null || starCount !== null) {
        const updateData = {};

        if (likeCount !== null) {
          updateData.liked = parseInt(likeCount);
        }

        if (starCount !== null) {
          updateData.starred = parseInt(starCount);
        }

        if (Object.keys(updateData).length > 0) {
          await Trip.update(updateData, {
            where: { id: trip.id },
            transaction,
          });
        }
      }
    }

    //   // 2. 同步点赞记录、收藏记录
    //   // 获取所有用户点赞记录
    //   const userLikes = await redisClient.keys('user:likes:*');
    //   const userStars = await redisClient.keys('user:stars:*');

    //   // 遍历每个用户点赞记录，更新数据库
    //   for (const userLikeKey of userLikes) {
    //     const userId = parseInt(userLikeKey.split(':')[2]);
    //     const likedTravelIds = await redisClient.sMembers(userLikeKey);

    //     // console.log(userId, likedTravelIds);

    //     // 更新用户点赞记录
    //     await TripLike.bulkCreate(
    //       likedTravelIds.map((travelId) => ({
    //         travel_id: parseInt(travelId),
    //         user_id: userId,
    //         is_liked: 1,
    //         create_time: Date.now(),
    //       })),
    //       {
    //         updateOnDuplicate: ['is_liked'],
    //         transaction
    //       }
    //     );
    //   }

    //   // 遍历每个用户收藏记录，更新数据库
    //   for (const userStarKey of userStars) {
    //     const userId = parseInt(userStarKey.split(':')[2]);
    //     const starredTravelIds = await redisClient.sMembers(userStarKey);

    //     // 更新用户收藏记录
    //     await TripStar.bulkCreate(
    //       starredTravelIds.map((travelId) => ({
    //         travel_id: parseInt(travelId),
    //         user_id: userId,
    //         is_starred: 1,

    //       })),
    //       {
    //         updateOnDuplicate: ['is_starred'],
    //         transaction
    //       }
    //     );
    //   }

    await transaction.commit();

    console.log('同步点赞和收藏数据成功');
  } catch (error) {
    await transaction.rollback();
    console.error('同步点赞和收藏数据失败:', error);
  }
}

// 设置定时任务，每10min同步一次
function setupSyncTask() {
  setInterval(syncLikeAndStarToDatabase, 10 * 60 * 1000);

  // 应用关闭前同步一次
  process.on('SIGINT', async () => {
    console.log('应用关闭，执行最后一次同步...');
    await syncLikeAndStarToDatabase();
    process.exit(0);
  });
}

module.exports = { syncLikeAndStarToDatabase, setupSyncTask };
