import { Toast } from 'antd-mobile';
import imageCompression from 'browser-image-compression';

interface ImageCompressorProps {
  onCompress: (file: File) => Promise<{ url: string }>;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

export const compressImage = async (
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920,
) => {
  try {
    const options = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('压缩图片失败:', error);
    Toast.show({
      icon: 'fail',
      content: '图片压缩失败',
    });
    return file;
  }
};
