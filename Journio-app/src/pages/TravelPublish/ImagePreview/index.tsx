import React, { useState } from 'react';
import { Modal, Image, Button, Swiper, Toast } from 'antd-mobile';
import './index.scss';
import { ImageData } from '../../../api/travel';
import { LeftOutline } from 'antd-mobile-icons';

interface ImagePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  images: ImageData[];
  onSelect?: (imageUrl: string) => void; // 设为可选
  handleUpload?: (file: File) => Promise<{ url: string }>; // 添加上传处理函数
  onUploadSuccess?: (url: string) => void; // 添加上传成功回调
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  visible,
  onClose,
  images,
  onSelect,
  handleUpload,
  onUploadSuccess,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // 处理选择图片
  const handleSelectImage = async (imageUrl: string) => {
    try {
      // 如果没有提供handleUpload，则使用原来的onSelect回调
      if (!handleUpload) {
        if (onSelect) {
          onSelect(imageUrl);
        }
        onClose();
        return;
      }

      // 显示上传中提示
      Toast.show({
        icon: 'loading',
        content: '正在上传图片...',
        duration: 0,
      });

      // 将base64转换为Blob对象
      const base64Data = imageUrl.split(',')[1];
      const blob = await fetch(`data:image/png;base64,${base64Data}`).then((res) => res.blob());

      // 创建File对象
      const file = new File([blob], `generated_image_${Date.now()}.png`, { type: 'image/png' });

      // 使用handleUpload上传文件
      const uploadResult = await handleUpload(file);

      if (uploadResult && uploadResult.url) {
        // 关闭加载提示
        Toast.clear();

        // 显示成功提示
        Toast.show({
          icon: 'success',
          content: '已添加到图片列表',
        });

        // 调用上传成功回调
        if (onUploadSuccess) {
          onUploadSuccess(uploadResult.url);
        }

        onClose();
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      // 关闭加载提示
      Toast.clear();

      // 显示错误提示
      Toast.show({
        icon: 'fail',
        content: '图片上传失败',
      });
      console.error('图片上传失败:', error);
    }
  };

  // 处理缩略图点击
  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <Modal
      visible={visible}
      content={
        <div className="image-preview-modal">
          <div className="image-preview-header">
            <LeftOutline onClick={onClose} />
            <span className="title">选择配图</span>
            <div className="placeholder"></div>
          </div>

          {images && images.length > 0 ? (
            <>
              <div className="image-preview-main">
                <Swiper
                  defaultIndex={activeIndex}
                  onIndexChange={setActiveIndex}
                  indicator={() => null}
                  loop={false}
                  style={{
                    '--height': '300px',
                    '--width': '100%',
                    '--border-radius': '8px',
                  }}
                >
                  <Swiper.Item>
                    <div className="image-preview-item">
                      <Image src={images[activeIndex].url} fit="contain" />
                    </div>
                  </Swiper.Item>
                </Swiper>
              </div>

              <div className="image-preview-thumbnails">
                <div className="thumbnails-container">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail-item ${index === activeIndex ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <Image src={image.url} fit="cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="image-preview-footer">
                <div className="hint-text">选择一个喜欢的卡片</div>
                <Button
                  color="danger"
                  className="next-button"
                  onClick={() => handleSelectImage(images[activeIndex].url)}
                >
                  下一步
                </Button>
              </div>
            </>
          ) : (
            <div className="no-images">暂无生成的图片</div>
          )}
        </div>
      }
      closeOnMaskClick
      showCloseButton={false}
    />
  );
};

export default ImagePreviewModal;
