const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Trip = sequelize.define(
  'Trip',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键',
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'user_id',
      comment: '用户id',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '标题',
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '审核状态（0：待审查，1：通过，2：拒绝）',
    },
    is_deleted: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '逻辑删除 (0: 未删除, 1: 已删除)',
    },
    images: {
      type: DataTypes.STRING(2048),
      allowNull: false,
      defaultValue: '',
      comment: '探店的照片，最多9张，多张以","隔开',
      get() {
        const rawValue = this.getDataValue('images');
        return rawValue ? rawValue.split(',') : [];
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue('images', value.join(','));
        } else {
          this.setDataValue('images', value || '');
        }
      },
    },
    coverImage: {
      type: DataTypes.STRING(2048),
      allowNull: false,
      field: 'cover_image',
      comment: '封面图片URL',
    },
    video_url: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      field: 'video_url',
      comment: '视频链接',
    },
    content: {
      type: DataTypes.STRING(2048),
      allowNull: false,
      comment: '文字描述',
    },
    liked: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: '点赞数量',
    },
    starred: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: '收藏数量',
    },
    comments: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '评论数量',
    },
    create_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'create_time',
      comment: '创建时间',
    },
    update_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'update_time',
      comment: '更新时间',
    },
    travelData: {
      type: DataTypes.STRING(24),
      allowNull: false,
      field: 'travel_data',
      comment: '旅行出发日期',
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '旅游天数',
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2).UNSIGNED,
      allowNull: false,
      comment: '人均消费',
    },
    locations: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '旅游地点',
    },
  },
  {
    tableName: 'tb_blog',
    timestamps: false,
    underscored: true, // 使用下划线命名法
  },
);

// 定义点赞记录模型
const TripLike = sequelize.define(
  'TripLike',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    travel_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'travel_id',
      comment: '关联的游记ID',
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id',
      comment: '点赞用户ID',
    },
    is_liked: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '软删除标记（用于取消点赞）',
    },
  },
  {
    tableName: 'likes',
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['travel_id', 'user_id'],
        name: 'unique_travel_user',
      },
      {
        fields: ['travel_id', 'user_id'],
        name: 'idx_travel_user',
      },
    ],
  },
);

// 定义收藏记录模型
const TripStar = sequelize.define(
  'TripStar',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    travel_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'travel_id',
      comment: '关联的游记ID',
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id',
      comment: '收藏用户ID',
    },
    is_starred: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '软删除标记（用于取消收藏）',
    },
  },
  {
    tableName: 'stars',
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['travel_id', 'user_id'],
        name: 'unique_travel_user',
      },
      {
        fields: ['travel_id', 'user_id'],
        name: 'idx_travel_user',
      },
    ],
  },
);

module.exports = {
  Trip,
  TripLike,
  TripStar,
};
