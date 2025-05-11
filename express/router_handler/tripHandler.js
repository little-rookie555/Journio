const { Trip, TripLike, TripStar, User, Comment } = require('../models');
const upload = require('../middlewares/upload');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('D:\\softwore\\ffmpeg-7.0.2-essentials_build\\bin\\ffmpeg.exe');
const db = require('../config/db');
const Op = require('sequelize').Op;
const { extractVideoThumbnail } = require('./imageHandler');

// 创建游记
exports.createTrip = async (req, res) => {
  try {
    const userId = req.id;

    // 如果有视频，先处理视频截图
    let coverImage = req.body.coverImage;
    if (req.body.video) {
      coverImage = await extractVideoThumbnail(req.body.video);
    }

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

    const newTrip = await Trip.create(tripData);

    // 获取用户信息
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nick_name', 'icon'],
    });

    // 返回格式与前端一致
    return res.status(201).json({
      code: 200,
      data: {
        id: newTrip.id,
        title: newTrip.title,
        content: newTrip.content,
        coverImage: newTrip.coverImage,
        images: newTrip.images,
        status: newTrip.status,
        createTime: newTrip.create_time,
        travelDate: newTrip.travelData, // 修改字段名
        duration: newTrip.duration,
        cost: newTrip.cost,
        author: {
          id: user.id,
          nickname: user.nick_name,
          avatar: user.icon,
        },
      },
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
    if (req.body.video) {
      coverImage = await extractVideoThumbnail(req.body.video);
    }
    // 更新游记内容
    console.log('更新的travelDate', req.body.video_url, req.body.video);
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      images: req.body.images,
      coverImage: coverImage,
      video_url: req.body.video,
      status: 0, // 修改后重新设为待审核状态
      update_time: new Date(),
      travelData: req.body.travelDate,
      duration: req.body.duration,
      cost: req.body.cost,
      locations: req.body.locations, // 新增locations字段更新
    };

    await trip.update(updateData);

    // 获取用户信息
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nick_name', 'icon'],
    });

    return res.status(200).json({
      code: 200,
      data: {
        id: trip.id,
        title: trip.title,
        content: trip.content,
        coverImage: trip.coverImage,
        images: trip.images,
        status: trip.status,
        createTime: trip.create_time,
        travelDate: trip.travelData,
        duration: trip.duration,
        cost: trip.cost,
        locaitonsa: trip.locations,
        author: {
          id: user.id,
          nickname: user.nick_name,
          avatar: user.icon,
        },
      },
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
    const page = parseInt(req.query.pageNum) || 1;
    const limit = parseInt(req.query.pageSize) || 20;
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
          'travel_data',
          'duration',
          'cost',
          'liked',
          'video_url',
          'locations',
        ],
      },
    });

    // 2. 格式化数据
    const formattedTrips = trips.map((trip) => ({
      id: trip.id,
      title: trip.title,
      content: trip.content,
      coverImage: trip.coverImage,
      images: trip.images,
      video: trip.video_url,
      status: trip.status,
      createTime: trip.create_time,
      travelDate: trip.travel_data,
      duration: trip.duration,
      cost: trip.cost,
      likeCount: trip.liked,
      isLiked: false,
      locations: trip.locations ? trip.locations : [], // 新增locations字段，用于存储旅行地点的数组
      author: {
        id: trip.user.id,
        nickname: trip.user.nick_name,
        avatar: trip.user.icon,
      },
    }));

    // 3. 若传入userid
    if (req.query.userId) {
      // 批量查询当前用户点赞的所有游记ID
      const likedTripIds = (
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
      ).map((like) => like.travel_id);

      // 为每个游记添加isLiked字段
      formattedTrips.forEach((trip) => {
        trip.isLiked = likedTripIds.includes(trip.id);
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
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon'],
        },
      ],
    });

    if (trip) {
      // 格式化日期为中文格式
      res.status(200).json({
        code: 200,
        data: {
          id: trip.id,
          title: trip.title,
          content: trip.content,
          coverImage: trip.coverImage,
          images: trip.images,
          video: trip.video_url,
          status: trip.status,
          createTime: trip.create_time,
          travelDate: trip.travelData, // 使用格式化后的日期
          duration: trip.duration,
          cost: trip.cost,
          likeCount: trip.liked,
          locations: trip.locations ? trip.locations : [], // 新增locations字段，用于存储旅行地点的数组
          author: {
            id: trip.user.id,
            nickname: trip.user.nick_name,
            avatar: trip.user.icon,
          },
        },
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

// 搜索游记
exports.searchTrip = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const { Op } = require('sequelize'); // 操作符 - 复杂查询（Or.like - 模糊查询）

    const trips = await Trip.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { title: { [Op.like]: `%${keyword}%` } },
              { content: { [Op.like]: `%${keyword}%` } },
            ],
          },
          { is_deleted: 0 },
          { status: 1 }, // 审核通过
        ],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon'],
        },
      ],
    });

    res.status(200).json({ data: trips });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 获取访问接口用户的所有游记
exports.getTripsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const page = parseInt(req.query.pageNum) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * limit;
    const where = {
      [Op.and]: [{ user_id: userId }, { is_deleted: 0 }],
    };

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

    // 格式化数据以匹配前端期望的格式
    const formattedTrips = trips.map((trip) => ({
      id: trip.id,
      title: trip.title,
      content: trip.content,
      coverImage: trip.coverImage,
      images: trip.images,
      status: trip.status,
      createTime: trip.create_time,
      locations: trip.locations ? trip.locations : [], // 新增locations字段，用于存储旅行地点的数组
      author: {
        id: trip.user.id,
        nickname: trip.user.nick_name,
        avatar: trip.user.icon,
      },
    }));

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
exports.likeTrip = async (req, res) => {
  try {
    const { travelId, userId, liked } = req.body;

    // 开启事务
    const transaction = await db.transaction();

    try {
      // 1. 查找游记
      const trip = await Trip.findByPk(travelId, { transaction });

      if (!trip || trip.is_deleted === 1) {
        await transaction.rollback();
        return res.status(404).json({
          code: 404,
          message: '游记不存在',
        });
      }

      // 2. 如果是获取状态的请求，只需查询点赞记录
      if (liked === undefined) {
        const likeRecord = await TripLike.findOne({
          where: {
            travel_id: travelId,
            user_id: userId,
          },
          transaction,
        });
        // 若likeRecord.is_liked为1，则返回true，否则返回false
        const is_liked = likeRecord && likeRecord.is_liked === 1 ? true : false;
        await transaction.commit();
        return res.status(200).json({
          code: 200,
          data: {
            liked: is_liked,
            likeCount: trip.liked,
          },
        });
      }

      // 3. 点赞 - 查找点赞记录或创建新记录
      const [likeRecord, created] = await TripLike.findOrCreate({
        where: { travel_id: travelId, user_id: userId },
        defaults: { is_liked: liked }, // 创建新纪录时的默认值
        transaction,
      });

      // 4. 点赞 - 如果记录已存在且状态不同，则更新点赞状态和计数
      if (!created && likeRecord.is_liked !== liked) {
        await likeRecord.update({ is_liked: liked }, { transaction });
        const likeCount = liked ? trip.liked + 1 : trip.liked - 1;
        await trip.update({ liked: likeCount }, { transaction });
      }
      // 5. 如果是新记录且是点赞操作
      else if (created && liked) {
        await trip.update({ liked: trip.liked + 1 }, { transaction });
      }

      await transaction.commit();

      return res.status(200).json({
        code: 200,
        data: {
          liked: liked,
          likeCount: trip.liked,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

// 收藏/取消收藏
exports.starTrip = async (req, res) => {
  try {
    const { travelId, userId, starred } = req.body;

    // 开启事务
    const transaction = await db.transaction();

    try {
      // 1. 查找游记
      const trip = await Trip.findByPk(travelId, { transaction });

      if (!trip || trip.is_deleted === 1) {
        await transaction.rollback();
        return res.status(404).json({
          code: 404,
          message: '游记不存在',
        });
      }

      // 2. 如果是获取状态的请求，只需查询点赞记录
      if (starred === undefined) {
        const starRecord = await TripStar.findOne({
          where: {
            travel_id: travelId,
            user_id: userId,
          },
          transaction,
        });
        // 若starRecord.is_starred为1，则返回true，否则返回false
        const is_starred = starRecord && starRecord.is_starred === 1 ? true : false;
        await transaction.commit();
        return res.status(200).json({
          code: 200,
          data: {
            starred: is_starred,
          },
        });
      }

      // 3. 收藏 - 查找收藏记录或创建新记录
      const [starRecord, created] = await TripStar.findOrCreate({
        where: { travel_id: travelId, user_id: userId },
        defaults: { is_starred: starred }, // 创建新纪录时的默认值
        transaction,
      });

      // 4. 点赞 - 如果记录已存在且状态不同，则更新点赞状态和计数
      if (!created && starRecord.is_starred !== starred) {
        await starRecord.update({ is_starred: starred }, { transaction });
        const Count = starred ? trip.starred + 1 : trip.starred - 1;
        await trip.update({ starred: Count }, { transaction });
      }
      // 5. 如果是新记录且是点赞操作
      else if (created && starred) {
        await trip.update({ starred: trip.starred + 1 }, { transaction });
      }

      await transaction.commit();

      return res.status(200).json({
        code: 200,
        data: {
          starred: starred,
        },
      });
    } catch (error) {
      await transaction.rollback();
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
