const { Trip, User, TripFollow, TripStar, TripLike } = require('../models');
const db = require('../config/db');
const Op = require('sequelize').Op;

// 关注功能
exports.followUser = async (req, res) => {
  try {
    const { userId, followUserId, isFollow } = req.body;
    if (isFollow) {
      // 若关注，则将结果保存入数据库
      await TripFollow.create({
        user_id: userId,
        follow_user_id: followUserId,
      });
      // 在数据库中更新关注数和粉丝数
      await User.increment('follow_count', {
        by: 1,
        where: { id: userId },
      });
      await User.increment('fan_count', {
        by: 1,
        where: { id: followUserId },
      });
      return res.status(200).json({
        code: 200,
        message: '关注成功',
      });
    } else {
      // 若取消关注，则将结果从数据库删除
      await TripFollow.destroy({
        where: {
          user_id: userId,
          follow_user_id: followUserId,
        },
      });
      // 在数据库中更新关注数和粉丝数
      await User.decrement('follow_count', {
        by: 1,
        where: { id: userId },
      });
      await User.decrement('fan_count', {
        by: 1,
        where: { id: followUserId },
      });
      return res.status(200).json({
        code: 200,
        message: '取消关注成功',
      });
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 查询关注列表
exports.getFollowList = async (req, res) => {
  try {
    const { userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 1000;
    const offset = (page - 1) * limit;
    // 先获取关注用户的ID列表
    const followList = await TripFollow.findAll({
      where: { user_id: userId },
      limit,
      offset,
      attributes: ['follow_user_id'],
    });

    // 获取被关注用户的ID数组
    const followUserIds = followList.map((item) => item.follow_user_id);

    // 从User表中查询这些用户的详细信息
    const userList = await User.findAll({
      where: {
        id: {
          [Op.in]: followUserIds,
        },
      },
      attributes: ['id', 'nick_name', 'icon', 'desc'],
    });

    // 格式化返回数据
    const formattedList = userList.map((user) => ({
      id: user.id,
      username: user.nick_name,
      avatar: user.icon,
      desc: user.desc,
    }));

    return res.status(200).json({
      code: 200,
      data: formattedList,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 查询粉丝列表
exports.getFanList = async (req, res) => {
  try {
    const { userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 1000;
    const offset = (page - 1) * limit;

    // 先获取关注用户的ID列表
    const fanList = await TripFollow.findAll({
      where: { follow_user_id: userId },
      limit,
      offset,
      attributes: ['user_id'],
    });

    // 获取被关注用户的ID数组
    const fanUserIds = fanList.map((item) => item.user_id);

    // 从User表中查询这些用户的详细信息
    const userList = await User.findAll({
      where: {
        id: {
          [Op.in]: fanUserIds,
        },
      },
      attributes: ['id', 'nick_name', 'icon', 'desc'],
    });

    // 格式化返回数据
    const formattedList = userList.map((user) => ({
      id: user.id,
      username: user.nick_name,
      avatar: user.icon,
      desc: user.desc,
    }));

    return res.status(200).json({
      code: 200,
      data: formattedList,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 查询是否关注
exports.checkIsFollow = async (req, res) => {
  try {
    const { userId, followUserId } = req.query;
    const follow = await TripFollow.findOne({
      where: {
        user_id: userId,
        follow_user_id: followUserId,
      },
    });
    return res.status(200).json({
      code: 200,
      data: !!follow,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 查询收藏列表
exports.getStarList = async (req, res) => {
  try {
    const { userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 1000;
    const offset = (page - 1) * limit;

    const starList = await TripStar.findAll({
      where: {
        user_id: userId,
        is_starred: 1,
      },
      limit,
      offset,
      include: [
        {
          model: Trip,
          attributes: [
            'id',
            'title',
            'content',
            'coverImage',
            'create_time',
            'images',
            'status',
            'travel_data',
            'duration',
            'cost',
            'liked',
            'video_url',
            'locations',
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon'],
        },
      ],
    });

    // 2. 格式化数据
    const formattedList = starList.map((trip) => ({
      id: trip.Trip.id,
      title: trip.Trip.title,
      content: trip.Trip.content,
      coverImage: trip.Trip.coverImage, // 修改为从trip.Trip获取
      images: trip.Trip.images,
      video: trip.Trip.video_url,
      status: trip.Trip.status,
      createTime: trip.Trip.create_time,
      travelDate: trip.Trip.travel_data,
      duration: trip.Trip.duration,
      cost: trip.Trip.cost,
      likeCount: trip.Trip.liked,
      isLiked: false,
      locations: trip.Trip.locations ? trip.Trip.locations : [], // 修改为从trip.Trip获取
      author: {
        id: trip.user.id,
        nickname: trip.user.nick_name,
        avatar: trip.user.icon,
      },
    }));

    // 3. 获取用户点赞状态
    const likedTripIds = (
      await TripLike.findAll({
        where: {
          user_id: req.query.userId,
          travel_id: {
            [Op.in]: formattedList.map((trip) => trip.id), // 使用格式化后的列表
          },
          is_liked: 1,
        },
        attributes: ['travel_id'],
        raw: true,
      })
    ).map((like) => like.travel_id);

    console.log(likedTripIds); // 打印出likedTripIds数组的内容，以确认是否正确获取了数据

    // 为每个游记添加isLiked字段
    formattedList.forEach((trip) => {
      trip.isLiked = likedTripIds.includes(trip.id);
    });

    return res.status(200).json({
      code: 200,
      data: formattedList,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};
