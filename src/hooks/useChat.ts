import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useRef } from 'react';
import type { MessageData } from '@/types/api';
import notificationSound from '@/assets/ring.mp3';

// Audio instance for notification
let audioInstance: HTMLAudioElement | null = null;

const playNotificationSound = () => {
  try {
    if (!audioInstance) {
      audioInstance = new Audio(notificationSound);
      audioInstance.volume = 0.5;
    }
    audioInstance.currentTime = 0;
    audioInstance.play().catch(() => {
      // Ignore autoplay errors
    });
  } catch {
    // Ignore audio errors
  }
};

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for updates
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatApi.getMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
  });
}

export function useConversationParticipant(conversationId: string | null) {
  return useQuery({
    queryKey: ['conversation', 'participant', conversationId],
    queryFn: () => chatApi.getParticipantInfo(conversationId!),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateOrGetConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (receiverId: string) => chatApi.getOrCreateDirectConversation(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to start conversation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSendMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const pendingRef = useRef(false);

  return useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) throw new Error('No conversation selected');
      if (pendingRef.current) throw new Error('Message already sending');
      
      pendingRef.current = true;
      return chatApi.sendMessage(conversationId, content);
    },
    onMutate: async (content) => {
      if (!conversationId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['messages', conversationId]);

      // Optimistically update the messages
      queryClient.setQueryData(['messages', conversationId], (old: { messages: MessageData[] } | undefined) => {
        const optimisticMessage: MessageData = {
          id: `temp-${Date.now()}`,
          sender_id: 'me',
          sender_username: 'You',
          content,
          created_at: new Date().toISOString(),
        };
        return {
          messages: [...(old?.messages || []), optimisticMessage],
        };
      });

      return { previousMessages };
    },
    onError: (error: Error, _content, context) => {
      // Rollback optimistic update
      if (context?.previousMessages && conversationId) {
        queryClient.setQueryData(['messages', conversationId], context.previousMessages);
      }
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      pendingRef.current = false;
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });
}

export function useNewMessageNotification() {
  const previousMessagesRef = useRef<Map<string, string>>(new Map());

  const checkForNewMessages = useCallback((conversationId: string, messages: MessageData[], currentUserId: string) => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];
    const previousLastId = previousMessagesRef.current.get(conversationId);

    if (previousLastId && lastMessage.id !== previousLastId && lastMessage.sender_id !== currentUserId) {
      playNotificationSound();
    }

    previousMessagesRef.current.set(conversationId, lastMessage.id);
  }, []);

  return { checkForNewMessages, playNotificationSound };
}
