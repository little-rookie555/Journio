const { Trip, TripReviewRecord, User } = require("../models");
const upload = require("../middlewares/upload");
const multer = require("multer");
// const { deleteFilesFromOSS } = require("../middlewares/ossService");
// const User = require("../models/user");
// const { base64ToBlob } = require("../utils/base64ToBlob");
const db = require("../config/db");

// 创建游记
exports.createTrip = async (req, res) => {
  console.log("req.body:", req.body);
  try {
    const userId = req.id;
    const tripData = {
      user_id: userId,
      title: req.body.title,
      content: req.body.content,
      status: 0, // 0: 待审查
      images: req.body.images,
      video_url: req.body.video_url || null,
      liked: 0,
      comments: 0
    };
    
    const newTrip = await Trip.create(tripData);
    return res.status(201).json({ data: newTrip });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 更新游记
exports.updateTrip = async (req, res) => {
  try {
    // 判断用户是否有权限修改游记，即判断游记的作者是否为当前用户
    const userId = req.id;
    const trip = await Trip.findByPk(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: "游记不存在" });
    } else if (trip.user_id !== userId) {
      return res.status(403).json({ message: "无权限修改游记" });
    }
    
    // 更新游记内容
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      images: req.body.images,
      video_url: req.body.video_url,
      status: 0, // 修改后重新设为待审核状态
      update_time: new Date()
    };
    
    await trip.update(updateData);
    return res.status(200).json({ data: trip });
  } catch (error) {
    console.log("updateTrip error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 删除游记
exports.deleteTrip = async (req, res) => {
  try {
    // 后续需要检查用户权限，只有游记的作者才能删除游记
    const userId = req.id;
    const trip = await Trip.findByPk(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: "游记不存在" });
    } else if (trip.user_id !== userId) {
      return res.status(403).json({ message: "无权限删除游记" });
    }
    
    // 删除游记
    await trip.destroy();

    // 获取游记的图片列表
    const images = trip.images;

    // TODO: 如果存在需要删除的图片，调用 deleteFilesFromOSS 进行批量删除
    // if (images && images.length > 0) {
    //   const deleteResult = await deleteFilesFromOSS(images);
    //   if (!deleteResult.success) {
    //     console.error("图片删除失败:", deleteResult.error);
    //   }
    // }

    // 返回成功删除游记的响应
    res.status(200).json({ message: "游记及其图片已删除" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 获取所有游记
exports.getAllTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.pageNum) || 1;
    const limit = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * limit;

    // 使用 Sequelize 的 findAndCountAll 方法获取游记列表
    const { count, rows: trips } = await Trip.findAndCountAll({
      where: {
        status: 1 // 1: 仅显示审核通过的
      },
      limit,
      offset,
      order: [['create_time', 'DESC']],  // 根据创建时间降序排列
      include: [  // 关联查询用户 - 关联查询用户的昵称和头像
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

// 获取单个游记详情
exports.getTripDetail = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.query.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nick_name', 'icon']
        }
      ]
    });
    
    if (trip) {
      res.status(200).json({ data: trip });
    } else {
      res.status(404).json({ message: "游记不存在" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 搜索游记
exports.searchTrip = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const { Op } = require('sequelize');  // 操作符 - 复杂查询（Or.like - 模糊查询）
    console.log("req.query.keyword:", req.query.keyword);
    
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
    
    console.log("req.params.status:", req.query.status);
    
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
    console.log("getTripByStatus error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// TODO:点赞

// TODO:评论功能

// 获取审核状态的所有游记
exports.getTripByAuditStatus = async (req, res) => {
  try {
    console.log("req.role:", req.role);
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
          message: err instanceof multer.MulterError ? err.message : "文件上传失败" 
        });
      }
      
      if (!req.file) {
        console.log('没有文件被上传');
        return res.status(400).json({ message: "没有文件被上传" });
      }
      
      console.log('文件信息:', req.file.url);
      return res.status(200).json({ url: req.file.url, message: "上传成功" });
    });
  } catch (error) {
    console.log('捕获到异常:', error);
    return res.status(500).json({ message: "文件上传过程发生异常" });
  }
};

exports.uploadTripMediaMultiple = (req, res) => {
  try {
    upload.array("images", 5)(req, res, function (err) {
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
