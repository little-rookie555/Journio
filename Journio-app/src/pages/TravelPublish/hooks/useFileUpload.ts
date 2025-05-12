import { uploadFile } from '@/api/upload';
import { compressImage } from '@/components/ImageCompressor';
import { Toast } from 'antd-mobile';

export const useFileUpload = () => {
  const handleUpload = async (file: File) => {
    try {
      // 判断是否为图片文件
      // console.log(file.size);
      if (file.type.startsWith('image/')) {
        // 压缩图片
        const compressedFile = await compressImage(file);
        file = compressedFile;
      }
      // console.log('压缩后', file.size);
      const res = await uploadFile(file);
      if (res.code === 200) {
        return {
          url: res.data.url,
        };
      } else {
        Toast.show({
          icon: 'fail',
          content: '上传失败',
        });
        return {
          url: URL.createObjectURL(file),
        };
      }
    } catch (error) {
      console.error('上传失败:', error);
      Toast.show({
        icon: 'fail',
        content: '上传失败，请稍后重试',
      });
      return {
        url: URL.createObjectURL(file),
      };
    }
  };

  return {
    handleUpload,
  };
};
