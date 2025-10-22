// src/context/SocketContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (token) {
      // إنشاء اتصال جديد عند تسجيل الدخول
      // قم بإزالة /api من العنوان
    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
    const newSocket = io(socketUrl);
      
      newSocket.on('connect', () => {
        // إرسال التوكن للمصادقة
        newSocket.emit('authenticate', token);
      });

      setSocket(newSocket);

      // قطع الاتصال عند تسجيل الخروج
      return () => {
        newSocket.disconnect();
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};