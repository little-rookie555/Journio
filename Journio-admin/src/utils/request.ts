import { message } from 'antd';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  // baseURL: 'http://localhost:5107/api',
  timeout: 10000,
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    if (res.code !== 200) {
      message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
  },
  (error) => {
    if (error.response?.status === 401) {
      message.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    message.error(error.message || '请求失败');
    return Promise.reject(error);
  },
);

export default service;
