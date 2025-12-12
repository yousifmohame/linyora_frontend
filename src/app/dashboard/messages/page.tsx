'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../lib/axios';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { Card } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import {
  Send,
  MessageSquare,
  Paperclip,
  Check,
  CheckCheck,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import Navigation from '../../../components/dashboards/Navigation';
import Link from 'next/link';
import ActiveConversationLoader from './ActiveConversationLoader';
import { withSubscription } from '@/components/auth/withSubscription';

// --- Types ---
export interface Conversation {
  id: number;
  participantId: number;
  participantName: string | null;
  participantAvatar: string | null;
  lastMessage: string | null;
  is_online: boolean;
  last_seen: string | null;
  unread_count: number;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  is_read: boolean;
  created_at: string;
}

function MessagesPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const socket = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showConversations, setShowConversations] = useState(true);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  const selectConversation = useCallback((convo: Conversation) => {
    setActiveConversation(convo);
    setShowConversations(false);
    setLoadingMessages(true);
    api
      .get(`/messages/${convo.id}`)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => console.error(`Failed to fetch messages for convo ${convo.id}`, err))
      .finally(() => setLoadingMessages(false));

    if (socket) {
      socket.emit('markAsRead', { conversationId: convo.id });
    }
  }, [socket]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/messages');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === newMessage.conversation_id
            ? { ...c, lastMessage: newMessage.body || t('MessagesPage.attachment') }
            : c
        )
      );
      if (newMessage.conversation_id === activeConversation?.id) {
        setMessages((prev) => [...prev, newMessage]);
        socket.emit('markAsRead', { conversationId: newMessage.conversation_id });
      }
    };

    const handleMessagesRead = ({ conversationId }: { conversationId: number }) => {
      if (activeConversation?.id === conversationId) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, is_read: true })));
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messagesRead', handleMessagesRead);
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, activeConversation, t]);

  const handleSendMessage = async (
    body: string | null,
    attachment_url: string | null = null,
    attachment_type: string | null = null
  ) => {
    if ((!body || !body.trim()) && !attachment_url) return;
    if (!activeConversation) return;

    const tempId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender_id: user!.id,
        body,
        attachment_url,
        attachment_type,
        is_read: false,
        created_at: new Date().toISOString(),
        conversation_id: activeConversation.id,
      },
    ]);

    if (body) setNewMessage('');

    try {
      await api.post('/messages', {
        receiverId: activeConversation.participantId,
        body,
        attachment_url,
        attachment_type,
      });
    } catch (error) {
      console.error('Failed to send message', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      alert(t('MessagesPage.sendMessageFailed'));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !activeConversation) return;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const uploadRes = await api.post('/upload/attachment', formData);
      const { attachment_url, attachment_type } = uploadRes.data;
      await handleSendMessage(null, attachment_url, attachment_type);
    } catch (error) {
      alert(t('MessagesPage.fileUploadFailed'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleConversations = () => {
    setShowConversations(!showConversations);
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return t('MessagesPage.lastSeen.unknown');
    const date = new Date(lastSeen);
    return date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US');
  };

  const getInitials = (name: string | null): string => {
    if (!name) return '?';
    const cleanName = name.trim();
    return cleanName.length > 0 ? cleanName.charAt(0).toUpperCase() : '?';
  };

  return (
    // ✅ Unified gradient background
    <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
      <Navigation />

      <div className="flex-1 flex flex-col max-w-7xl mx-auto">
        {/* ✅ Header with gradient */}
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {t('MessagesPage.title')}
        </h1>

        {activeConversation && !showConversations && (
          <div className="lg:hidden mb-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleConversations}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs h-8"
            >
              <Menu className="w-3.5 h-3.5 mr-1" />
              {t('MessagesPage.conversations')}
            </Button>
          </div>
        )}

        <Suspense fallback={null}>
          <ActiveConversationLoader
            conversations={conversations}
            onSelectConversation={selectConversation}
          />
        </Suspense>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Conversations List */}
          <Card
            className={`lg:col-span-1 flex flex-col transition-all duration-300 ${
              showConversations ? 'block' : 'hidden lg:block'
            } bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50`}
          >
            <div className="p-3 border-b border-gray-200/50 font-semibold text-gray-800 text-sm flex-shrink-0">
              {t('MessagesPage.conversations')}
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 p-1">
              {loadingConversations ? (
                <p className="p-4 text-xs text-gray-500">{t('MessagesPage.loadingConversations')}</p>
              ) : conversations.length > 0 ? (
                conversations.map((convo) => (
                  <div
                    key={convo.id}
                    onClick={() => selectConversation(convo)}
                    className={`flex items-center p-2.5 m-1.5 rounded-xl cursor-pointer transition-colors ${
                      activeConversation?.id === convo.id 
                        ? 'bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-200' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={convo.participantAvatar || undefined} />
                        <AvatarFallback className="text-xs">{getInitials(convo.participantName)}</AvatarFallback>
                      </Avatar>
                      {convo.is_online && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                      )}
                      {convo.unread_count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                          {convo.unread_count > 99 ? '99+' : convo.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="mr-2.5 overflow-hidden min-w-0">
                      <p className="font-medium text-sm truncate text-gray-900">
                        {convo.participantName || t('MessagesPage.unknownUser')}
                      </p>
                      {convo.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{convo.lastMessage}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-xs text-gray-500">
                  {t('MessagesPage.noConversations')}
                </p>
              )}
            </div>
          </Card>

          {/* Chat Window */}
          <Card
            className={`lg:col-span-3 flex flex-col bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 ${
              !showConversations && 'lg:col-span-4'
            }`}
          >
            {activeConversation ? (
              <>
                <div className="p-3 border-b border-gray-200/50 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activeConversation.participantAvatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(activeConversation.participantName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="mr-2.5">
                      <p className="font-bold text-sm text-gray-900">
                        {activeConversation.participantName || t('MessagesPage.unknownUser')}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {activeConversation.is_online
                          ? t('MessagesPage.online')
                          : `${t('MessagesPage.lastSeen.label')}: ${formatLastSeen(
                              activeConversation.last_seen
                            )}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-7 w-7"
                    onClick={() => setShowConversations(true)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div
                  ref={messagesContainerRef}
                  className="flex-1 p-3 bg-gray-50/30 overflow-y-auto min-h-0 rounded-b-2xl"
                >
                  {loadingMessages ? (
                    <p className="text-center text-gray-500 text-xs">{t('MessagesPage.loadingMessages')}</p>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageSquare className="w-8 h-8 opacity-50 mb-2" />
                      <p className="text-xs">{t('MessagesPage.noMessages')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-1.5 ${
                            msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] px-3 py-1.5 rounded-xl ${
                              msg.sender_id === user?.id
                                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-br-md'
                                : 'bg-white border border-gray-200 rounded-bl-md'
                            }`}
                          >
                            {msg.body && <p className="text-xs break-words">{msg.body}</p>}
                            {msg.attachment_url &&
                              (msg.attachment_type === 'image' ? (
                                <Link
                                  href={msg.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={msg.attachment_url}
                                    alt={t('MessagesPage.attachmentImageAlt')}
                                    className="rounded mt-1.5 max-w-[180px] cursor-pointer"
                                  />
                                </Link>
                              ) : (
                                <Link
                                  href={msg.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 mt-1.5 underline"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span className="text-xs">
                                    {t('MessagesPage.attachmentFile')}
                                  </span>
                                </Link>
                              ))}
                          </div>
                          {msg.sender_id === user?.id &&
                            (msg.is_read ? (
                              <CheckCheck className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(newMessage);
                  }}
                  className="p-3 border-t border-gray-200/50 flex gap-2 bg-white flex-shrink-0 rounded-b-2xl"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('MessagesPage.messagePlaceholder')}
                    className="h-9 rounded-full text-xs flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 flex-shrink-0"
                    disabled={!newMessage.trim() && !isUploading}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
                <p className="font-medium text-gray-700 text-sm mb-1">
                  {t('MessagesPage.selectConversation')}
                </p>
                <p className="text-xs">{t('MessagesPage.selectConversationHint')}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withSubscription(MessagesPage);