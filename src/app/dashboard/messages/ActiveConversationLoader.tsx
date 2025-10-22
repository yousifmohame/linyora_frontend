'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Conversation } from './page';

export default function ActiveConversationLoader({
  conversations,
  onSelectConversation,
}: {
  conversations: Conversation[];
  onSelectConversation: (convo: Conversation) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const activeId = searchParams.get('active');
    if (activeId) {
      const convoToOpen = conversations.find(c => c.id === Number(activeId));
      if (convoToOpen) {
        onSelectConversation(convoToOpen);
      }
    }
  }, [searchParams, conversations, onSelectConversation]);

  return null; // No UI — only side effect
}