import { getTravelDetail, publishTravel, updateTravel } from '@/api/travel';
import { useUserStore } from '@/store/user';
import { Button, Form, ImageUploader, Input, NavBar, TextArea, Toast } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './index.scss';

const TravelPublish: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { userInfo } = useUserStore();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const editId = searchParams.get('edit');

  useEffect(() => {
    const fetchTravelDetail = async () => {
      if (!editId) return;

      try {
        setLoading(true);
        const res = await getTravelDetail(Number(editId));
        if (res.code === 200) {
          // 设置表单初始值
          form.setFieldsValue({
            title: res.data.title,
            content: res.data.content,
            images: res.data.images.map((url) => ({ url })),
          });
        }
      } catch {
        Toast.show({
          icon: 'fail',
          content: '获取游记详情失败',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTravelDetail();
  }, [editId, form]);

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
      const travelData = {
        ...values,
        images: values.images.map((item: any) => item.url),
        coverImage: values.images[0]?.url || '',
        authorId: userInfo?.id,
        authorNickname: userInfo?.nickname,
        authorAvatar: userInfo?.avatar,
      };

      let res;
      if (editId) {
        // 编辑模式
        res = await updateTravel(Number(editId), travelData);
      } else {
        // 发布模式
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

  return (
    <div className="travel-publish">
      <NavBar onBack={() => navigate(-1)} className="nav-bar">
        {editId ? '编辑游记' : '发布游记'}
      </NavBar>
      <div className="publish-form">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          footer={
            <Button block type="submit" color="primary" loading={loading}>
              {editId ? '保存' : '发布'}
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
