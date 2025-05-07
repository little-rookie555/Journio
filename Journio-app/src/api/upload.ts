import request from '@/utils/request';

export interface image {
    url: string;
  }

/**
 * 上传图片
 * @param file 要上传的文件
 * @returns 上传结果，包含图片URL
 */
export const uploadFile = (file: File): Promise<{ code: number; data: image; message?: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/travel/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};