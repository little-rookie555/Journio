import { Button, Toast } from 'antd-mobile';
import React, { useRef, useState } from 'react';
import './index.scss';

interface VideoUploaderProps {
  value?: { url: string } | null;
  onChange?: (file: { url: string } | null) => void;
  maxSize?: number; // 单位：MB
  upload?: (file: File) => Promise<{ url: string }>;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  value,
  onChange,
  maxSize = 100, // 默认最大100MB
  upload,
}) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('video/')) {
      Toast.show({
        icon: 'fail',
        content: '请上传视频文件',
      });
      return;
    }

    // 检查文件大小
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSize) {
      Toast.show({
        icon: 'fail',
        content: `视频大小不能超过 ${maxSize}MB`,
      });
      return;
    }

    try {
      setLoading(true);
      let url;
      if (upload) {
        // 如果提供了自定义上传函数，使用它
        const result = await upload(file);
        url = result.url;
      } else {
        // 否则使用默认的对象 URL 创建方式
        url = (window.URL || window.webkitURL).createObjectURL(file);
      }
      onChange?.({ url });
    } catch {
      Toast.show({
        icon: 'fail',
        content: '视频上传失败',
      });
    } finally {
      setLoading(false);
      // 重置 input 值，允许重复选择同一个文件
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange?.(null);
    // 释放之前创建的对象 URL
    if (value?.url) {
      (window.URL || window.webkitURL).revokeObjectURL(value.url);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="video-uploader">
      {value ? (
        <div className="video-preview">
          <video src={value.url} controls className="preview-video" />
          <Button size="small" color="danger" onClick={handleRemove} className="remove-btn">
            删除视频
          </Button>
        </div>
      ) : (
        <div className="upload-button">
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="file-input"
            style={{ display: 'none' }}
          />
          <div className="upload-area" onClick={handleClick}>
            <Button loading={loading}>{loading ? '上传中...' : '上传视频'}</Button>
            <div className="upload-tip">支持视频格式：MP4、WebM等（{maxSize}MB以内）</div>
          </div>
        </div>
      )}
    </div>
  );
};
