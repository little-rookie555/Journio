const { User, Trip, TripLike, TripStar } = require('../models');
const { Op } = require('sequelize');
const db = require('../config/db');

// 获取用户总量
exports.getUserNumber = async (req, res) => {
  try {
    const count = await User.count();
    res.status(200).json({ code: 200, data: count });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// 获取游记总量
exports.getContentNumber = async (req, res) => {
  try {
    const count = await Trip.count();
    res.status(200).json({ code: 200, data: count });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// 获取待审核的游记数量
exports.getPendingNumber = async (req, res) => {
  try {
    const count = await Trip.count({
      where: {
        status: 0,
      },
    });
    res.status(200).json({ code: 200, data: count });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// 获取总点赞数
exports.getLikeNumber = async (req, res) => {
  try {
    const count = await TripLike.count();
    res.status(200).json({ code: 200, data: count });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// 获取总收藏数
exports.getStarNumber = async (req, res) => {
  try {
    const count = await TripStar.count();
    res.status(200).json({ code: 200, data: count });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// 获取前一周的统计数据
exports.getAccessStats = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;

    // 设置日期范围
    let dateRange = {};
    if (startDate && endDate) {
      dateRange = {
        create_time: {
          [Op.between]: [startDate, endDate],
        },
      };
    } else {
      const oneWeekAgo = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
      dateRange = {
        create_time: {
          [Op.gte]: oneWeekAgo,
        },
      };
    }

    // 获取每日新增用户数
    const userStats = await User.findAll({
      attributes: [
        [db.fn('DATE', db.col('create_time')), 'date'],
        [db.fn('COUNT', db.col('id')), 'user'],
      ],
      where: dateRange,
      group: ['date'],
      order: [['date', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset),
    });

    // 获取每日新增游记数
    const tripStats = await Trip.findAll({
      attributes: [
        [db.fn('DATE', db.col('create_time')), 'date'],
        [db.fn('COUNT', db.col('id')), 'trip'],
      ],
      where: dateRange,
      group: ['date'],
      order: [['date', 'DESC']],
    });

    // 获取总记录数
    const totalCount = await User.count({
      attributes: [[db.fn('DATE', db.col('create_time')), 'date']],
      where: dateRange,
      group: ['date'],
    });

    // 合并用户和游记统计数据
    const mergedStats = userStats.map((userStat) => {
      const date = userStat.get('date');
      const tripStat = tripStats.find((t) => t.get('date') === date);
      return {
        date,
        user: parseInt(userStat.get('user')),
        trip: tripStat ? parseInt(tripStat.get('trip')) : 0,
      };
    });

    res.status(200).json({
      code: 200,
      data: {
        list: mergedStats,
        total: totalCount.length,
      },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// 获取高质量游记比例
exports.getQualityRate = async (req, res) => {
  try {
    // 获取所有已审核通过的游记数量
    const totalTrips = await Trip.count({
      where: {
        status: 1, // 已审核通过的游记
      },
    });

    // 获取高质量游记数量（有点赞、收藏或评论的游记）
    const qualityTrips = await Trip.count({
      where: {
        status: 1,
        [Op.and]: [{ liked: { [Op.gt]: 0 } }, { starred: { [Op.gt]: 0 } }],
      },
    });

    // 计算比例
    const rate = totalTrips > 0 ? Math.round((qualityTrips / totalTrips) * 100) : 0;

    res.status(200).json({ code: 200, data: rate });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};
