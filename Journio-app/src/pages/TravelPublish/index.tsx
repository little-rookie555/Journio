import { getTravelDetail } from '@/api/travel';
import DeletableTag from '@/components/DeletableTag';
import MapPicker from '@/components/MapPicker';
import { VideoUploader } from '@/components/VideoUploader';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, DatePicker, Form, ImageUploader, Input, NavBar, Toast } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDatePicker } from './hooks/useDatePicker';
import { useFileUpload } from './hooks/useFileUpload';
import { useLocationManagement } from './hooks/useLocationManagement';
import { useTravelForm } from './hooks/useTravelForm';
import './index.scss';
import TemplateList from './TemplateList';

const TravelPublish: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const editId = searchParams.get('edit');
  const [content, setContent] = useState('');
  const [templateVisible, setTemplateVisible] = useState(false);
  const { theme } = useTheme();

  // 使用自定义hooks
  const { dateVisible, setDateVisible, handleDateConfirm } = useDatePicker(form);
  const { handleUpload } = useFileUpload();
  const {
    mapVisible,
    setMapVisible,
    selectedLocations,
    handleLocationSelect,
    handleLocationChange,
    handleRemoveLocation,
  } = useLocationManagement(form);
  const { loading, onFinish } = useTravelForm(editId, content);

  // 富文本编辑器配置
  const modules = {
    toolbar: [
      [
        { header: '1' },
        { header: '2' },
        'bold',
        'underline',
        { list: 'ordered' },
        { list: 'bullet' },
      ],
    ],
  };

  // 处理模板选择
  const handleTemplateClick = (template: string) => {
    const templateLines = template.split('\n').map((line) => {
      const title = line.split('：')[0];
      return title + '：';
    });
    const processedTemplates = templateLines.join('<br>');
    setContent((prevContent) => prevContent + processedTemplates);
    setTemplateVisible(false);
  };

  // 获取游记详情
  useEffect(() => {
    const fetchTravelDetail = async () => {
      if (!editId) return;

      try {
        const res = await getTravelDetail(Number(editId));
        if (res.code === 200) {
          form.setFieldsValue({
            title: res.data.title,
            images: res.data.images.map((url) => ({ url })),
            video: res.data.video ? { url: res.data.video } : null,
            travelDate: new Date(res.data.travelDate),
            duration: res.data.duration,
            cost: res.data.cost,
            locations: res.data.locations || [],
          });
          setContent(res.data.content);
        }
      } catch {
        Toast.show({
          icon: 'fail',
          content: '获取游记详情失败',
        });
      }
    };

    fetchTravelDetail();
  }, [editId, form]);

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
              <ImageUploader multiple maxCount={9} upload={handleUpload} />
            </Form.Item>
            <Form.Item name="video">
              <VideoUploader maxSize={50} upload={handleUpload} />
            </Form.Item>
          </Form.Item>

          <Form.Item label="游玩信息" className="travel-info-card">
            <div className="travel-info-container">
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
                    onConfirm={handleDateConfirm}
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
                          color: theme === 'dark' ? '#f5f5f5' : '#666',
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

              <Form.Item
                name="cost"
                label="人均消费（元）"
                rules={[{ required: true, message: '请填写人均消费' }]}
                className="cost-item"
              >
                <Input type="number" placeholder="请输入人均消费金额" />
              </Form.Item>

              <Form.Item name="locations" label="游玩地点">
                <div className="location-picker">
                  <div className="location-tags">
                    {(form.getFieldValue('locations') || []).map((loc: any, index: number) => (
                      <DeletableTag
                        key={index}
                        text={loc.name}
                        onDelete={() => handleRemoveLocation(loc.name)}
                        color="primary"
                      />
                    ))}
                  </div>
                  <div className="location-input" onClick={() => setMapVisible(true)}>
                    点击选择地点
                  </div>
                  <MapPicker
                    visible={mapVisible}
                    onClose={() => setMapVisible(false)}
                    onSelect={handleLocationSelect}
                    value={selectedLocations}
                    onChange={handleLocationChange}
                  />
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
            <Form.Item rules={[{ required: true, message: '请输入正文' }]} style={{ padding: 0 }}>
              <ReactQuill
                theme="bubble"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="请输入游记正文"
              />
            </Form.Item>
          </Form.Item>

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
