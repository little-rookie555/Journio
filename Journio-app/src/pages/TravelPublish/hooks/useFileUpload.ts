import { uploadFile } from '@/api/upload';
import { Toast } from 'antd-mobile';

export const useFileUpload = () => {
  const handleUpload = async (file: File) => {
    try {
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
