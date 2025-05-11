import { publishTravel, updateTravel } from '@/api/travel';
import { useUserStore } from '@/store/user';
import { Toast } from 'antd-mobile';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useTravelForm = (editId: string | null, content: string) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userInfo } = useUserStore();

  const onFinish = async (values: any) => {
    console.log('values', values);
    try {
      if (!userInfo) {
        Toast.show({
          icon: 'fail',
          content: '请先登录',
        });
        navigate('/login');
        return;
      }

      setLoading(true);
      const travelData = {
        ...values,
        content: content,
        images: values.images.map((item: any) => item.url),
        coverImage: values.images[0]?.url || '',
        video: values.video?.url || '',
        travelDate: values.travelDate.toISOString().split('T')[0],
        duration: Number(values.duration),
        cost: Number(values.cost),
        locations: values.locations || [],
        authorId: userInfo?.id,
        authorNickname: userInfo?.nickname,
        authorAvatar: userInfo?.avatar,
      };

      let res;
      if (editId) {
        res = await updateTravel(Number(editId), travelData);
      } else {
        res = await publishTravel(travelData);
      }

      if (res.code === 200) {
        Toast.show({
          icon: 'success',
          content: editId ? '更新成功' : '发布成功',
        });
        navigate('/');
      }
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content:
          error?.response?.data?.message ||
          error?.message ||
          (editId ? '更新失败，请稍后重试' : '发布失败，请稍后重试'),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    onFinish,
  };
};
