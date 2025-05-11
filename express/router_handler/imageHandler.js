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
    fontColor: '#ecf0f1',
    bgStyle: 'gradient',
    gradientColor: '#3498db',
  },
  {
    name: '复古风格',
    bgColor: '#f9e7c9',
    fontFamily: 'Times New Roman',
    fontSize: 28,
    fontColor: '#8b4513',
    bgStyle: 'pattern',
    patternColor: '#d2b48c',
  },
  {
    name: '点状背景',
    bgColor: '#f0f8ff',
    fontFamily: 'Verdana',
    fontSize: 32,
    fontColor: '#4682b4',
    bgStyle: 'dots',
    dotsColor: '#87ceeb',
  },
  // 添加新样式 - 黄色猫咪风格
  {
    name: '黄色猫咪风格',
    bgColor: '#f9f871', // 明亮的黄色背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 40,
    fontColor: '#333333',
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
    fontColor: '#ffffff', // 白色文字
    bgStyle: 'bubble',
    bubbleColor: '#1e90ff',
  },
  // 添加新样式 - 引用风格
  {
    name: '引用风格',
    bgColor: '#f5f5f5', // 浅灰色背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 38,
    fontColor: '#1e3a8a', // 深蓝色文字
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
    fontColor: '#2e7d32', // 深绿色文字
    bgStyle: 'gradient',
    gradientColor: '#a5d6a7', // 浅绿色渐变
  },
  // 添加新样式 - 暗黑模式
  {
    name: '暗黑模式',
    bgColor: '#121212', // 深黑色背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 38,
    fontColor: '#e0e0e0', // 浅灰色文字
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
    fontColor: '#4a6572', // 灰蓝色文字
    bgStyle: 'watercolor',
    watercolorColors: ['#ffcdd2', '#bbdefb', '#c8e6c9', '#fff9c4'], // 水彩颜色
  },
  // 添加新样式 - 极简风格
  {
    name: '极简风格',
    bgColor: '#fafafa', // 几乎白色的背景
    fontFamily: 'Microsoft YaHei',
    fontSize: 32,
    fontColor: '#212121', // 深灰色文字
    bgStyle: 'solid',
    hasBorder: true,
    borderColor: '#bdbdbd', // 浅灰色边框
    borderWidth: 2,
  },
];

/**
 * 根据传入的style生成简单图片
 * @param {string} text - 要在图片上显示的文字
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @param {string} outputPath - 输出路径
 * @param {object} style - 样式配置
 * @returns {Promise<string>} - 返回生成的图片路径
 */
const generateImageService = async (
  text,
  width = 400,
  height = 400,
  outputPath = null,
  style = {},
) => {
  try {
    // 创建一个画布
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const currentStyle = style;

    // 获取样式参数
    const {
      name = '默认样式',
      bgColor = '#ffffff',
      fontFamily = 'Arial',
      fontSize = 30,
      fontColor = '#000000',
      bgStyle = 'solid',
      gradientColor,
      patternColor,
      dotsColor,
      gridSize,
      dotSize,
      dotSpacing,
      hasHighlight,
      highlightColor,
      hasIcon,
      iconType,
      bubbleColor,
      quoteColor,
    } = currentStyle;

    // 根据不同的背景样式绘制背景
    switch (bgStyle) {
      case 'gradient':
        // 渐变背景
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, bgColor);
        gradient.addColorStop(1, gradientColor || '#f0f0f0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
      case 'pattern':
        // 图案背景（网格）
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // 绘制网格
        ctx.strokeStyle = patternColor || '#e0e0e0';
        ctx.lineWidth = 1;

        const gridSizeValue = gridSize || 20;
        for (let x = 0; x <= width; x += gridSizeValue) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        for (let y = 0; y <= height; y += gridSizeValue) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;
      case 'dots':
        // 点状背景
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = dotsColor || '#e0e0e0';
        const dotSizeValue = dotSize || 3;
        const dotSpacingValue = dotSpacing || 20;

        for (let x = dotSpacingValue; x < width; x += dotSpacingValue) {
          for (let y = dotSpacingValue; y < height; y += dotSpacingValue) {
            ctx.beginPath();
            ctx.arc(x, y, dotSizeValue, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case 'bubble':
        // 气泡背景（参考图2）
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // 绘制气泡形状
        const bubbleWidth = width * 0.9;
        const bubbleHeight = height * 0.7;
        const bubbleX = (width - bubbleWidth) / 2;
        const bubbleY = height * 0.15;

        // 绘制气泡主体
        ctx.fillStyle = bubbleColor || '#87cefa';
        ctx.beginPath();
        ctx.moveTo(bubbleX + bubbleWidth / 2, bubbleY + bubbleHeight);
        ctx.lineTo(bubbleX + bubbleWidth / 4, height * 0.95); // 气泡尖角
        ctx.lineTo(bubbleX + bubbleWidth / 3, bubbleY + bubbleHeight);

        // 绘制气泡圆角矩形
        const radius = 30;
        ctx.moveTo(bubbleX + radius, bubbleY);
        ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
        ctx.quadraticCurveTo(
          bubbleX + bubbleWidth,
          bubbleY,
          bubbleX + bubbleWidth,
          bubbleY + radius,
        );
        ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
        ctx.quadraticCurveTo(
          bubbleX + bubbleWidth,
          bubbleY + bubbleHeight,
          bubbleX + bubbleWidth - radius,
          bubbleY + bubbleHeight,
        );
        ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
        ctx.quadraticCurveTo(
          bubbleX,
          bubbleY + bubbleHeight,
          bubbleX,
          bubbleY + bubbleHeight - radius,
        );
        ctx.lineTo(bubbleX, bubbleY + radius);
        ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY);
        ctx.closePath();
        ctx.fill();
        break;
      case 'quote':
        // 引用风格背景（参考图3）
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // 绘制引号
        ctx.fillStyle = quoteColor || '#1e3a8a';
        ctx.font = `bold ${fontSize * 2}px "Times New Roman"`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('"', width * 0.1, height * 0.15);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('"', width * 0.9, height * 0.85);

        // 绘制黄色圆圈高亮（如果有）
        if (hasHighlight && highlightColor) {
          ctx.beginPath();
          ctx.arc(width * 0.2, height * 0.4, width * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = highlightColor;
          ctx.globalAlpha = 0.3;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
        break;
      default:
        // 纯色背景
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // 如果是黄色猫咪风格（参考图1），添加高亮区域
        if (hasHighlight && highlightColor && name === '黄色猫咪风格') {
          ctx.fillStyle = highlightColor;
          ctx.globalAlpha = 0.6;
          const highlightHeight = height * 0.15;
          const highlightY = height * 0.45;
          ctx.fillRect(0, highlightY, width, highlightHeight);
          ctx.globalAlpha = 1.0;
        }
    }

    // 设置字体样式和颜色
    // 修改字体设置，确保支持中文
    ctx.font = `${fontSize}px "${fontFamily}", "Microsoft YaHei", "SimHei", sans-serif`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 处理文本换行 - 修改为适合中文的逻辑
    const maxWidth = width * 0.8;
    const lines = [];

    // 检查是否有文本
    if (!text || text.trim() === '') {
      text = '请先输入游记标题';
    }

    // 针对中文文本的换行处理
    if (/[\u4e00-\u9fa5]/.test(text)) {
      // 包含中文字符，按字符长度分割
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
      // 英文文本，按空格分割单词
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

    // 如果是气泡风格，调整文字位置
    if (bgStyle === 'bubble') {
      y = height * 0.4;
    }

    for (const line of lines) {
      ctx.fillText(line, width / 2, y);
      y += lineHeight;
    }

    // 如果是黄色猫咪风格，添加猫咪图标
    if (hasIcon && iconType === 'cat' && name === '黄色猫咪风格') {
      // 这里只是简单绘制一个猫咪形状
      // 实际应用中可以使用loadImage加载猫咪图片
      const catX = width * 0.8;
      const catY = height * 0.25;
      const catSize = width * 0.15;

      // 绘制猫咪头部
      ctx.fillStyle = '#666666';
      ctx.beginPath();
      ctx.arc(catX, catY, catSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // 绘制猫咪耳朵
      ctx.beginPath();
      ctx.moveTo(catX - catSize / 3, catY - catSize / 3);
      ctx.lineTo(catX - catSize / 2, catY - catSize * 0.7);
      ctx.lineTo(catX - catSize * 0.1, catY - catSize / 2);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(catX + catSize / 3, catY - catSize / 3);
      ctx.lineTo(catX + catSize / 2, catY - catSize * 0.7);
      ctx.lineTo(catX + catSize * 0.1, catY - catSize / 2);
      ctx.closePath();
      ctx.fill();

      // 绘制猫咪脸
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(catX, catY + catSize * 0.1, catSize / 3, 0, Math.PI);
      ctx.fill();

      // 绘制猫咪眼睛
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(catX - catSize / 6, catY, catSize / 10, 0, Math.PI * 2);
      ctx.arc(catX + catSize / 6, catY, catSize / 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // 确定输出路径
    const timestamp = Date.now();
    const styleName = name.replace(/\s+/g, '_').toLowerCase();
    const finalOutputPath =
      outputPath ||
      path.join(__dirname, '../public/generated', `image_${styleName}_${timestamp}.png`);

    // 确保目录存在
    const dir = path.dirname(finalOutputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 将画布内容导出为图片
    const out = fs.createWriteStream(finalOutputPath);
    const stream = canvas.createPNGStream();

    await new Promise((resolve, reject) => {
      stream.pipe(out);
      out.on('finish', resolve);
      out.on('error', reject);
    });

    return finalOutputPath;
  } catch (error) {
    console.error('生成图片失败:', error);
    throw error;
  }
};

// 生成简单图片
exports.generateImage = async (req, res) => {
  try {
    const { content, width, height } = req.body;

    // 默认宽高
    const imageWidth = parseInt(width) || 400;
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
