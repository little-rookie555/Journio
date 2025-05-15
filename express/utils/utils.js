/**
 * 移除字符串中的 HTML 标签，同时保留段落和换行结构
 * @param {string} html HTML 字符串
 * @param {number} [maxLength] 可选，限制返回文本的最大长度
 * @returns {string} 清理后的纯文本
 */
const stripHtml = (html, maxLength) => {
  if (!html) return '';

  // 将段落和换行标签转换为实际的换行符
  const textWithBreaks = html
    .replace(/<p[^>]*>/gi, '') // 移除 <p> 开始标签
    .replace(/<\/p>/gi, '\n\n') // 将 </p> 转换为两个换行
    .replace(/<br\s*\/?>/gi, '\n') // 将 <br> 转换为单个换行
    .replace(/<[^>]+>/g, '') // 移除所有其他 HTML 标签
    .replace(/\n\s*\n/g, '\n\n') // 将多个连续换行减少为最多两个
    .replace(/^\s+|\s+$/g, ''); // 移除首尾空白

  // 如果指定了最大长度，截取文本
  if (maxLength && textWithBreaks.length > maxLength) {
    return textWithBreaks.slice(0, maxLength) + '...';
  }

  return textWithBreaks;
};

module.exports = {
  stripHtml,
};
