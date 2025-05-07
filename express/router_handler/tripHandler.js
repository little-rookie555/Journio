const { Trip, TripReviewRecord, User } = require("../models");
const upload = require("../middlewares/upload");
const {ossConfig, uploadToOSS} = require("../config/ossConfig");
const multer = require("multer");
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('D:\\softwore\\ffmpeg-7.0.2-essentials_build\\bin\\ffmpeg.exe');
const path = require('path');
const fs = require('fs');
const db = require("../config/db");
const sharp = require('sharp');

// 视频截图函数
const extractVideoThumbnail = async (videoUrl) => {
  try {
    // 存储临时文件地址
    const timestamp = Date.now();
    const thumbnailPath = path.join(__dirname, `../public/thumbnails/thumbnail_${timestamp}.jpg`);
    const dir = path.dirname(thumbnailPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 使用ffmpeg截取第一帧
    await new Promise((resolve, reject) => {
      ffmpeg(videoUrl)
        .on('end', () => {
          console.log('视频截图成功');
          resolve();
        })
        .on('error', (err) => {
          console.error('视频截图失败:', err);
          reject(err);
        })
        .screenshots({
          timestamps: ['00:00:01'],
          filename: `thumbnail_${timestamp}.jpg`,
          folder: path.join(__dirname, '../public/thumbnails'),
          size: '1280x720'
        });
    });

    // 读取生成的截图文件
    const imageBuffer = await fs.promises.readFile(thumbnailPath);
    
    // 使用sharp处理图片
    const processedImageBuffer = await sharp(imageBuffer)
      .jpeg()
      .toBuffer();
      
    // 创建一个临时文件对象用于上传
    const formData = new FormData();
    formData.append('file', new Blob([processedImageBuffer], { type: 'image/jpeg' }), `thumbnail_${timestamp}.jpg`);
    
    // 上传到OSS
    const ossPath = `public/image/thumbnail_${timestamp}.jpg`;
    const result = await uploadToOSS(ossConfig, ossPath, processedImageBuffer);
    
    // 删除本地临时文件
    await fs.promises.unlink(thumbnailPath);
    
    return result;
  } catch (error) {
    console.error('视频截图失败:', error);
    return null;
  }
};

// 创建游记
exports.createTrip = async (req, res) => {
  console.log("createTrip req.body:", req.body);
  try {
    const userId = req.id;
    
    // 如果有视频，先处理视频截图
    let coverImage = req.body.coverImage;
    if (req.body.video) {
      coverImage = await extractVideoThumbnail(req.body.video);
    }
    
    const tripData = {
      user_id: userId,
      title: req.body.title,
      content: req.body.content,
      status: 0,
      images: req.body.images,
      coverImage: coverImage,
      video_url: req.body.video || null,
      liked: 0,
      comments: 0
    };
    
    console.log("createTrip tripData:", req.body);

    const newTrip = await Trip.create(tripData);
    
    // 获取用户信息
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nick_name', 'icon']
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
        author: {
          id: user.id,
          nickname: user.nick_name,
          avatar: user.icon
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      code: 500,
      message: error.message 
    });
  }
};

// 更新游记
exports.updateTrip = async (req, res) => {
  try {
    // 判断用户是否有权限修改游记，即判断游记的作者是否为当前用户
    const userId = req.id;
    const trip = await Trip.findByPk(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ 
        code: 404,
        message: '游记不存在'
      });
    } else if (trip.user_id !== userId) {
      return res.status(403).json({ 
        code: 403,
        message: '无权限修改该游记'
      });
    }
    
    // 更新游记内容
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      coverImage: req.body.coverImage,
      images: req.body.images,
      status: 0, // 修改后重新设为待审核状态
      update_time: new Date()
    };
    
    await trip.update(updateData);
    
    // 获取用户信息
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nick_name', 'icon']
    });
    
    // 返回格式与前端一致
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
        author: {
          id: user.id,
          nickname: user.nick_name,
          avatar: user.icon
        }
      }
    });
  } catch (error) {
    console.log("updateTrip error:", error);
    return res.status(500).json({ 
      code: 500,
      message: error.message 
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
    if (!trip) {
      return res.status(404).json({ 
        code: 404,
        message: "游记不存在" 
      });
    }
    
    // 验证游记是否属于当前用户
    if (trip.user_id !== userId) {
      return res.status(403).json({ 
        code: 403,
        message: "无权限删除该游记" 
      });
    }
    
    // 执行删除
    console.log("deleteTrip trip:");
    await trip.destroy();
    
    return res.status(200).json({
      code: 200,
      message: "删除成功"
    });
    
  } catch (error) {
    console.error("删除游记出错:", error);
    return res.status(500).json({ 
      code: 500,
      message: "删除游记失败" 
    });
  }
};

// 获取所有游记
exports.getAllTrips = async (req, res) => {
  try {
    const { Op } = require('sequelize');  // 操作符 - 复杂查询（Or.like - 模糊查询）
    const page = parseInt(req.query.pageNum) || 1;
    const limit = parseInt(req.query.pageSize) || 20;
    const keyword = req.query.keyword || "";
    const offset = (page - 1) * limit;

    const { count, rows: trips } = await Trip.findAndCountAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { title: { [Op.like]: `%${keyword}%` } },  // 关键字匹配
              { content: { [Op.like]: `%${keyword}%` } },
              // { nick_name: { [Op.like]: `%${keyword}%` } }
            ]
          },
          { status: 1 } // 审核通过
        ]
      },
      limit,
      offset,
      order: [['create_time', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon']
        }
      ],
      attributes: { 
        exclude: ['password'],
        include: ['coverImage']
      }
    });

    if (offset >= count && count !== 0) {
      return res.status(404).json({ 
        code: 404,
        message: "页码超出范围" 
      });
    }
    
    // 格式化返回数据
    const formattedTrips = trips.map(trip => ({
      id: trip.id,
      title: trip.title,
      coverImage: trip.coverImage,
      images: trip.images,
      status: trip.status,
      createTime: trip.create_time,
      content: trip.content,
      author: {
        id: trip.user.id,
        nickname: trip.user.nick_name,
        avatar: trip.user.icon
      }
    }));

    // console.log("formattedTrips:", formattedTrips); 

    res.status(200).json({
      code: 200,
      data: {
        list: formattedTrips,
        total: count
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      code: 500,
      message: error.message 
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
          attributes: ['id', 'nick_name', 'icon']
        }
      ]
    });
    
    if (trip) {
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
          author: {
            id: trip.user.id,
            nickname: trip.user.nick_name,
            avatar: trip.user.icon
          }
        }
      });
    } else {
        return {
          code: 404,
          message: '游记不存在',
        };
    }
  } catch (error) {
    return res.status(500).json({ 
      code: 500,
      message: error.message 
    });
  }
};

// 搜索游记
exports.searchTrip = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const { Op } = require('sequelize');  // 操作符 - 复杂查询（Or.like - 模糊查询）
    // console.log("req.query.keyword:", req.query.keyword);
    
    const trips = await Trip.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { title: { [Op.like]: `%${keyword}%` } },
              { content: { [Op.like]: `%${keyword}%` } }
            ]
          },
          { status: 1 } // 审核通过
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon']
        }
      ]
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
    console.log("获取用户游记，用户ID:", userId);
    
    const page = parseInt(req.query.pageNum) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * limit;
    const where = { user_id: userId };

    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
      limit,
      offset,
      order: [['create_time', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon']
        }
      ]
    });

    console.log("查询到的游记数量:", trips.length);

    if (offset >= count && count !== 0) {
      return res.status(404).json({ message: "页码超出范围" });
    }
    
    // 格式化数据以匹配前端期望的格式
    const formattedTrips = trips.map(trip => ({
      id: trip.id,
      title: trip.title,
      content: trip.content,
      coverImage: trip.coverImage,
      images: trip.images,
      status: trip.status,
      createTime: trip.create_time,
      author: {
        id: trip.user.id,
        nickname: trip.user.nick_name,
        avatar: trip.user.icon
      }
    }));

    // 使用res.json发送响应
    return res.status(200).json({
      code: 200,
      data: formattedTrips
    });
  } catch (error) {
    console.log("getTripsByUser error:", error);
    return res.status(500).json({ 
      code: 500,
      message: error.message 
    });
  }
};


// 获取访问接口用户某个审核状态的所有游记
exports.getTripByStatus = async (req, res) => {
  try {
    // 判断传入status是否合法
    const statusMap = {
      'all': null,
      '0': 0,    // 待审核
      '1': 1,    // 通过
      '2': 2     // 拒绝
    };
    
    // console.log("req.params.status:", req.query.status);
    
    if (!Object.keys(statusMap).includes(req.query.status)) {
      throw new Error("status参数不合法");
    }
    
    const userId = req.id;
    const status = statusMap[req.query.status];
    const page = parseInt(req.query.pageNum) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * limit;

    const where = { user_id: userId };
    if (status !== null) {
      where.status = status;
    }

    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
      limit,
      offset,
      order: [['create_time', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon']
        }
      ]
    });

    if (offset >= count && count !== 0) {
      return res.status(404).json({ message: "页码超出范围" });
    }

    res.status(200).json({ data: trips, total: count });
  } catch (error) {
    // console.log("getTripByStatus error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// TODO:点赞

// TODO:评论功能

// 获取审核状态的所有游记
exports.getTripByAuditStatus = async (req, res) => {
  try {
    // console.log("req.role:", req.role);
    if (req.role==1) {
      return res.status(403).json({ message: "无权限获取审核游记列表" });
    }
    
    // 判断传入status是否合法
    const statusMap = {
      'all': null,
      '0': 0,    // 待审核
      '1': 1,    // 通过
      '2': 2     // 拒绝
    };
    
    if (!Object.keys(statusMap).includes(req.query.status)) {
      throw new Error("status参数不合法");
    }
    
    const status = statusMap[req.query.status];
    const page = parseInt(req.query.pageNum) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (status !== null) {
      where.status = status;
    }

    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
      limit,
      offset,
      order: [['create_time', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon']
        }
      ]
    });

    if (offset >= count && count !== 0) {
      return res.status(404).json({ message: "页码超出范围" });
    }

    res.status(200).json({ data: trips, total: count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 审核通过
exports.passAuditTrip = async (req, res) => {
  try {
    // 校验身份，super和admin才能审核通过
    if (req.role==1) {
      return res.status(403).json({ message: "无权限审核游记" });
    }
    
    const tripId = req.query.id;
    const reviewerId = req.id;
    
    // 开启事务
    const t = await db.transaction();
    
    try {
      // 1. 更新游记状态
      await Trip.update(
        { status: 1 }, // 1: 通过
        { 
          where: { id: tripId },
          transaction: t
        }
      );
      
      // 2. 创建审核记录
      await TripReviewRecord.create({
        travelogue_id: tripId,
        reviewer_id: reviewerId,
        status: 1, // 1: 通过
        reviewed_at: new Date()
      }, { transaction: t });
      
      // 提交事务
      await t.commit();
      res.status(200).json({ message: "审核通过" });
    } catch (error) {
      // 回滚事务
      await t.rollback();
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 审核拒绝
exports.rejectAuditTrip = async (req, res) => {
  try {
    if (req.role==1) {
      return res.status(403).json({ message: "无权限审核游记" });
    }
    
    const tripId = req.query.id;
    const reviewerId = req.id;
    const reason = req.body.reason;
    // 拒绝原因必填
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: "拒绝原因不能为空" });
    }
    
    // 开启事务
    const t = await db.transaction();
    
    try {
      // 1. 更新游记状态
      await Trip.update(
        { status: 2 }, // 2: 拒绝
        { 
          where: { id: tripId },
          transaction: t
        }
      );
      
      // 2. 创建审核记录
      await TripReviewRecord.create({
        travelogue_id: tripId,
        reviewer_id: reviewerId,
        status: 2, // 2: 拒绝
        reason: reason,
        reviewed_at: new Date()
      }, { transaction: t });
      
      // 提交事务
      await t.commit();
      res.status(200).json({ message: "拒绝通过" });
    } catch (error) {
      // 回滚事务
      await t.rollback();
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// TODO: 逻辑删除游记
// exports.deleteAuditTrip = async (req, res) => {
//   try {
//     // 后期需要校验角色权限，超级管理员才能删除游记
//     if (req.role !== 3) {
//       return res.status(403).json({ message: "无权限删除游记" });
//     }
//     await Trip.findByIdAndUpdate(req.params.id, {
//       isDeleted: true,
//     });
//     res.status(200).json({ message: "游记已删除" });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// 上传游记图片列表或视频
exports.uploadTripMedia = (req, res) => {
  try {
    upload.single("file")(req, res, function (err) {
      if (err) {
        console.log('上传错误:', err);
        return res.status(500).json({ 
          code: 500,
          message: err instanceof multer.MulterError ? err.message : "文件上传失败" 
        });
      }
      
      if (!req.file) {
        console.log('没有文件被上传');
        return res.status(400).json({ 
          code: 400,
          message: "没有文件被上传" 
        });
      }
      
      console.log('上传的文件信息:', req.file.url);
      return res.status(200).json({ 
        code: 200,
        data: { url: req.file.url },
        message: "上传成功" 
      });
    });
  } catch (error) {
    console.log('捕获到异常:', error);
    return res.status(500).json({ 
      code: 500,
      message: "文件上传过程发生异常" 
    });
  }
};

exports.uploadTripMediaMultiple = (req, res) => {
  try {
    upload.array("images", 9)(req, res, function (err) {
      console.log('开始处理多文件上传');
      
      if (err) {
        console.log('上传错误:', err);
        return res.status(500).json({ 
          message: err instanceof multer.MulterError ? err.message : "文件上传失败" 
        });
      }
      
      if (!req.files || req.files.length === 0) {
        console.log('没有文件被上传');
        return res.status(400).json({ message: "没有文件被上传" });
      }
      
      console.log('上传的文件信息:', req.files);
      const urls = req.files.map(file => file.url);
      console.log('生成的URL列表:', urls);
      
      return res.status(200).json({ urls, message: "上传成功" });
    });
  } catch (error) {
    console.log('捕获到异常:', error);
    return res.status(500).json({ message: "文件上传过程发生异常" });
  }
};
