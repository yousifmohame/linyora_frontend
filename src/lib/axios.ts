// src/lib/axios.ts
import axios from 'axios';
import { globalLogout } from '@/context/AuthContext'; // <-- استيراد الدالة الجديدة

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // إذا كان الخطأ 401 (غير مصرح به)، قم بتسجيل الخروج
    if (error.response && error.response.status === 401) {
      // ✅ استدعاء الدالة العالمية الآمنة
      if (typeof window !== 'undefined') {
        globalLogout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;