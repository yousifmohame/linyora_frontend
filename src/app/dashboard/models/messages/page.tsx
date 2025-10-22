'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../../lib/axios';
import { useAuth } from '../../../../context/AuthContext';
import { useSocket } from '../../../../context/SocketContext';
import { Card } from '../../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
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
import Link from 'next/link';
import ModelNav from '@/components/dashboards/ModelNav';
import ActiveConversationLoader from './ActiveConversationLoader';
import { withSubscription } from '@/components/auth/withSubscription';

// --- أنواع البيانات ---
export interface Conversation {
  id: number;
  participantId: number;
  participantName: string;
  participantAvatar: string | null;
  lastMessage: string | null;
  is_online: boolean;
  last_seen: string | null;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const selectConversation = useCallback((convo: Conversation) => {
    setActiveConversation(convo);
    setShowConversations(false);
    setLoadingMessages(true);
    api
      .get(`/messages/${convo.id}`)
      .then((res) => setMessages(res.data))
      .catch((err) =>
        console.error(`Failed to fetch messages for convo ${convo.id}`, err)
      )
      .finally(() => setLoadingMessages(false));

    if (socket) {
      socket.emit('markAsRead', { conversationId: convo.id });
    }
  }, [socket]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/messages');
      const fetchedConversations: Conversation[] = res.data;
      setConversations(fetchedConversations);
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

  return (
    <div className="min-h-screen flex flex-col p-2 sm:p-4 md:p-6">
      <ModelNav />
      
      {/* العنوان */}
      <div className="flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          {t('MessagesPage.title')}
        </h1>

        {activeConversation && !showConversations && (
          <div className="lg:hidden mb-4">
            <Button variant="outline" size="sm" onClick={toggleConversations}>
              <Menu className="w-4 h-4 ml-1" />
              {t('MessagesPage.conversations')}
            </Button>
          </div>
        )}
      </div>

      {/* ✅ Critical Fix: Wrap loader in Suspense */}
      <Suspense fallback={null}>
        <ActiveConversationLoader
          conversations={conversations}
          onSelectConversation={selectConversation}
        />
      </Suspense>

      {/* الحاوية الرئيسية للمحادثات والرسائل */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Conversations List */}
        <Card
          className={`lg:col-span-1 flex flex-col transition-all duration-300 ${
            showConversations ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="p-3 sm:p-4 border-b font-semibold flex-shrink-0">
            {t('MessagesPage.conversations')}
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {loadingConversations ? (
              <p className="p-4 text-sm text-gray-500">
                {t('MessagesPage.loadingConversations')}
              </p>
            ) : conversations.length > 0 ? (
              conversations.map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => selectConversation(convo)}
                  className={`flex items-center p-3 m-2 rounded-lg cursor-pointer transition-colors ${
                    activeConversation?.id === convo.id
                      ? 'bg-purple-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Avatar className="w-9 h-9 sm:w-10 sm:h-10 relative">
                    <AvatarImage src={convo.participantAvatar || undefined} />
                    <AvatarFallback>{convo.participantName.charAt(0)}</AvatarFallback>
                    {convo.is_online && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </Avatar>
                  <div className="mr-3 overflow-hidden">
                    <p className="font-semibold text-sm truncate">{convo.participantName}</p>
                    {convo.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">{convo.lastMessage}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-gray-500">
                {t('MessagesPage.noConversations')}
              </p>
            )}
          </div>
        </Card>

        {/* Chat Window */}
        <Card
          className={`lg:col-span-3 flex flex-col ${
            !showConversations && 'lg:col-span-4'
          }`}
        >
          {activeConversation ? (
            <>
              {/* رأس المحادثة */}
              <div className="p-3 sm:p-4 border-b flex items-center justify-between flex-shrink-0">
                <div className="flex items-center">
                  <Avatar className="w-9 h-9 sm:w-10 sm:h-10 relative">
                    <AvatarImage src={activeConversation.participantAvatar || undefined} />
                    <AvatarFallback>{activeConversation.participantName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="mr-3">
                    <p className="font-bold text-sm sm:text-base">
                      {activeConversation.participantName}
                    </p>
                    <p className="text-xs text-gray-500">
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
                  className="lg:hidden"
                  onClick={() => setShowConversations(true)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* منطقة الرسائل */}
              <div className="flex-1 p-3 sm:p-4 bg-gray-50 overflow-y-auto min-h-0">
                {loadingMessages ? (
                  <p className="text-center text-gray-500">
                    {t('MessagesPage.loadingMessages')}
                  </p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${
                          msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] px-3 sm:px-4 py-2 rounded-2xl ${
                            msg.sender_id === user?.id
                              ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-br-none'
                              : 'bg-white border rounded-bl-none'
                          }`}
                        >
                          {msg.body && <p className="text-sm">{msg.body}</p>}
                          {msg.attachment_url && (
                            msg.attachment_type === 'image' ? (
                              <Link
                                href={msg.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={msg.attachment_url}
                                  alt={t('MessagesPage.attachmentImageAlt')}
                                  className="rounded-lg mt-2 max-w-[200px] sm:max-w-xs cursor-pointer"
                                />
                              </Link>
                            ) : (
                              <Link
                                href={msg.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 mt-2 underline"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">
                                  {t('MessagesPage.attachmentFile')}
                                </span>
                              </Link>
                            )
                          )}
                        </div>
                        {msg.sender_id === user?.id &&
                          (msg.is_read ? (
                            <CheckCheck className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                          ) : (
                            <Check className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          ))}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* نموذج إرسال الرسالة */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(newMessage);
                }}
                className="p-3 sm:p-4 border-t flex gap-2 bg-white flex-shrink-0"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
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
                  className="h-10 sm:h-12 rounded-full text-sm sm:text-base"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 flex-shrink-0"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <MessageSquare className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" />
              <p className="font-semibold text-sm sm:text-base">
                {t('MessagesPage.selectConversation')}
              </p>
              <p className="text-xs sm:text-sm">
                {t('MessagesPage.selectConversationHint')}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default withSubscription(MessagesPage);