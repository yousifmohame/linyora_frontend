// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '@/lib/axios';
import Cookies from 'js-cookie';

// ================== Interface Definitions ==================
export interface SubscriptionState {
  status: 'active' | 'inactive' | 'loading';
  plan: {
    name: string;
    description: string;
    price: number;
    features: string[];
  } | null;
  permissions: {
    hasDropshippingAccess: boolean;
  };
  endDate?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile_picture_url: string;
  role_id: number;
  verification_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  has_accepted_agreement: boolean;
  subscription: SubscriptionState;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

// --- ✅ الجزء المُعدل: لكسر الحلقة الدائرية ---
// 1. إنشاء دالة وهمية لتسجيل الخروج
let globalLogout = () => {
  console.error("Logout function has not been initialized yet.");
};

// 2. إنشاء دالة "setter" لتحديث الدالة الوهمية بالدالة الحقيقية لاحقًا
export const setGlobalLogout = (logoutFunc: () => void) => {
  globalLogout = logoutFunc;
};

// 3. تصدير الدالة الوهمية ليستخدمها axios
export { globalLogout };
// --- نهاية الجزء المُعدل ---


const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ================== Auth Provider Component ==================
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    Cookies.remove('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    // Redirection can be handled here or in components
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
  }, []);

  // --- ✅ الجزء المُعدل: ربط الدالة الحقيقية ---
  // 4. استخدام useEffect لمرة واحدة لتحديث الدالة العالمية بالدالة الحقيقية
  useEffect(() => {
    setGlobalLogout(logout);
  }, [logout]);
  // --- نهاية الجزء المُعدل ---

  const loadUserData = useCallback(async (currentToken: string) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      
      const [userResponse, subResponse] = await Promise.all([
        api.get('/users/profile'),
        api.get('/subscriptions/status').catch(() => ({ 
          data: { 
            status: 'inactive', 
            plan: null, 
            permissions: { hasDropshippingAccess: false } 
          } as SubscriptionState
        })) 
      ]);
      
      const fullUserData: User = {
        ...userResponse.data,
        subscription: subResponse.data,
      };
      
      setUser(fullUserData);

    } catch (error) {
      console.error("⚠️ Failed to fetch user data, logging out.", error);
      logout();
    }
  }, [logout]); // أضفنا logout هنا

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      if (token) {
        await loadUserData(token);
      }
      setLoading(false);
    };
    initializeAuth();
  }, [token, loadUserData]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    Cookies.set('token', newToken, { expires: 7 });
    setToken(newToken);
  };

  const refetchUser = async () => {
    if (token) {
      setLoading(true);
      await loadUserData(token);
      setLoading(false);
    }
  };

  const contextValue = { user, token, loading, login, logout, refetchUser };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ================== Custom Hook ==================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};