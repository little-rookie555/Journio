import { getTravelDetail, publishTravel, updateTravel } from '@/api/travel';
import { uploadFile } from '@/api/upload';
import { VideoUploader } from '@/components/VideoUploader';
import { useUserStore } from '@/store/user';
import { Amap } from '@amap/amap-react';
import { Button, DatePicker, Form, ImageUploader, Input, NavBar, Popup, Toast } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css'; // 替换 snow 主题
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import TemplateList from './TemplateList';
import './index.scss';

const TravelPublish: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { userInfo } = useUserStore();
  const [searchParams] = useSearchParams(); //
  const [form] = Form.useForm();
  const editId = searchParams.get('edit');
  const [content, setContent] = useState('');
  const [dateVisible, setDateVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [templateVisible, setTemplateVisible] = useState(false); // 模板是否可见

  const modules = {
    toolbar: [
      [
        { header: '1' },
        { header: '2' },
        'bold',
        'underline',
        { list: 'ordered' },
        { list: 'bullet' },
      ], // 直接配置 h1, h2 标题按钮
    ],
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
            travelDate: new Date(res.data.travelDate),
            duration: res.data.duration,
            cost: res.data.cost,
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

  const handleTemplateClick = (template: string) => {
    // 写入文字模板
    const templateLines = template.split('\n').map((line) => {
      const title = line.split('：')[0];
      return title + '：';
    });

    const processedTemplates = templateLines.join('<br>');
    setContent((prevContent) => prevContent + processedTemplates);
    setTemplateVisible(false);
  };

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
        video: values.video?.url || '',
        travelDate: values.travelDate.toISOString().split('T')[0], // 格式化日期
        duration: Number(values.duration),
        cost: Number(values.cost),
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

  const { theme } = useTheme();

  return (
    <div className={`travel-publish ${theme === 'dark' ? 'dark' : ''}`}>
      <NavBar onBack={() => navigate(-1)} className="nav-bar">
        {editId ? '编辑游记' : '发布游记'}
      </NavBar>
      <div className="publish-form">
        <Form
          style={{
            '--border-inner': 'none',
            '--border-top': 'none',
          }}
          form={form}
          layout="vertical"
          onFinish={onFinish}
          footer={
            <Button block type="submit" color="primary" loading={loading}>
              {editId ? '保存' : '发布'}
            </Button>
          }
        >
          <Form.Item label="上传图片视频" className="travel-info-card">
            <Form.Item name="images" rules={[{ required: true, message: '请上传至少一张图片' }]}>
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
            <Form.Item name="video">
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
          </Form.Item>
          {/* 添加新的表单项组 */}
          <Form.Item label="游玩信息" className="travel-info-card">
            <div className="travel-info-container">
              {/* 第一行：出发日期和游玩时长 */}
              <div className="travel-info-row">
                <Form.Item
                  name="travelDate"
                  label="出发日期"
                  rules={[{ required: true, message: '请选择出发时间' }]}
                  className="date-picker-item"
                >
                  <DatePicker
                    visible={dateVisible}
                    onClose={() => setDateVisible(false)}
                    onConfirm={(val) => {
                      form.setFieldValue('travelDate', val);
                    }}
                    max={new Date()}
                    precision="month"
                  >
                    {(value) => (
                      <div
                        onClick={() => setDateVisible(true)}
                        style={{
                          height: '32px',
                          lineHeight: '32px',
                          padding: '0 12px',
                          border: 'none',
                          fontSize: '15px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: theme === 'dark' ? '#f5f5f5' : '#333',
                        }}
                      >
                        {value
                          ? value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
                          : '请选择出发日期'}
                      </div>
                    )}
                  </DatePicker>
                </Form.Item>
                <Form.Item
                  name="duration"
                  label="旅行天数"
                  rules={[{ required: true, message: '请填写旅行天数' }]}
                  className="duration-item"
                >
                  <Input type="number" placeholder="请输入" />
                </Form.Item>
              </div>
              {/* 第二行：人均消费 */}
              <Form.Item
                name="cost"
                label="人均消费（元）"
                rules={[{ required: true, message: '请填写人均消费' }]}
                className="cost-item"
              >
                <Input type="number" placeholder="请输入人均消费金额" />
              </Form.Item>
              {/* 添加地点选择 */}
              <Form.Item
                name="location"
                label="游玩地点"
                // rules={[{ required: true, message: '请选择游玩地点' }]}
              >
                <div className="location-picker">
                  <div className="location-input" onClick={() => setMapVisible(true)}>
                    {'点击选择地点'}
                  </div>
                  <Popup
                    visible={mapVisible}
                    onMaskClick={() => setMapVisible(false)}
                    bodyStyle={{
                      height: '80vh',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                    }}
                  >
                    <div style={{ height: '400px', width: '100%' }}>
                      <Amap zoom={15}>
                        {/* <Marker
                          position={[116.473179, 39.993169]}
                          label={{
                            content: 'Hello, AMap-React!',
                            direction: 'bottom',
                          }}
                          draggable
                        /> */}
                      </Amap>
                      <Button
                        block
                        color="primary"
                        onClick={() => setMapVisible(false)}
                        style={{ marginTop: '12px' }}
                      >
                        确定
                      </Button>
                    </div>
                  </Popup>
                </div>
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item label="游记内容" className="travel-info-card" style={{ position: 'relative' }}>
            <Button
              onClick={() => setTemplateVisible(true)}
              className="template-button"
              size="mini"
            >
              📄选择模板{'>'}
            </Button>
            <Form.Item name="title" rules={[{ required: true, message: '请输入标题' }]}>
              <Input placeholder="请输入游记标题" />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: '请输入正文' }]}
              style={{ padding: 0 }} // 添加 padding: 0
            >
              <ReactQuill
                theme="bubble"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="请输入游记正文"
              />
            </Form.Item>
          </Form.Item>

          {/* 评论列表弹出框 */}
          <TemplateList
            visible={templateVisible}
            onClose={() => setTemplateVisible(false)}
            onTemplateSelect={handleTemplateClick}
          />
        </Form>
      </div>
    </div>
  );
};

export default TravelPublish;
