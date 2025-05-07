import { getTravelDetail, publishTravel, updateTravel } from '@/api/travel';
import { uploadFile } from '@/api/upload';
import { useUserStore } from '@/store/user';
import { Button, Form, ImageUploader, Input, NavBar, Toast } from 'antd-mobile';
import { VideoUploader } from '@/components/VideoUploader';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';  // 替换 snow 主题
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
  const [content, setContent] = useState('');

  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' },
        'bold', 'underline',
        { 'list': 'ordered'}, { 'list': 'bullet' }],  // 直接配置 h1, h2 标题按钮
    ]
  };

  useEffect(() => {
    const fetchTravelDetail = async () => {
      if (!editId) return;

      try {
        setLoading(true);
        const res = await getTravelDetail(Number(editId));
        if (res.code === 200) {
          form.setFieldsValue({
            title: res.data.title,
            images: res.data.images.map((url) => ({ url })),
            video: res.data.video ? { url: res.data.video } : null,
          });
          setContent(res.data.content);
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
        content: content,
        images: values.images.map((item: any) => item.url),
        coverImage: values.images[0]?.url || '',
        video: values.video?.url || '', // 添加视频URL
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
          <Form.Item label="正文" rules={[{ required: true, message: '请输入正文' }]}>
            <ReactQuill 
              theme="bubble"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="请输入游记正文"
            />
          </Form.Item>
          <Form.Item
            name="video"
            label="视频"
          >
            <VideoUploader 
              maxSize={50} 
              upload={async (file) => {
                // 上传视频，逻辑与照片一样
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
              }}
            />
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
                  // 上传失败时，仍然返回本地预览URL
                  return {
                    url: URL.createObjectURL(file),
                  };
                }
              }}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default TravelPublish;
