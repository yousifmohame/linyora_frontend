'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ShoppingBag, 
  Info, 
  AlertCircle, 
  Gift, 
  Clock,
  Check
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Types
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'order' | 'system' | 'promotion' | 'alert';
  is_read: boolean;
  created_at: string;
  link?: string;
}

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // --- Fetch Notifications ---
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      // بيانات وهمية للعرض في حال عدم وجود API جاهز
      // setNotifications(MOCK_NOTIFICATIONS); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- Actions ---
  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success(t('Notifications.allReadSuccess', { defaultValue: 'تم تحديد الكل كمقروء' }));
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success(t('Notifications.deletedSuccess', { defaultValue: 'تم حذف الإشعار' }));
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  // --- Filtering ---
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    return true;
  });

  // --- Helper: Get Icon based on Type ---
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case 'promotion': return <Gift className="w-5 h-5 text-purple-600" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-50 border-blue-100';
      case 'promotion': return 'bg-purple-50 border-purple-100';
      case 'alert': return 'bg-red-50 border-red-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  const isRTL = i18n.language.startsWith('ar');

  if (loading) return <NotificationsSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-600" />
              {t('Notifications.title', { defaultValue: 'الإشعارات' })}
              {notifications.filter(n => !n.is_read).length > 0 && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 px-2 py-0.5 text-xs">
                  {notifications.filter(n => !n.is_read).length} {t('common.new', { defaultValue: 'جديد' })}
                </Badge>
              )}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {t('Notifications.subtitle', { defaultValue: 'تابع آخر التحديثات المتعلقة بحسابك وطلباتك.' })}
            </p>
          </div>
          
          <Button 
            onClick={markAllAsRead} 
            variant="outline" 
            disabled={!notifications.some(n => !n.is_read)}
            className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            {t('Notifications.markAllRead', { defaultValue: 'تحديد الكل كمقروء' })}
          </Button>
        </div>

        {/* Tabs & List */}
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white p-1 rounded-xl border border-gray-100 mb-6 w-full md:w-auto h-auto grid grid-cols-2 md:inline-flex">
            <TabsTrigger 
              value="all" 
              className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 px-6 py-2 transition-all"
            >
              {t('common.all', { defaultValue: 'الكل' })}
            </TabsTrigger>
            <TabsTrigger 
              value="unread" 
              className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 px-6 py-2 transition-all"
            >
              {t('Notifications.unread', { defaultValue: 'غير المقروءة' })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={cn(
                      "group relative border transition-all duration-200 hover:shadow-md overflow-hidden",
                      !notification.is_read ? "bg-white border-purple-100 shadow-sm" : "bg-gray-50/50 border-gray-100 opacity-90"
                    )}
                  >
                    {!notification.is_read && (
                      <div className="absolute top-0 right-0 w-1 h-full bg-purple-500" />
                    )}
                    
                    <CardContent className="p-4 md:p-5">
                      <div className="flex gap-4 items-start">
                        {/* Icon Box */}
                        <div className={cn(
                          "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0",
                          getNotificationColor(notification.type)
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className={cn(
                              "text-sm md:text-base font-semibold",
                              !notification.is_read ? "text-gray-900" : "text-gray-700"
                            )}>
                              {notification.title}
                            </h3>
                            <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(notification.created_at), { 
                                addSuffix: true, 
                                locale: isRTL ? ar : enUS 
                              })}
                            </span>
                          </div>
                          
                          <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-[90%]">
                            {notification.message}
                          </p>

                          {/* Actions Row */}
                          <div className="flex items-center gap-2 mt-3 pt-2">
                            {!notification.is_read && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => markAsRead(notification.id)}
                                className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                {t('Notifications.markRead', { defaultValue: 'تحديد كمقروء' })}
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteNotification(notification.id)}
                              className="h-7 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              {t('common.delete', { defaultValue: 'حذف' })}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t('Notifications.emptyTitle', { defaultValue: 'لا توجد إشعارات' })}
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm">
                    {activeTab === 'unread' 
                      ? t('Notifications.emptyUnread', { defaultValue: 'ليس لديك أي إشعارات غير مقروءة حالياً.' })
                      : t('Notifications.emptyAll', { defaultValue: 'سيتم عرض إشعاراتك وتحديثات الطلبات هنا.' })
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- Skeleton Component ---
const NotificationsSkeleton = () => (
  <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 pb-20">
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
