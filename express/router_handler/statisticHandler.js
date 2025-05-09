const { User, Trip } = require('../models');
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

// 获取前一周的统计数据
exports.getAccessStats = async (req, res) => {
  try {
    const oneWeekAgo = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);

    // 获取每日新增用户数
    const userStats = await User.findAll({
      attributes: [
        [db.fn('DATE', db.col('create_time')), 'date'],
        [db.fn('COUNT', db.col('id')), 'user'],
      ],
      where: {
        create_time: {
          [Op.gte]: oneWeekAgo,
        },
      },
      group: ['date'],
      order: [['date', 'ASC']],
    });

    // 获取每日新增游记数
    const tripStats = await Trip.findAll({
      attributes: [
        [db.fn('DATE', db.col('create_time')), 'date'],
        [db.fn('COUNT', db.col('id')), 'trip'],
      ],
      where: {
        create_time: {
          [Op.gte]: oneWeekAgo,
        },
      },
      group: ['date'],
      order: [['date', 'ASC']],
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

    res.status(200).json({ code: 200, data: mergedStats });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};
