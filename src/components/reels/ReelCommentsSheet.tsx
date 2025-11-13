'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Reel, Comment } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SendHorizonal,
  Heart,
  MoreHorizontal,
  X,
  MessageCircle,
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReelCommentsSheetProps {
  reel: Reel;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReelCommentsSheet: React.FC<ReelCommentsSheetProps> = ({
  reel,
  isOpen,
  onOpenChange,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchComments = async () => {
      if (isOpen && reel.id) {
        setIsLoading(true);
        try {
          const response = await api.get(`/reels/${reel.id}/comments`);
          setComments(response.data || []);
        } catch (error) {
          console.error('Failed to fetch comments:', error);
          toast.error(t('ReelCommentsSheet.toast.fetchError'));
          setComments([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchComments();
  }, [isOpen, reel.id, t]);

  useEffect(() => {
    if (scrollAreaRef.current && comments.length > 0) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 150);
    }
  }, [comments.length]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsPosting(true);
    try {
      const response = await api.post(`/reels/${reel.id}/comment`, {
        comment: newComment.trim(),
      });
      setComments((prev) => [response.data, ...prev]);
      setNewComment('');
      toast.success(t('ReelCommentsSheet.toast.postSuccess'));
    } catch (error: any) {
      console.error('Failed to post comment:', error);
      toast.error(t('ReelCommentsSheet.toast.postError'), {
        description: error.response?.data?.message || t('ReelCommentsSheet.toast.tryAgain'),
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!user) {
      toast.error(t('ReelCommentsSheet.toast.loginToLike'));
      return;
    }

    const isCurrentlyLiked = likedComments.has(commentId);
    const previousState = new Set(likedComments);

    const updatedLiked = new Set(likedComments);
    if (isCurrentlyLiked) {
      updatedLiked.delete(commentId);
    } else {
      updatedLiked.add(commentId);
    }
    setLikedComments(updatedLiked);

    try {
      if (isCurrentlyLiked) {
        await api.delete(`/comments/${commentId}/like`);
      } else {
        await api.post(`/comments/${commentId}/like`);
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
      toast.error(t('ReelCommentsSheet.toast.likeError'));
      setLikedComments(previousState);
    }
  };

  const handleReportComment = async (commentId: number) => {
    try {
      await api.post(`/comments/${commentId}/report`);
      toast.success(t('ReelCommentsSheet.toast.reportSuccess'));
    } catch (error) {
      console.error('Failed to report comment:', error);
      toast.error(t('ReelCommentsSheet.toast.reportError'));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[65vh] rounded-t-3xl border-0 bg-gray-950 text-white"
      >
        <SheetHeader className="flex-row items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('ReelCommentsSheet.title')}</h2>
              <p className="text-sm text-white/60">
                {t('ReelCommentsSheet.count', { count: comments.length })}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </SheetHeader>

        <ScrollArea className="flex-grow my-4 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4 px-1">
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
              </div>
            )}

            {!isLoading && comments.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-white/60 text-lg mb-2">{t('ReelCommentsSheet.empty.title')}</p>
                <p className="text-white/40 text-sm">{t('ReelCommentsSheet.empty.subtitle')}</p>
              </div>
            )}

            {!isLoading &&
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-3 hover:bg-white/5 rounded-2xl p-3"
                >
                  <Link href={`/models/${comment.userId}`}>
                    <Avatar className="w-10 h-10 border-2 border-white/20 cursor-pointer">
                      <AvatarImage src={comment.userAvatar || ''} alt={comment.userName} />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white font-semibold">
                        {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/models/${comment.userId}`}>
                        <span className="text-white font-semibold text-sm hover:text-primary cursor-pointer">
                          {comment.userName}
                        </span>
                      </Link>
                      <span className="text-white/40 text-xs">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: isArabic ? arSA : undefined,
                        })}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed break-words">
                      {comment.comment}
                    </p>

                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-white/60 hover:text-red-400 hover:bg-transparent"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <Heart
                          className={`w-3 h-3 mr-1 transition-all ${
                            likedComments.has(comment.id)
                              ? 'fill-red-500 text-red-500'
                              : ''
                          }`}
                        />
                        <span className="text-xs">{t('ReelCommentsSheet.actions.like')}</span>
                      </Button>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white/40 hover:bg-white/20 hover:text-white rounded-full"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-gray-900 border-white/20 text-white"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-white/10"
                        onClick={() => navigator.clipboard.writeText(comment.comment)}
                      >
                        {t('ReelCommentsSheet.dropdown.copy')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-white/10 text-red-400"
                        onClick={() => handleReportComment(comment.id)}
                      >
                        {t('ReelCommentsSheet.dropdown.report')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
          </div>
        </ScrollArea>

        <div className="border-t border-white/10 pt-4">
          {user ? (
            <form onSubmit={handlePostComment} className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border-2 border-primary/50">
                <AvatarImage src={user.profile_picture_url || ''} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'Me'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 relative">
                <Input
                  placeholder={t('ReelCommentsSheet.input.placeholder')}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isPosting}
                  className="bg-white/10 border-0 text-white placeholder:text-white/40 rounded-2xl px-4 py-6 pr-12 focus:bg-white/15"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isPosting || !newComment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90 rounded-full"
                >
                  {isPosting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <SendHorizonal className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-white/60 text-sm mb-3">{t('ReelCommentsSheet.loginPrompt')}</p>
              <div className="flex gap-3 justify-center">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full"
                  >
                    {t('ReelCommentsSheet.actions.login')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-full">
                    {t('ReelCommentsSheet.actions.signup')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};