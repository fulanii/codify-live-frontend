import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import {
  useConversations,
  useMessages,
  useConversationParticipant,
  useSendMessage,
  useCreateOrGetConversation,
  useNewMessageNotification,
  markMessageAsSent,
} from "@/hooks/useChat";
import { UserAvatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import type { ConversationData, MessageData } from "@/types/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

const ChatTab: React.FC = () => {
  const { user } = useAuth();
  const { pendingConversationId, setPendingConversationId } = useNavigation();
  const isMobile = useIsMobile();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [showConversationList, setShowConversationList] = useState(true);

  const { data: conversationsData, isLoading: isLoadingConversations } =
    useConversations();
  const conversations = conversationsData?.conversations || [];

  // Handle pending conversation selection from navigation
  useEffect(() => {
    if (pendingConversationId) {
      setSelectedConversation(pendingConversationId);
      setPendingConversationId(null);
      if (isMobile) {
        setShowConversationList(false);
      }
    }
  }, [pendingConversationId, setPendingConversationId, isMobile]);

  // On mobile, show list or conversation
  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBack = () => {
    setShowConversationList(true);
  };

  if (isMobile) {
    return (
      <div className="flex h-full flex-col">
        {showConversationList ? (
          <ConversationList
            conversations={conversations}
            isLoading={isLoadingConversations}
            selectedId={selectedConversation}
            onSelect={handleSelectConversation}
            currentUserId={user?.auth?.id || ""}
          />
        ) : selectedConversation ? (
          <ConversationView
            conversationId={selectedConversation}
            currentUserId={user?.auth?.id || ""}
            currentUsername={user?.profile?.username || ""}
            onBack={handleBack}
            isMobile
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <ConversationList
        conversations={conversations}
        isLoading={isLoadingConversations}
        selectedId={selectedConversation}
        onSelect={handleSelectConversation}
        currentUserId={user?.auth?.id || ""}
      />

      {selectedConversation ? (
        <ConversationView
          conversationId={selectedConversation}
          currentUserId={user?.auth?.id || ""}
          currentUsername={user?.profile?.username || ""}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="text-xl font-semibold text-muted-foreground">
              Select a conversation
            </h2>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Choose a conversation from the list to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface ConversationListProps {
  conversations: ConversationData[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  currentUserId: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  currentUserId,
}) => {
  return (
    <div className="flex w-full flex-col border-r border-border bg-card md:w-80">
      <div className="flex h-16 items-center border-b border-border px-4">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length > 0 ? (
          <div className="p-2">
            {conversations.map((conv) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedId === conv.id}
                onClick={() => onSelect(conv.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Start a conversation with a friend!
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

interface ConversationListItemProps {
  conversation: ConversationData;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const { data: participant } = useConversationParticipant(conversation.id);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
        isSelected ? "bg-primary/10 text-foreground" : "hover:bg-muted/50"
      )}
    >
      <UserAvatar username={participant?.participant_username} size="md" />
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">
          {participant?.participant_username || "Loading..."}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(conversation.created_at), "MMM d")}
        </p>
      </div>
    </button>
  );
};

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
  currentUsername: string;
  onBack?: () => void;
  isMobile?: boolean;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversationId,
  currentUserId,
  currentUsername,
  onBack,
  isMobile,
}) => {
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);

  const { data: messagesData, isLoading } = useMessages(conversationId);
  const { data: participant } = useConversationParticipant(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const { checkForNewMessages } = useNewMessageNotification();

  const messages = messagesData?.messages || [];
  const isFriend = participant?.is_friend ?? true; // Default to true if not loaded yet

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check for new message notifications
  useEffect(() => {
    if (messages.length > 0) {
      checkForNewMessages(conversationId, messages, currentUserId);
    }
  }, [messages, conversationId, currentUserId, checkForNewMessages]);

  // Set up Supabase realtime subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to message changes
    const channel = supabase
      .channel(`messages:${conversationId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          
          // If this message is from the current user, mark it as sent to prevent notification sound
          if (newMessage.sender_id === currentUserId) {
            markMessageAsSent(newMessage.id);
          }
          
          // Update the messages cache immediately
          queryClient.setQueryData(
            ["messages", conversationId],
            (old: { messages: MessageData[] } | undefined) => {
              if (!old) {
                // If no old data, create new structure
                const messageData: MessageData = {
                  id: newMessage.id,
                  sender_id: newMessage.sender_id,
                  sender_username: newMessage.sender_username || "Unknown",
                  content: newMessage.content,
                  created_at: newMessage.created_at,
                };
                return { messages: [messageData] };
              }
              
              // Check if message already exists (avoid duplicates)
              const exists = old.messages.some(
                (msg) => msg.id === newMessage.id
              );
              if (exists) return old;

              const messageData: MessageData = {
                id: newMessage.id,
                sender_id: newMessage.sender_id,
                sender_username: newMessage.sender_username || "Unknown",
                content: newMessage.content,
                created_at: newMessage.created_at,
              };

              // If this is a message from the current user, replace the optimistic message instead of adding
              if (newMessage.sender_id === currentUserId) {
                // Find and replace the optimistic message (temp-*) with the same content
                const optimisticIndex = old.messages.findIndex(
                  (msg) => msg.id.startsWith('temp-') && msg.content === newMessage.content
                );
                
                if (optimisticIndex !== -1) {
                  // Replace the optimistic message
                  const newMessages = [...old.messages];
                  newMessages[optimisticIndex] = messageData;
                  return {
                    messages: newMessages,
                  };
                }
              }

              // Otherwise, just add the new message
              return {
                messages: [...old.messages, messageData],
              };
            }
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription active for conversation:', conversationId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error for conversation:', conversationId);
          // Fallback: invalidate queries to refetch messages
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      });

    channelRef.current = channel;

    // Set up Presence for typing indicators
    const presenceChannel = supabase.channel(`typing:${conversationId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const typing: string[] = [];
        Object.keys(state).forEach((userId) => {
          if (userId !== currentUserId) {
            const userPresence = state[userId] as any[];
            if (userPresence && userPresence.length > 0) {
              const presence = userPresence[0];
              if (presence.typing) {
                typing.push(presence.username || userId);
              }
            }
          }
        });
        setTypingUsers(typing);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        // Handle join
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        // Handle leave
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            typing: false,
            username: currentUsername,
          });
        }
      });

    presenceChannelRef.current = presenceChannel;

    return () => {
      // Cleanup subscriptions
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
    };
  }, [conversationId, currentUserId, currentUsername, queryClient]);

  // Handle typing indicator - stop typing immediately
  const handleTypingStop = useCallback(() => {
    if (!presenceChannelRef.current) return;

    // Clear timeout if it exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Only update if we're currently showing typing
    if (isTypingRef.current) {
      isTypingRef.current = false;
      presenceChannelRef.current.track({
        typing: false,
        username: currentUsername,
      });
    }
  }, [currentUsername]);

  // Handle typing indicator - start typing immediately
  const handleTypingStart = useCallback(() => {
    if (!presenceChannelRef.current || !isFriend) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Show typing indicator immediately
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      presenceChannelRef.current.track({
        typing: true,
        username: currentUsername,
      });
    }

    // Set a very short timeout (300ms) to stop typing when user stops
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 300);
  }, [currentUsername, isFriend, handleTypingStop]);

  // Cleanup - stop typing when component unmounts
  useEffect(() => {
    return () => {
      // Clear timeout and stop typing when component unmounts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleTypingStop();
    };
  }, [handleTypingStop]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessage.isPending || !isFriend) return;

    // Stop typing indicator
    handleTypingStop();

    const content = message.trim();
    setMessage("");

    try {
      await sendMessage.mutateAsync(content);
    } catch {
      setMessage(content); // Restore message on failure
    }

    inputRef.current?.focus();
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    // Don't trigger typing indicator here - only on key press
  };

  // Handle key press to show typing indicator instantly
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only show typing for actual character keys (not modifiers, arrows, etc.)
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      handleTypingStart();
    }
  };

  // Handle blur to stop typing immediately when input loses focus
  const handleBlur = () => {
    handleTypingStop();
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, "h:mm a");
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    }
    return format(date, "MMM d, h:mm a");
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        {isMobile && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <UserAvatar username={participant?.participant_username} size="sm" />
        <div>
          <p className="font-semibold">
            {participant?.participant_username || "Loading..."}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={
                  msg.sender_id === currentUserId || msg.sender_id === "me"
                }
                formatTime={formatMessageTime}
              />
            ))}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-4 py-2">
                  <p className="text-sm text-muted-foreground italic">
                    {typingUsers.length === 1
                      ? `${typingUsers[0]} is typing...`
                      : `${typingUsers.join(", ")} are typing...`}
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground/70">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-border p-4">
        {participant && !participant.is_friend && (
          <div className="mb-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">
              You are no longer friends with this user.
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sendMessage.isPending || !isFriend}
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending || !isFriend}
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

interface MessageBubbleProps {
  message: MessageData;
  isOwn: boolean;
  formatTime: (date: string) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  formatTime,
}) => {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        <p className="break-words text-sm">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-right text-xs",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
};

export default ChatTab;
