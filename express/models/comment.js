const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Comment = sequelize.define(
  'Comment',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键',
    },
    travel_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'travel_id',
      comment: '游记id',
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'user_id',
      comment: '评论用户id',
    },
    content: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      comment: '评论内容',
    },
    create_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'create_time',
      comment: '创建时间',
    },
  },
  {
    tableName: 'tb_blog_comments',
    timestamps: false,
    underscored: true,
  },
);

module.exports = Comment;
