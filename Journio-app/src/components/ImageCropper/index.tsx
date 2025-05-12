import { Button, Popup, Toast } from 'antd-mobile';
import 'cropperjs/dist/cropper.css';
import React, { useRef } from 'react';
import Cropper from 'react-cropper';
import './index.scss';

interface ImageCropperProps {
  visible: boolean;
  onClose: () => void;
  file: File | null;
  onCropComplete: (file: File) => void;
  aspectRatio?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  visible,
  onClose,
  file,
  onCropComplete,
  aspectRatio = 1,
}) => {
  const cropperRef = useRef<any>(null);

  const handleCrop = async () => {
    try {
      const cropper = cropperRef.current?.cropper;
      if (!cropper) return;

      const canvas = cropper.getCroppedCanvas();
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob: any) => resolve(blob!), 'image/jpeg', 0.8);
      });

      const croppedFile = new File([blob], file?.name || 'cropped.jpg', {
        type: 'image/jpeg',
      });

      onCropComplete(croppedFile);
    } catch (error) {
      console.error('裁剪失败:', error);
      Toast.show({
        icon: 'fail',
        content: '裁剪失败，请重试',
      });
    }
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      bodyStyle={{
        height: '80vh',
        background: '#000',
      }}
    >
      <div className="image-cropper">
        <div className="cropper-header">
          <span>调整图片</span>
          <span className="close" onClick={onClose}>
            ×
          </span>
        </div>
        <div className="cropper-container">
          {file && (
            <Cropper
              ref={cropperRef}
              src={URL.createObjectURL(file)}
              style={{ height: '100%', width: '100%' }}
              aspectRatio={aspectRatio}
              viewMode={1}
              guides={true}
              autoCropArea={1}
              background={false}
              rotatable={false}
              zoomable={true}
              movable={true}
            />
          )}
        </div>
        <div className="cropper-footer">
          <Button onClick={onClose}>取消</Button>
          <Button color="primary" onClick={handleCrop}>
            确定
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default ImageCropper;
