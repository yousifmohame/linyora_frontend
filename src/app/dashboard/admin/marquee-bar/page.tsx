'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Trash2, Plus, MessageSquare, Sparkles, Eye, EyeOff, Minus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminNav from '@/components/dashboards/AdminNav';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface MarqueeMessage {
  id: number;
  message_text: string;
  is_active: boolean;
}

export default function MarqueeBarPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<MarqueeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingMessage, setAddingMessage] = useState(false);
  const [speed, setSpeed] = useState(20);
  const [isSpeedSaving, setIsSpeedSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [msgRes, speedRes] = await Promise.all([
        api.get('/admin/marquee'),
        api.get('/admin/marquee/settings/marquee_speed')
      ]);
      setMessages(msgRes.data);
      setSpeed(parseInt(speedRes.data, 10) || 20);
    } catch (error) {
      toast.error(t('MarqueeBarPage.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMessage = async () => {
    if (!newMessage.trim()) {
      toast.error(t('MarqueeBarPage.toast.emptyMessage'));
      return;
    }
    if (newMessage.length > 200) {
      toast.error(t('MarqueeBarPage.toast.tooLong'));
      return;
    }

    setAddingMessage(true);
    try {
      const res = await api.post('/admin/marquee', { message_text: newMessage });
      setMessages([res.data, ...messages]);
      setNewMessage('');
      toast.success(t('MarqueeBarPage.toast.addSuccess'));
    } catch (error) {
      toast.error(t('MarqueeBarPage.toast.addError'));
    } finally {
      setAddingMessage(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await api.put(`/admin/marquee/${id}`, { is_active: !currentStatus });
      setMessages(messages.map(msg => (msg.id === id ? res.data : msg)));
      toast.success(t('MarqueeBarPage.toast.statusUpdated', { status: !currentStatus ? t('common.active') : t('common.inactive') }));
    } catch (error) {
      toast.error(t('MarqueeBarPage.toast.updateError'));
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm(t('MarqueeBarPage.confirm.delete'))) return;
    try {
      await api.delete(`/admin/marquee/${id}`);
      setMessages(messages.filter(msg => msg.id !== id));
      toast.success(t('MarqueeBarPage.toast.deleteSuccess'));
    } catch (error) {
      toast.error(t('MarqueeBarPage.toast.deleteError'));
    }
  };

  const handleSpeedChange = async (delta: number) => {
    const newSpeed = Math.max(5, speed + delta);
    setSpeed(newSpeed);
    setIsSpeedSaving(true);

    try {
      await api.put('/admin/marquee/settings/marquee_speed', { value: newSpeed.toString() });
      toast.success(t('MarqueeBarPage.toast.speedUpdated', { speed: newSpeed }));
    } catch (error) {
      toast.error(t('MarqueeBarPage.toast.speedUpdateError'));
      setSpeed(newSpeed - delta);
    } finally {
      setIsSpeedSaving(false);
    }
  };

  const activeMessagesCount = messages.filter(msg => msg.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <AdminNav />

      {/* Header Section */}
      <header className="mb-8 text-center relative">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('MarqueeBarPage.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('MarqueeBarPage.subtitle')}
        </p>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 rounded-2xl text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-rose-600 mb-1">{messages.length}</div>
              <div className="text-rose-700 text-sm">{t('MarqueeBarPage.stats.total')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 rounded-2xl text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600 mb-1">{activeMessagesCount}</div>
              <div className="text-rose-700 text-sm">{t('MarqueeBarPage.stats.active')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 rounded-2xl text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-amber-600 mb-1">{messages.length - activeMessagesCount}</div>
              <div className="text-rose-700 text-sm">{t('MarqueeBarPage.stats.inactive')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Speed Control Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              {t('MarqueeBarPage.speedCard.title')}
            </CardTitle>
            <CardDescription className="text-indigo-100">
              {t('MarqueeBarPage.speedCard.subtitle', 'Control the duration of the scroll (in seconds). Lower is faster.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSpeedChange(1)}
                disabled={isSpeedSaving}
                className="rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <div className="text-3xl font-bold w-20 text-center relative text-indigo-700">
                {isSpeedSaving && (
                  <Loader2 className="h-6 w-6 animate-spin absolute top-1 left-1/2 -ml-3 text-indigo-500" />
                )}
                <span className={isSpeedSaving ? 'opacity-20' : ''}>
                  {speed}s
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSpeedChange(-1)}
                disabled={isSpeedSaving || speed <= 5}
                className="rounded-xl"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-sm text-indigo-600 mt-3">
              {t('MarqueeBarPage.speedCard.hint', 'Recommended: 15-30 seconds. Minimum: 5 seconds.')}
            </p>
          </CardContent>
        </Card>

        {/* Add Message Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <Plus className="h-5 w-5 text-pink-200" />
              {t('MarqueeBarPage.addCard.title')}
            </CardTitle>
            <CardDescription className="text-pink-100">
              {t('MarqueeBarPage.addCard.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('MarqueeBarPage.addCard.placeholder')}
                  className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-2xl h-12"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddMessage();
                  }}
                />
                <p className="text-rose-600 text-xs mt-2">
                  {newMessage.length}/200 • {t('MarqueeBarPage.addCard.hint')}
                </p>
              </div>
              <Button 
                onClick={handleAddMessage} 
                disabled={addingMessage || !newMessage.trim()}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg rounded-2xl h-12 px-6 font-bold min-w-[120px]"
              >
                {addingMessage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('MarqueeBarPage.addCard.adding')}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('MarqueeBarPage.addCard.add')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages List Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-pink-200" />
                  {t('MarqueeBarPage.listCard.title')}
                </CardTitle>
                <CardDescription className="text-pink-100">
                  {t('MarqueeBarPage.listCard.subtitle', { count: messages.length })}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {t('MarqueeBarPage.listCard.activeBadge', { count: activeMessagesCount })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 bg-rose-100 w-3/4" />
                      <Skeleton className="h-3 bg-rose-100 w-1/4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-12 bg-rose-100 rounded-full" />
                      <Skeleton className="h-9 w-9 bg-rose-100 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-rose-300 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-rose-800 mb-2">{t('MarqueeBarPage.listCard.empty.title')}</h3>
                <p className="text-rose-600 mb-6 max-w-md mx-auto">
                  {t('MarqueeBarPage.listCard.empty.subtitle')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all ${
                      msg.is_active 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-rose-900 text-lg">{msg.message_text}</p>
                        {msg.is_active && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Eye className="h-3 w-3 mr-1" />
                            {t('common.active')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-rose-600">
                        <span>ID: {msg.id}</span>
                        <span>•</span>
                        <span>{t('MarqueeBarPage.listCard.chars', { count: msg.message_text.length })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {msg.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-amber-600" />
                        )}
                        <Switch
                          checked={!!msg.is_active}
                          onCheckedChange={() => handleToggleActive(msg.id, !!msg.is_active)}
                          className="data-[state=checked]:bg-rose-500"
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Best Practices Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">{t('MarqueeBarPage.bestPractices.title')}</h3>
                <ul className="text-amber-800 text-sm space-y-1">
                  <li>• {t('MarqueeBarPage.bestPractices.bullet1')}</li>
                  <li>• {t('MarqueeBarPage.bestPractices.bullet2')}</li>
                  <li>• {t('MarqueeBarPage.bestPractices.bullet3')}</li>
                  <li>• {t('MarqueeBarPage.bestPractices.bullet4')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}