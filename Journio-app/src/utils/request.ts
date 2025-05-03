import { Toast } from 'antd-mobile';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api',
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
      Toast.show({
        content: res.message || '请求失败',
        position: 'top',
      });
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      Toast.show({
        content: '登录已过期，请重新登录',
        position: 'top',
      });
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    Toast.show({
      content: error.message || '请求失败',
      position: 'top',
    });
    return Promise.reject(error);
  },
);

export default service;
