import { publishTravel } from '@/api/travel';
import { Button, Form, ImageUploader, Input, NavBar, TextArea, Toast } from 'antd-mobile';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/user';
import './index.scss';

const TravelPublish: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { userInfo } = useUserStore();

  const onFinish = async (values: any) => {
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
      const res = await publishTravel({
        ...values,
        images: values.images.map((item: any) => item.url),
        coverImage: values.images[0]?.url || '',
        authorId: userInfo?.id,
        authorNickname: userInfo?.nickname,
        authorAvatar: userInfo?.avatar,
      });
      if (res.code === 200) {
        Toast.show({
          icon: 'success',
          content: '发布成功',
        });
        navigate('/');
      }
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error?.response?.data?.message || error?.message || '发布失败，请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="travel-publish">
      <NavBar onBack={() => navigate(-1)} className="nav-bar">
        发布游记
      </NavBar>
      <div className="publish-form">
        <Form
          layout="vertical"
          onFinish={onFinish}
          footer={
            <Button block type="submit" color="primary" loading={loading}>
              发布
            </Button>
          }
        >
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入游记标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="正文"
            rules={[{ required: true, message: '请输入正文' }]}
          >
            <TextArea placeholder="请输入游记正文" rows={10} maxLength={5000} showCount />
          </Form.Item>
          <Form.Item
            name="images"
            label="图片"
            rules={[{ required: true, message: '请上传至少一张图片' }]}
          >
            <ImageUploader
              multiple
              maxCount={9}
              upload={async (file) => {
                // 这里模拟上传，实际项目中需要替换为真实的上传接口
                return {
                  url: URL.createObjectURL(file),
                };
              }}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default TravelPublish;
