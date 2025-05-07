const OSS = require("ali-oss");
require("dotenv").config();

const client = new OSS({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  accessKeySecret: process.env.ACCESS_KEY_SECRET,
  bucket: process.env.BUCKET,
});

const ossConfig = {
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  accessKeySecret: process.env.ACCESS_KEY_SECRET,
  bucket: process.env.BUCKET,
};

// 辅助函数：上传到OSS
const uploadToOSS = async (config, ossPath, buffer) => {
  const OSS = require('ali-oss');
  const client = new OSS(config);
  
  try {
    const result = await client.put(ossPath, buffer);
    return result.url;
  } catch (err) {
    console.error('上传到OSS失败:', err);
    throw err;
  }
};

module.exports = client;
module.exports.ossConfig = ossConfig; // 导出 OSS 配置
module.exports.uploadToOSS = uploadToOSS; // 导出辅助函数 uploa

