const redis = require('redis');

// 创建Redis客户端
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD,
  database: process.env.REDIS_DB || 0,
});

// 连接事件处理
redisClient.on('connect', () => {
  console.log('Redis连接成功');
});

redisClient.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

// 连接Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Redis连接失败:', err);
  }
})();

// 导出Redis客户端实例
module.exports = redisClient;
