import React from 'react';
import { Card, Row, Col, DatePicker } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

const data = [
  { date: '2025-04-30', newUsers: 30, newNotes: 50, visits: 1000 },
  { date: '2025-05-01', newUsers: 40, newNotes: 60, visits: 1100 },
  // ... more data ...
];

const StatisticPage: React.FC = () => {
  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card title="总用户数" bordered={false}>
            <p>1,254</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="总笔记数" bordered={false}>
            <p>3,872</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="总浏览量" bordered={false}>
            <p>58,961</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="总举报数" bordered={false}>
            <p>125</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="待审核笔记" bordered={false}>
            <p>37</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="待处理举报" bordered={false}>
            <p>12</p>
          </Card>
        </Col>
      </Row>

      <Card title="每日统计" style={{ marginTop: 16 }}>
        <BarChart width={600} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="newUsers" fill="#8884d8" />
          <Bar dataKey="newNotes" fill="#82ca9d" />
          <Line type="monotone" dataKey="visits" stroke="#ffc658" />
        </BarChart>
      </Card>
    </div>
  );
};

export default StatisticPage;
