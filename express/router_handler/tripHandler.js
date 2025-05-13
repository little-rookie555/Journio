const { Trip, TripLike, TripStar, User, Comment, TripReviewRecord } = require('../models');
const upload = require('../middlewares/upload');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('D:\\softwore\\ffmpeg-7.0.2-essentials_build\\bin\\ffmpeg.exe');
const db = require('../config/db');
const Op = require('sequelize').Op;
const { extractVideoThumbnail } = require('./imageHandler');
// 引入Redis客户端
const redisClient = require('../config/redis');
const { DetailResponse, ListResponse } = require('../utils/response');

// 创建游记
exports.createTrip = async (req, res) => {
  try {
    const userId = req.id;

    // 如果有视频，先处理视频截图
    let coverImage = req.body.coverImage;
    if (req.body.video) {
      coverImage = await extractVideoThumbnail(req.body.video);
    }

    console.log(req.body);

    // 在 createTrip 函数中
    const tripData = {
      user_id: userId,
      title: req.body.title,
      content: req.body.content,
      status: 0,
      images: req.body.images,
      coverImage: coverImage,
      video_url: req.body.video || null,
      liked: 0,
      is_deleted: 0,
      comments: 0,
      travelData: req.body.travelDate, // Changed from travel_data to travelData
      duration: req.body.duration,
      cost: req.body.cost,
      locations: req.body.locations,
    };

    await Trip.create(tripData);

    // // 获取用户信息
    // const user = await User.findByPk(userId, {
    //   attributes: ['id', 'nick_name', 'icon'],
    // });

    // 返回格式与前端一致
    return res.status(201).json({
      code: 200,
      // data: DetailResponse(newTrip, user),
      message: '创建成功',
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 更新游记
exports.updateTrip = async (req, res) => {
  try {
    const userId = req.id;
    const trip = await Trip.findByPk(req.params.id);

    if (!trip || trip.is_deleted === 1) {
      return res.status(404).json({
        code: 404,
        message: '游记不存在',
      });
    } else if (trip.user_id !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权限修改该游记',
      });
    }

    // 如果有视频，先处理视频截图
    let coverImage = req.body.coverImage;
    if (req.body.video !== trip.video_url) {
      coverImage = await extractVideoThumbnail(req.body.video);
    }
    // 更新游记内容
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      images: req.body.images,
      coverImage: coverImage || req.body.images[0], // 修复bug：若用户删除了第一张图片，导致coverImage为空
      video_url: req.body.video,
      status: 0, // 修改后重新设为待审核状态
      update_time: new Date(),
      travelData: req.body.travelDate,
      duration: req.body.duration,
      cost: req.body.cost,
      locations: req.body.locations, // 新增locations字段更新
      desc: req.body.desc,
    };

    await trip.update(updateData);

    // // 获取用户信息
    // const user = await User.findByPk(userId, {
    //   attributes: ['id', 'nick_name', 'icon'],
    // });

    return res.status(200).json({
      code: 200,
      // data: DetailResponse(trip, user),
      message: '更新成功',
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 删除游记
exports.deleteTrip = async (req, res) => {
  try {
    // 获取当前登录用户ID
    const userId = req.id;
    const tripId = req.params.id;

    const trip = await Trip.findByPk(tripId);
    if (!trip || trip.is_deleted === 1) {
      return res.status(404).json({
        code: 404,
        message: '游记不存在',
      });
    }

    // 验证游记是否属于当前用户
    if (trip.user_id !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权限删除该游记',
      });
    }

    // 执行逻辑删除
    await trip.update({ is_deleted: 1 });

    return res.status(200).json({
      code: 200,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除游记出错:', error);
    return res.status(500).json({
      code: 500,
      message: '删除游记失败',
    });
  }
};

// 获取游记列表
exports.getAllTrips = async (req, res) => {
  try {
    const { Op, col } = require('sequelize'); // 操作符 - 复杂查询（Or.like - 模糊查询）
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 1000;
    const keyword = req.query.keyword || '';
    const offset = (page - 1) * limit;

    // 1. 查询所有已审核通过的游记
    const { count, rows: trips } = await Trip.findAndCountAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { title: { [Op.like]: `%${keyword}%` } }, // 关键字匹配
              { content: { [Op.like]: `%${keyword}%` } },
              // { nick_name: { [Op.like]: `%${keyword}%` } }
            ],
          },
          { is_deleted: 0 },
          { status: 1 }, // 审核通过
        ],
      },
      limit,
      offset,
      order: [['create_time', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon'],
        },
      ],
      attributes: {
        exclude: ['password'],
        include: [
          'id',
          'title',
          'content',
          'coverImage',
          'images',
          'status',
          'create_time',
          'update_time',
          'travel_data',
          'duration',
          'cost',
          'liked',
          'video_url',
          'locations',
        ],
      },
    });

    // 2. 从redis中获取每个游记的点赞数量 - 覆盖查询结果(可能还没更新)
    const formattedTrips = await Promise.all(
      trips.map(async (trip) => {
        let likeCount = await redisClient.get(`travel:likeCount:${trip.id}`); // 将const改为let
        if (!likeCount) {
          likeCount = trip.liked;
          await redisClient.set(`travel:likeCount:${trip.id}`, String(trip.liked || 0));
        }
        trip.likeCount = parseInt(likeCount);

        return ListResponse(trip, trip.user);
      }),
    );

    // 3. 若传入userid 则判断用户是否点赞
    if (req.query.userId) {
      // 3.1 从redis中查询用户的点赞列表
      let likedTripIds = await redisClient.sMembers(`user:likes:${req.query.userId}`);
      // 3.2 如果用户的点赞列表不存在，则从数据库中查询并保存到redis中
      if (likedTripIds === null) {
        likedTripIds = (
          await TripLike.findAll({
            where: {
              user_id: req.query.userId,
              travel_id: {
                [Op.in]: trips.map((trip) => trip.id),
              },
              is_liked: 1,
            },
            attributes: ['travel_id'],
            raw: true,
          })
        ).map((like) => String(like.travel_id));
        // 将用户的点赞列表保存到redis中
        await redisClient.sAdd(`user:likes:${req.query.userId}`, likedTripIds);
      }

      // 3.3 为每个游记添加isLiked字段
      formattedTrips.forEach((trip) => {
        trip.isLiked = likedTripIds.includes(String(trip.id));
      });
    }

    return res.status(200).json({
      code: 200,
      data: {
        list: formattedTrips,
        total: count,
      },
    });
  } catch (error) {
    console.error('获取游记列表失败:', error);
    return res.status(500).json({
      code: 500,
      message: '获取游记列表失败',
    });
  }
};

// 获取单个游记详情
exports.getTripDetail = async (req, res) => {
  try {
    // 1. 获取游记详情
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon'],
        },
      ],
    });

    // 2. 从redis中获取点赞数量,覆盖查询结果(可能还没更新)
    let likeCount = await redisClient.get(`travel:likeCount:${trip.id}`);
    if (!likeCount) {
      // 2.1 若不存在则从数据库中查询并保存到redis中
      likeCount = trip.liked;
      await redisClient.set(`travel:likeCount:${trip.id}`, String(trip.liked));
    }
    trip.likeCount = parseInt(likeCount);
    console.log(DetailResponse(trip, trip.user));
    // 3. 若游记存在 格式化输出
    if (trip) {
      res.status(200).json({
        code: 200,
        data: DetailResponse(trip, trip.user),
      });
    } else {
      return res.status(404).json({
        // 修正返回404状态码
        code: 404,
        message: '游记不存在',
      });
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 获取访问接口用户的所有游记
exports.getTripsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 1000;
    const offset = (page - 1) * limit;

    const where = {
      [Op.and]: [{ user_id: userId }, { is_deleted: 0 }],
    };

    // 1. 查询用户的所有游记
    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
      limit,
      offset,
      order: [['create_time', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon'],
        },
        {
          model: TripReviewRecord,
          as: 'reviewRecords',
          attributes: ['reason', 'reviewer_id'],
        },
      ],
    });

    // 优化分页处理
    if (page > 1 && offset >= count) {
      return res.status(400).json({
        code: 400,
        message: '页码超出范围',
        data: {
          total: count,
          maxPage: Math.ceil(count / limit),
        },
      });
    }

    // 2. 从redis中获取每个游记的点赞数量 - 覆盖查询结果(可能还没更新)
    const formattedTrips = await Promise.all(
      trips.map(async (trip) => {
        let likeCount = await redisClient.get(`travel:likeCount:${trip.id}`);
        if (!likeCount) {
          likeCount = trip.liked;
          await redisClient.set(`travel:likeCount:${trip.id}`, String(trip.liked || 0));
        }

        // 获取最新的审核记录
        const latestReview =
          trip.reviewRecords && trip.reviewRecords.length > 0
            ? trip.reviewRecords[trip.reviewRecords.length - 1]
            : null;

        trip.likeCount = parseInt(likeCount);
        trip.reviewRecords = latestReview;

        return ListResponse(trip, trip.user);
      }),
    );

    // 3. 判断用户是否点赞
    // 3.1 从redis中查询用户的点赞列表
    let likedTripIds = await redisClient.sMembers(`user:likes:${userId}`);
    // 3.2 如果用户的点赞列表不存在，则从数据库中查询并保存到redis中
    if (likedTripIds === null) {
      likedTripIds = (
        await TripLike.findAll({
          where: {
            user_id: userId,
            travel_id: {
              [Op.in]: trips.map((trip) => trip.id),
            },
            is_liked: 1,
          },
          attributes: ['travel_id'],
          raw: true,
        })
      ).map((like) => String(like.travel_id));
      // 将用户的点赞列表保存到redis中
      await redisClient.sAdd(`user:likes:${userId}`, likedTripIds);
    }
    // 3.3 为每个游记添加isLiked字段
    formattedTrips.forEach((trip) => {
      trip.isLiked = likedTripIds.includes(String(trip.id));
    });

    // 使用res.json发送响应
    return res.status(200).json({
      code: 200,
      data: formattedTrips,
    });
  } catch (error) {
    console.log('getTripsByUser error:', error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 点赞/取消点赞
// 并发安全问题：如果多个用户同时对一个游记点赞，可能会导致点赞数错误
// 解决方案：使用Redis的setnx命令，保证只有一个用户可以成功点赞，其他用户只能等待
exports.likeTrip = async (req, res) => {
  const lockKey = `lock:like:${req.body.travelId}`;
  try {
    const { travelId, userId, liked } = req.body;
    try {
      // 1. 如果是获取状态的请求，只需查询点赞记录
      if (liked === undefined) {
        // 1.1 优先从Redis缓存中获取点赞状态
        let isLiked = await redisClient.sIsMember(`user:likes:${userId}`, String(travelId));
        let likeCount = await redisClient.get(`travel:likeCount:${travelId}`);

        // 1.2 如果缓存中不存在点赞状态，则从数据库中获取
        if (isLiked === null) {
          const likeRecord = await TripLike.findOne({
            where: {
              travel_id: travelId,
              user_id: userId,
            },
          });
          isLiked = likeRecord ? true : false;
          // 更新缓存
          await redisClient.sAdd(`user:likes:${userId}`, String(travelId));
        }

        // 1.3 如果缓存中不存在点赞计数，则从数据库中获取
        if (likeCount === null) {
          likeCount = await TripLike.count({
            where: {
              travel_id: travelId,
            },
          });
          // 更新缓存
          await redisClient.set(`travel:likeCount:${travelId}`, String(likeCount));
        }

        return res.status(200).json({
          code: 200,
          data: {
            liked: isLiked,
            likeCount: parseInt(likeCount),
          },
        });
      }

      // 获取分布式锁
      const lockAcquired = await redisClient.set(lockKey, '1', 'NX', 'EX', 5);
      if (!lockAcquired) {
        return res.status(429).json({
          code: 429,
          message: '操作过于频繁，请稍后再试',
        });
      }

      if (!liked) {
        // 2. 如果是取消点赞的请求，从Redis缓存中移除点赞记录
        // 2.1 更新数据库中的点赞状态
        await TripLike.destroy({
          where: {
            travel_id: travelId,
            user_id: userId,
          },
        });
        // 2.2 更新Redis缓存中的点赞记录、计数缓存
        await redisClient.sRem(`user:likes:${userId}`, String(travelId));
        await redisClient.decr(`travel:likeCount:${travelId}`);
      } else {
        // 3. 如果是点赞的请求，将点赞记录添加到Redis缓存中
        // 3.1 更新数据库中的点赞状态
        await TripLike.create({
          travel_id: travelId,
          user_id: userId,
          is_liked: 1,
        });
        // 3.2 更新Redis缓存中的点赞记录、计数缓存
        await redisClient.sAdd(`user:likes:${userId}`, String(travelId));
        await redisClient.incr(`travel:likeCount:${travelId}`);
      }

      // 5. 获取更新后的点赞数
      const updatedLikeCount = await redisClient.get(`travel:likeCount:${travelId}`);

      return res.status(200).json({
        code: 200,
        data: {
          liked: liked,
          likeCount: parseInt(updatedLikeCount),
        },
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  } finally {
    try {
      await redisClient.del(lockKey);
    } catch (err) {
      console.error('释放锁失败:', err);
    }
  }
};

// 收藏/取消收藏
exports.starTrip = async (req, res) => {
  try {
    const { travelId, userId, starred } = req.body;

    try {
      // 1. 如果是获取状态的请求，优先从Redis缓存中获取收藏状态
      if (starred === undefined) {
        // 1.1 优先从Redis缓存中获取收藏状态
        let isStarred = await redisClient.sIsMember(`user:stars:${userId}`, String(travelId));

        // 1.2 如果缓存中不存在收藏状态，则从数据库中获取
        if (isStarred === null) {
          const starRecord = await TripStar.findOne({
            where: {
              travel_id: travelId,
              user_id: userId,
            },
          });
          isStarred = starRecord ? true : false;
          // 更新缓存
          await redisClient.sAdd(`user:stars:${userId}`, String(travelId));
        }

        return res.status(200).json({
          code: 200,
          data: {
            starred: isStarred,
          },
        });
      }

      if (!starred) {
        // 2. 如果是取消收藏的请求，从Redis缓存中移除收藏记录
        // 2.1 更新数据库中的收藏状态
        await TripStar.destroy({
          where: {
            travel_id: travelId,
            user_id: userId,
          },
        });
        // 2.2 从Redis缓存中移除收藏记录
        await redisClient.sRem(`user:stars:${userId}`, String(travelId));

        // 2.3 更新收藏计数缓存
        await redisClient.decr(`travel:starCount:${travelId}`);
      } else {
        // 3. 如果是收藏的请求，将收藏记录添加到Redis缓存中
        // 3.1 更新数据库中的收藏状态
        await TripStar.create({
          travel_id: travelId,
          user_id: userId,
          is_starred: 1,
        });
        // 3.2 将收藏记录添加到Redis缓存中
        await redisClient.sAdd(`user:stars:${userId}`, String(travelId));
        // 更新收藏计数缓存
        await redisClient.incr(`travel:starCount:${travelId}`);
      }

      return res.status(200).json({
        code: 200,
        data: {
          starred: starred,
        },
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 创建评论
exports.createComment = async (req, res) => {
  try {
    const { travelId, content, userId } = req.body;

    // 检查游记是否存在
    const trip = await Trip.findByPk(travelId);
    if (!trip || trip.is_deleted === 1) {
      return res.status(404).json({
        code: 404,
        message: '游记不存在',
      });
    }

    // 创建评论
    const comment = await Comment.create({
      travel_id: travelId,
      user_id: userId,
      content: content,
    });

    // 更新游记的评论数
    await trip.increment('comments');

    // 获取评论用户信息
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nick_name', 'icon'],
    });

    // 返回格式化的评论数据
    return res.status(200).json({
      code: 200,
      data: {
        id: comment.id,
        content: comment.content,
        createTime: comment.create_time,
        author: {
          id: user.id,
          nickname: user.nick_name,
          avatar: user.icon,
        },
      },
    });
  } catch (error) {
    console.error('创建评论失败:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '创建评论失败',
    });
  }
};

// 获取评论列表
exports.getCommentList = async (req, res) => {
  try {
    // 1. 获取游记
    const travelId = req.params.travelId;

    // 检查游记是否存在
    const trip = await Trip.findByPk(travelId);
    if (!trip || trip.is_deleted === 1) {
      return res.status(404).json({
        code: 404,
        message: '游记不存在',
      });
    }

    // 2. 获取评论列表
    const comments = await Comment.findAll({
      where: { travel_id: travelId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon'],
        },
      ],
      order: [['create_time', 'DESC']],
    });

    // 格式化评论数据
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createTime: comment.create_time,
      author: {
        id: comment.user.id,
        nickname: comment.user.nick_name,
        avatar: comment.user.icon,
      },
    }));

    return res.status(200).json({
      code: 200,
      data: formattedComments,
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '获取评论列表失败',
    });
  }
};

// 上传游记图片列表或视频
exports.uploadTripMedia = (req, res) => {
  try {
    upload.single('file')(req, res, function (err) {
      if (err) {
        console.log('上传错误:', err);
        return res.status(500).json({
          code: 500,
          message: err instanceof multer.MulterError ? err.message : '文件上传失败',
        });
      }

      if (!req.file) {
        console.log('没有文件被上传');
        return res.status(400).json({
          code: 400,
          message: '没有文件被上传',
        });
      }

      return res.status(200).json({
        code: 200,
        data: { url: req.file.url },
        message: '上传成功',
      });
    });
  } catch (error) {
    console.log('捕获到异常:', error);
    return res.status(500).json({
      code: 500,
      message: '文件上传过程发生异常',
    });
  }
};

// 更新浏览量
exports.updateViews = async (req, res) => {
  try {
    const tripId = req.params.id;
    const trip = await Trip.findByPk(tripId);

    if (!trip || trip.is_deleted === 1) {
      return res.status(404).json({
        code: 404,
        message: '游记不存在',
      });
    }

    // 更新浏览量
    await trip.increment('views', { by: 1 });

    return res.status(200).json({
      code: 200,
      message: '更新成功',
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};
