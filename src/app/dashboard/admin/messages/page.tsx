'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare, User, Store, ArrowLeft, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { format as formatArabic } from 'date-fns';
import { arSA } from 'date-fns/locale';

import AdminNav from '@/components/dashboards/AdminNav';

interface AdminConversation {
  conversation_id: number;
  updated_at: string;
  merchant_id: number;
  merchant_name: string;
  merchant_avatar: string;
  model_id: number;
  model_name: string;
  model_avatar: string;
  last_message: string;
  unread_count?: number;
}

interface AdminMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string;
  sender_type: 'model' | 'merchant';
  body: string;
  created_at: string;
}

export default function AdminMessagesPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const res = await api.get('/admin/conversations');
        setConversations(res.data);
      } catch (error) {
        console.error('Failed to fetch conversations', error);
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, []);

  const fetchMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true);
      const conversation = conversations.find(c => c.conversation_id === conversationId);
      setSelectedConversation(conversation || null);
      setActiveConversationId(conversationId);
      const res = await api.get(`/admin/conversations/${conversationId}`);
      setMessages(res.data);
      if (isMobile) setShowMessages(true);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleBackToConversations = () => {
    setShowMessages(false);
    setActiveConversationId(null);
    setSelectedConversation(null);
  };

  const filteredConversations = conversations.filter(convo =>
    convo.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    convo.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    convo.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, HH:mm', {
      locale: isArabic ? arSA : undefined
    });
  };

  const showConversationsList = !isMobile || (isMobile && !showMessages);
  const showMessagesPanel = !isMobile || (isMobile && showMessages);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-3 sm:p-4">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <AdminNav />

      <header className="mb-4 sm:mb-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
          {t('AdminMessagesPage.title')}
        </h1>
        <p className="text-rose-700 text-xs sm:text-sm max-w-md mx-auto px-2">
          {t('AdminMessagesPage.subtitle')}
        </p>
      </header>

      <div className="max-w-7xl mx-auto flex-grow flex flex-col">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 flex-grow min-h-0">
          {showConversationsList && (
            <Card className="lg:w-1/3 xl:w-1/4 bg-white/80 backdrop-blur-sm border-rose-200 shadow-md rounded-xl flex flex-col">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-3 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-pink-200" />
                    {t('AdminMessagesPage.conversations.title')}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-1.5 py-0.5">
                    {conversations.length}
                  </Badge>
                </div>
                <CardDescription className="text-pink-100 text-[10px]">
                  {t('AdminMessagesPage.conversations.subtitle')}
                </CardDescription>
              </CardHeader>

              <div className="p-2 sm:p-3 border-b border-rose-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-rose-400" />
                  <Input
                    placeholder={t('AdminMessagesPage.conversations.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs sm:text-sm border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-lg h-8"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 p-2 sm:p-3">
                {loadingConversations ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2">
                        <Skeleton className="h-8 w-8 rounded-full bg-rose-100" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-2.5 bg-rose-100 w-3/4" />
                          <Skeleton className="h-2 bg-rose-100 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-6">
                    <MessageSquare className="h-10 w-10 text-rose-300 mx-auto mb-2" />
                    <h3 className="font-bold text-base text-rose-800 mb-1">
                      {t('AdminMessagesPage.conversations.empty.title')}
                    </h3>
                    <p className="text-rose-600 text-xs px-2">
                      {searchQuery 
                        ? t('AdminMessagesPage.conversations.empty.noResults') 
                        : t('AdminMessagesPage.conversations.empty.noConversations')
                      }
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((convo) => (
                    <div
                      key={convo.conversation_id}
                      className={`p-2.5 rounded-lg cursor-pointer transition-all mb-1.5 ${
                        activeConversationId === convo.conversation_id
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow'
                          : 'bg-white/50 border border-rose-100 hover:border-rose-200 hover:shadow'
                      }`}
                      onClick={() => fetchMessages(convo.conversation_id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-7 w-7 border border-white">
                            <AvatarImage src={convo.model_avatar} alt={convo.model_name} />
                            <AvatarFallback className={`text-[10px] ${
                              activeConversationId === convo.conversation_id 
                                ? 'bg-white text-rose-600' 
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {getInitials(convo.model_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${
                            activeConversationId === convo.conversation_id ? 'bg-white' : 'bg-green-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`font-semibold truncate text-sm ${
                              activeConversationId === convo.conversation_id ? 'text-white' : 'text-rose-900'
                            }`}>
                              {convo.model_name}
                            </h4>
                            {convo.unread_count && convo.unread_count > 0 && (
                              <Badge className={`text-[10px] px-1.5 py-0.5 ${
                                activeConversationId === convo.conversation_id
                                  ? 'bg-white text-rose-600'
                                  : 'bg-rose-500 text-white'
                              }`}>
                                {convo.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className={`text-[10px] truncate ${
                            activeConversationId === convo.conversation_id ? 'text-pink-100' : 'text-rose-600'
                          }`}>
                            <User className="h-2 w-2 inline mr-0.5" />
                            {t('AdminMessagesPage.conversations.withMerchant', { merchant: convo.merchant_name })}
                          </p>
                          <p className={`text-[10px] mt-0.5 truncate ${
                            activeConversationId === convo.conversation_id ? 'text-pink-200' : 'text-rose-500'
                          }`}>
                            {convo.last_message}
                          </p>
                          <div className={`flex items-center gap-0.5 mt-0.5 text-[10px] ${
                            activeConversationId === convo.conversation_id ? 'text-pink-200' : 'text-rose-400'
                          }`}>
                            <Calendar className="h-2 w-2" />
                            {formatDate(convo.updated_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </Card>
          )}

          {showMessagesPanel && (
            <Card className="flex-1 bg-white/80 backdrop-blur-sm border-rose-200 shadow-md rounded-xl flex flex-col min-h-0">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200 rounded-t-xl">
                {selectedConversation ? (
                  <div className="flex items-center gap-2">
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBackToConversations}
                        className="h-7 w-7 text-rose-600 hover:bg-rose-100 rounded-lg"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </Button>
                    )}
                    <Avatar className="h-7 w-7 border border-rose-200 flex-shrink-0">
                      <AvatarImage src={selectedConversation.model_avatar} alt={selectedConversation.model_name} />
                      <AvatarFallback className="bg-rose-100 text-rose-700 text-[10px]">
                        {getInitials(selectedConversation.model_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-rose-900 text-sm flex items-center gap-1 truncate">
                        {selectedConversation.model_name}
                        <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 border-rose-200">
                          {t('AdminMessagesPage.roles.model')}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-rose-600 text-[10px] flex items-center gap-0.5 truncate">
                        <Store className="h-2 w-2 flex-shrink-0" />
                        {t('AdminMessagesPage.conversations.withMerchant', { merchant: selectedConversation.merchant_name })}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-rose-200 text-rose-700 text-[10px] hidden sm:flex px-1.5 py-0.5">
                      <Eye className="h-2 w-2 mr-0.5" />
                      {t('AdminMessagesPage.monitoring')}
                    </Badge>
                  </div>
                ) : (
                  <CardTitle className="text-rose-900 text-sm flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-rose-600" />
                    {t('AdminMessagesPage.messages.selectPrompt')}
                  </CardTitle>
                )}
              </CardHeader>

              <ScrollArea className="flex-1 p-3 min-h-0">
                {loadingMessages ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`flex items-start gap-2 ${i % 2 === 0 ? 'justify-end' : ''}`}>
                        {i % 2 !== 0 && <Skeleton className="h-7 w-7 rounded-full bg-rose-100" />}
                        <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-2/3 bg-pink-100' : 'w-2/3 bg-rose-100'}`} />
                        {i % 2 === 0 && <Skeleton className="h-7 w-7 rounded-full bg-pink-100" />}
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6">
                    <MessageSquare className="h-10 w-10 text-rose-300 mb-2" />
                    <h3 className="font-bold text-base text-rose-800 mb-1">
                      {t('AdminMessagesPage.messages.empty.title')}
                    </h3>
                    <p className="text-rose-600 text-xs max-w-[200px] px-2">
                      {selectedConversation 
                        ? t('AdminMessagesPage.messages.empty.noMessages') 
                        : t('AdminMessagesPage.messages.empty.selectConversation')
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {messages.map((msg) => {
                      const isModel = msg.sender_type === 'model';
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-1.5 ${
                            isModel ? '' : 'flex-row-reverse'
                          }`}
                        >
                          <Avatar className={`h-6 w-6 border-2 flex-shrink-0 ${
                            isModel ? 'border-rose-200' : 'border-pink-200'
                          }`}>
                            <AvatarImage src={msg.sender_avatar} alt={msg.sender_name} />
                            <AvatarFallback className={`text-[10px] ${
                              isModel ? 'bg-rose-100 text-rose-700' : 'bg-pink-100 text-pink-700'
                            }`}>
                              {getInitials(msg.sender_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`p-2.5 rounded-lg max-w-[80%] ${
                            isModel
                              ? 'bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 text-rose-900 rounded-tr-none'
                              : 'bg-gradient-to-l from-pink-500 to-rose-500 text-white shadow rounded-tl-none'
                          }`}>
                            <div className="flex items-center gap-1 mb-1">
                              <p className={`font-semibold text-[10px] ${
                                isModel ? 'text-rose-700' : 'text-white'
                              }`}>
                                {msg.sender_name}
                              </p>
                              <Badge 
                                variant="secondary" 
                                className={`text-[10px] px-1 py-0.5 ${
                                  isModel 
                                    ? 'bg-rose-100 text-rose-700 border-rose-200' 
                                    : 'bg-white/30 text-white border-0'
                                }`}
                              >
                                {isModel 
                                  ? t('AdminMessagesPage.roles.model') 
                                  : t('AdminMessagesPage.roles.merchant')}
                              </Badge>
                            </div>
                            <p className={`text-sm ${isModel ? 'text-rose-900' : 'text-white'}`}>
                              {msg.body}
                            </p>
                            <p className={`text-[10px] mt-1.5 ${
                              isModel ? 'text-rose-500' : 'text-pink-100'
                            }`}>
                              {formatDate(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {selectedConversation && (
                <div className="p-2.5 border-t border-rose-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-b-xl">
                  <div className="flex items-center justify-center gap-1 text-amber-700 text-[10px] text-center">
                    <Eye className="h-2.5 w-2.5" />
                    <span>{t('AdminMessagesPage.monitoring.info')}</span>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}