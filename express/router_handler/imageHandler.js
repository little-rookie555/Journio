const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const { ossConfig, uploadToOSS } = require('../config/ossClient');
const upload = require('../middlewares/upload');
const multer = require('multer');

// 设置ffmpeg路径
ffmpeg.setFfmpegPath('D:\\softwore\\ffmpeg-7.0.2-essentials_build\\bin\\ffmpeg.exe');

// 定义图片样式配置
const local_style = [
  {
    name: '纯色粉',
    bgColor: 'rgb(251, 235, 245)',
    fontFamily: 'Arial',
    fontSize: 40,
    fontColor: '#000000',
    bgStyle: 'pink',
  },
  {
    name: '现代风格',
    bgColor: '#2c3e50',
    fontFamily: 'Arial',
    fontSize: 36,
    fontColor: '#000000',
    bgStyle: 'gradient',
    gradientColor: '#3498db',
  },
  {
    name: '复古风格',
    bgColor: '#f9e7c9',
    fontFamily: 'Times New Roman',
    fontSize: 28,
    fontColor: '#000000',
    bgStyle: 'pattern',
    patternColor: '#d2b48c',
  },
  {
    name: '点状背景',
    bgColor: '#f0f8ff',
    fontFamily: 'Verdana',
    fontSize: 32,
    fontColor: '#000000',
    bgStyle: 'dots',
    dotsColor: '#87ceeb',
  },
  // 添加新样式 - 黄色猫咪风格
  {
    name: '黄色猫咪风格',
    bgColor: '#f9f871', // 明亮的黄色背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 40,
    fontColor: '#000000',
    bgStyle: 'solid',
    hasHighlight: true,
    highlightColor: '#ff7f50', // 橙红色高亮
    hasIcon: true,
    iconType: 'cat',
  },
  // 添加新样式 - 蓝色气泡风格
  {
    name: '蓝色气泡风格',
    bgColor: '#87cefa', // 淡蓝色背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 42,
    fontColor: '#000000', // 白色文字
    bgStyle: 'bubble',
    bubbleColor: '#1e90ff',
  },
  // 添加新样式 - 引用风格
  {
    name: '引用风格',
    bgColor: '#f5f5f5', // 浅灰色背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 38,
    fontColor: '#000000', // 深蓝色文字
    bgStyle: 'quote',
    quoteColor: '#1e3a8a',
    hasHighlight: true,
    highlightColor: '#ffd700', // 金色高亮
  },
  // 添加新样式 - 自然风格
  {
    name: '自然风格',
    bgColor: '#e8f5e9', // 淡绿色背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 36,
    fontColor: '#000000', // 深绿色文字
    bgStyle: 'gradient',
    gradientColor: '#a5d6a7', // 浅绿色渐变
  },
  // 添加新样式 - 暗黑模式
  {
    name: '暗黑模式',
    bgColor: '#121212', // 深黑色背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 38,
    fontColor: '#000000', // 浅灰色文字
    bgStyle: 'solid',
    hasHighlight: true,
    highlightColor: '#bb86fc', // 紫色高亮
  },
  // 添加新样式 - 水彩风格
  {
    name: '水彩风格',
    bgColor: '#ffffff', // 白色背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 38,
    fontColor: '#000000', // 灰蓝色文字
    bgStyle: 'watercolor',
    watercolorColors: ['#ffcdd2', '#bbdefb', '#c8e6c9', '#fff9c4'], // 水彩颜色
  },
  // 添加新样式 - 极简风格
  {
    name: '极简风格',
    bgColor: '#fafafa', // 几乎白色的背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 32,
    fontColor: '#000000', // 深灰色文字
    bgStyle: 'solid',
    hasBorder: true,
    borderColor: '#bdbdbd', // 浅灰色边框
    borderWidth: 2,
  },
];

/**
 * 从ref文件夹获取随机背景图片
 * @returns {Promise<string>} 返回图片路径
 */
const getRandomBackgroundImage = async () => {
  try {
    const refPath = path.join(__dirname, '../public/ref');
    console.log('查找背景图片目录:', refPath);

    if (!fs.existsSync(refPath)) {
      console.log('背景图片目录不存在，正在创建...');
      fs.mkdirSync(refPath, { recursive: true });
      throw new Error(`背景图片目录不存在: ${refPath}`);
    }

    const files = await fs.promises.readdir(refPath);
    console.log('目录中的文件:', files);

    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file));
    console.log('找到的图片文件:', imageFiles);

    if (imageFiles.length === 0) {
      throw new Error(`未在目录中找到背景图片: ${refPath}`);
    }

    const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const imagePath = path.join(refPath, randomImage);
    console.log('选择的背景图片:', imagePath);

    return imagePath;
  } catch (error) {
    console.error('获取背景图片失败:', error);
    throw error;
  }
};

/**
 * 根据传入的style生成简单图片
 */
const generateImageService = async (
  text,
  width = 300,
  height = 400,
  outputPath = null,
  style = {},
) => {
  try {
    console.log('开始生成图片，参数:', { text, width, height, outputPath, style });

    // 创建一个画布
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    console.log('画布创建成功');

    // 获取随机背景图片
    const bgImagePath = await getRandomBackgroundImage();
    console.log('准备加载背景图片:', bgImagePath);

    const bgImage = await loadImage(bgImagePath);
    console.log('背景图片加载成功');

    // 确定输出路径
    const timestamp = Date.now();
    const styleName = style.name ? style.name.replace(/\s+/g, '_').toLowerCase() : 'default';
    const finalOutputPath =
      outputPath ||
      path.join(__dirname, '../public/generated', `image_${styleName}_${timestamp}.png`);
    console.log('图片输出路径:', finalOutputPath);

    // 确保输出目录存在
    const outputDir = path.dirname(finalOutputPath);
    if (!fs.existsSync(outputDir)) {
      console.log('创建输出目录:', outputDir);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 绘制背景图片并调整大小以填充画布
    ctx.drawImage(bgImage, 0, 0, width, height);

    // 移除了添加半透明遮罩的代码
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    // ctx.fillRect(0, 0, width, height);

    const currentStyle = style;
    const {
      fontFamily = 'Microsoft YaHei',
      fontSize = 40,
      fontColor = '#000000', // 将默认字体颜色改为黑色
    } = currentStyle;

    // 设置字体样式和颜色
    ctx.font = `${fontSize}px "${fontFamily}", "Microsoft YaHei", "SimHei", sans-serif`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 处理文本换行
    const maxWidth = width * 0.8;
    const lines = [];

    // 检查是否有文本
    if (!text || text.trim() === '') {
      text = '请先输入游记标题';
    }

    // 针对中文文本的换行处理
    if (/[\u4e00-\u9fa5]/.test(text)) {
      let currentLine = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const testLine = currentLine + char;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
    } else {
      const words = text.split(' ');
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
    }

    // 绘制文字（多行）
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    let y = (height - totalTextHeight) / 2 + fontSize / 2;

    for (const line of lines) {
      ctx.fillText(line, width / 2, y);
      y += lineHeight;
    }

    // 确保目录存在
    const dir = path.dirname(finalOutputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 将画布内容导出为图片
    const out = fs.createWriteStream(finalOutputPath);
    const stream = canvas.createPNGStream();
    console.log('开始写入图片文件');

    await new Promise((resolve, reject) => {
      stream.pipe(out);
      out.on('finish', () => {
        console.log('图片文件写入完成');
        resolve();
      });
      out.on('error', (err) => {
        console.error('图片文件写入失败:', err);
        reject(err);
      });
    });

    return finalOutputPath;
  } catch (error) {
    console.error('生成图片过程中发生错误:', error);
    throw new Error(`生成图片失败: ${error.message}`);
  }
};

// 确保所需目录存在
const ensureDirectories = () => {
  const directories = [
    path.join(__dirname, '../public/ref'),
    path.join(__dirname, '../public/generated'),
    path.join(__dirname, '../public/thumbnails'),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// 在生成图片前调用
exports.generateImage = async (req, res) => {
  try {
    // 确保目录存在
    ensureDirectories();

    const { content, width, height } = req.body;

    // 默认宽高
    const imageWidth = parseInt(width) || 300;
    const imageHeight = parseInt(height) || 400;

    console.log('Received text:', content);
    console.log('Image width:', imageWidth);
    console.log('Image height:', imageHeight);

    // 如果generateAll为true，则生成所有样式的图片
    const results = [];

    // 为每种样式生成图片
    for (let i = 0; i < local_style.length; i++) {
      const style = local_style[i];

      // 生成图片
      const imagePath = await generateImageService(content, imageWidth, imageHeight, null, style);

      // 读取生成的图片并转为base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

      // 添加到结果数组
      results.push({
        styleIndex: i,
        url: base64Image,
      });

      fs.unlinkSync(imagePath);
    }

    // 返回所有样式的图片
    return res.status(200).json({
      code: 200,
      data: results,
      message: '生成多样式图片',
    });
  } catch (error) {
    console.error('生成图片失败:', error);
    res.status(500).json({
      code: 500,
      message: '生成图片失败: ' + error.message,
    });
  }
};

// 上传并处理图片
exports.uploadAndProcessImage = async (req, res) => {
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

/**
 * 从视频中提取缩略图
 * @param {string} videoUrl - 视频URL
 * @returns {Promise<string>} - 返回上传到OSS的缩略图URL
 */
// From video中提取缩略图
const extractVideoThumbnailService = async (videoUrl) => {
  try {
    const timestamp = Date.now();
    const thumbnailPath = path.join(__dirname, `../public/thumbnails/thumbnail_${timestamp}.jpg`);
    const dir = path.dirname(thumbnailPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 获取视频信息以获取原始尺寸
    const videoInfo = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoUrl, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });

    const originalWidth = videoInfo.streams[0].width;
    const originalHeight = videoInfo.streams[0].height;

    // 使用ffmpeg截取第一帧，保持原始尺寸
    await new Promise((resolve, reject) => {
      ffmpeg(videoUrl)
        .on('end', () => {
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
          size: `${originalWidth}x${originalHeight}`,
        });
    });

    // 读取生成的截图文件
    const imageBuffer = await fs.promises.readFile(thumbnailPath);

    // 使用sharp添加播放按钮
    const processedImageBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(`
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" fill="rgba(0, 0, 0, 0.5)" stroke="white" stroke-width="2"/>
              <path d="M32 25L55 40L32 55V25Z" fill="white"/>
            </svg>
          `),
          gravity: 'southeast',
          top: originalHeight - 100,
          left: originalWidth - 100,
        },
      ])
      .jpeg()
      .toBuffer();

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

// Export the service functions
exports.extractVideoThumbnail = extractVideoThumbnailService;
