import { Toast } from 'antd-mobile';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  // baseURL: 'http://localhost:5107/api',
  timeout: 10000,
});

// async function determineBaseURL() {
//   try {
//     const testURL = 'http://localhost:5107/api/travel/list';
//     await axios.get(testURL, { timeout: 2000 });
//     return 'http://localhost:5107/api';
//   } catch (error) {
//     return '/api';
//   }
// }

console.log('baseURL', service);

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    console.log('Current token:', token); // 添加调试日志
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
    return res;
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
