const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USERNAME,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    port: process.env.PORT, // 添加端口配置
    dialect: 'mysql',
    logging: false, // 设置为true可以在控制台看到SQL查询
    define: {
      // 全局设置表名与模型名相同，不会自动加s
      freezeTableName: false,
      // 全局设置不自动添加时间戳字段
      timestamps: false,
    },
  },
);

// 测试数据库连接
sequelize
  .authenticate()
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch((err) => {
    console.error('数据库连接失败:', err);
  });

module.exports = sequelize;
