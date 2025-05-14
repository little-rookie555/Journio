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

// 获取统计数据
exports.getAccessStats = async (req, res) => {
  try {
    const { page = 1, pageSize = 30, startDate, endDate } = req.query;
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

    // 获取所有日期（不分页）以计算总记录数
    const allDates = await db.query(
      `
      SELECT DISTINCT DATE(create_time) as date 
      FROM tb_user 
      WHERE create_time ${startDate && endDate ? `BETWEEN '${startDate}' AND '${endDate}'` : `>= DATE_SUB(NOW(), INTERVAL 7 DAY)`}
      UNION
      SELECT DISTINCT DATE(create_time) as date 
      FROM tb_blog 
      WHERE create_time ${startDate && endDate ? `BETWEEN '${startDate}' AND '${endDate}'` : `>= DATE_SUB(NOW(), INTERVAL 7 DAY)`}
      ORDER BY date ASC
    `,
      { type: db.QueryTypes.SELECT },
    );

    // 计算总记录数
    const totalCount = allDates.length;

    // 获取分页后的日期范围
    const paginatedDates = allDates.slice(offset, offset + parseInt(pageSize));

    if (paginatedDates.length === 0) {
      return res.status(200).json({
        code: 200,
        data: {
          list: [],
          total: totalCount,
        },
      });
    }

    // 构建日期条件
    const dateList = paginatedDates.map((item) => `'${item.date}'`).join(',');

    // 获取每日新增用户数
    const userStats = await db.query(
      `
      SELECT 
        DATE(create_time) as date,
        COUNT(id) as user
      FROM tb_user
      WHERE DATE(create_time) IN (${dateList})
      GROUP BY DATE(create_time)
      ORDER BY date ASC
    `,
      { type: db.QueryTypes.SELECT },
    );

    // 获取每日新增游记数
    const tripStats = await db.query(
      `
      SELECT 
        DATE(create_time) as date,
        COUNT(id) as trip
      FROM tb_blog
      WHERE DATE(create_time) IN (${dateList})
      GROUP BY DATE(create_time)
      ORDER BY date ASC
    `,
      { type: db.QueryTypes.SELECT },
    );

    // 合并数据，确保每个日期都有数据
    const mergedStats = paginatedDates.map((dateObj) => {
      const date = dateObj.date;
      const userStat = userStats.find((stat) => stat.date === date);
      const tripStat = tripStats.find((stat) => stat.date === date);

      return {
        date,
        user: userStat ? parseInt(userStat.user) : 0,
        trip: tripStat ? parseInt(tripStat.trip) : 0,
      };
    });

    res.status(200).json({
      code: 200,
      data: {
        list: mergedStats,
        total: totalCount,
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
