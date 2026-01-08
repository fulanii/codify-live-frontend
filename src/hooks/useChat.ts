import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useRef } from "react";
import type { MessageData } from "@/types/api";
import notificationSound from "@/assets/ring.mp3";

// Audio instance for notification
let audioInstance: HTMLAudioElement | null = null;

// Track recently sent messages to prevent notification sound
const recentlySentMessages = new Set<string>();

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

// Mark a message as sent by the current user
export const markMessageAsSent = (messageId: string) => {
  recentlySentMessages.add(messageId);
  // Clean up after 5 seconds
  setTimeout(() => {
    recentlySentMessages.delete(messageId);
  }, 5000);
};

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: chatApi.getConversations,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for updates
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => chatApi.getMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes - rely on realtime for updates
    refetchOnWindowFocus: true, // Only refetch when user returns to tab
  });
}

export function useConversationParticipant(conversationId: string | null) {
  return useQuery({
    queryKey: ["conversation", "participant", conversationId],
    queryFn: () => chatApi.getParticipantInfo(conversationId!),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateOrGetConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (receiverId: string) =>
      chatApi.getOrCreateDirectConversation(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start conversation",
        description: error.message,
        variant: "destructive",
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
      if (!conversationId) throw new Error("No conversation selected");
      if (pendingRef.current) throw new Error("Message already sending");

      pendingRef.current = true;
      return chatApi.sendMessage(conversationId, content);
    },
    onMutate: async (content) => {
      if (!conversationId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["messages", conversationId],
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData([
        "messages",
        conversationId,
      ]);

      // Optimistically update the messages
      queryClient.setQueryData(
        ["messages", conversationId],
        (old: { messages: MessageData[] } | undefined) => {
          const optimisticMessage: MessageData = {
            id: `temp-${Date.now()}`,
            sender_id: "me",
            sender_username: "You",
            content,
            created_at: new Date().toISOString(),
          };
          return {
            messages: [...(old?.messages || []), optimisticMessage],
          };
        }
      );

      return { previousMessages, optimisticContent: content };
    },
    onSuccess: (response, _content, context) => {
      if (!conversationId || !response?.response_data) return;

      // Mark the sent message(s) so we don't play notification sound for them
      response.response_data.forEach((msg) => {
        markMessageAsSent(msg.id);
      });

      // Replace optimistic message with real message(s) immediately
      // This ensures the message appears even if realtime subscription has a delay
      queryClient.setQueryData(
        ["messages", conversationId],
        (old: { messages: MessageData[] } | undefined) => {
          if (!old) {
            // If no old data, create new structure with the real messages
            const messages = response.response_data.map((realMsg) => ({
              id: realMsg.id,
              sender_id: realMsg.sender_id,
              sender_username: "You",
              content: realMsg.content,
              created_at: realMsg.created_at,
            }));
            return { messages };
          }

          const newMessages = [...old.messages];

          // For each message in the response, replace the optimistic one
          response.response_data.forEach((realMsg) => {
            const messageData: MessageData = {
              id: realMsg.id,
              sender_id: realMsg.sender_id,
              sender_username: "You", // Will be updated by realtime if needed
              content: realMsg.content,
              created_at: realMsg.created_at,
            };

            // Find and replace the optimistic message with matching content
            const optimisticIndex = newMessages.findIndex(
              (msg) =>
                msg.id.startsWith("temp-") && msg.content === realMsg.content
            );

            if (optimisticIndex !== -1) {
              // Replace the optimistic message
              newMessages[optimisticIndex] = messageData;
            } else {
              // If no optimistic message found, check if real message already exists
              const exists = newMessages.some((msg) => msg.id === realMsg.id);
              if (!exists) {
                newMessages.push(messageData);
              }
            }
          });

          return { messages: newMessages };
        }
      );
    },
    onError: (error: Error, _content, context) => {
      // Rollback optimistic update
      if (context?.previousMessages && conversationId) {
        queryClient.setQueryData(
          ["messages", conversationId],
          context.previousMessages
        );
      }
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      pendingRef.current = false;
      if (conversationId) {
        // Only invalidate conversations to update the preview, messages are handled by realtime subscription
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });
}

export function useNewMessageNotification() {
  const previousMessagesRef = useRef<Map<string, string>>(new Map());

  const checkForNewMessages = useCallback(
    (
      conversationId: string,
      messages: MessageData[],
      currentUserId: string
    ) => {
      if (!messages.length || !currentUserId) return;

      const lastMessage = messages[messages.length - 1];
      const previousLastId = previousMessagesRef.current.get(conversationId);

      // Skip if this is the same message we already processed
      if (lastMessage.id === previousLastId) return;

      // Skip if this is an optimistic message (temp-*)
      if (lastMessage.id.startsWith("temp-")) {
        previousMessagesRef.current.set(conversationId, lastMessage.id);
        return;
      }

      // Skip if this message was recently sent by the current user
      if (recentlySentMessages.has(lastMessage.id)) {
        previousMessagesRef.current.set(conversationId, lastMessage.id);
        return;
      }

      // Only play sound if:
      // 1. There was a previous message (not the first message)
      // 2. The message ID changed (new message)
      // 3. The sender is NOT the current user (check both 'me' and actual user ID)
      // 4. The message is not a recently sent one
      if (
        previousLastId &&
        lastMessage.id !== previousLastId &&
        lastMessage.sender_id !== currentUserId &&
        lastMessage.sender_id !== "me"
      ) {
        playNotificationSound();
      }

      previousMessagesRef.current.set(conversationId, lastMessage.id);
    },
    []
  );

  return { checkForNewMessages, playNotificationSound };
}
