import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useSearchUsers,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend,
} from "@/hooks/useFriends";
import { useCreateOrGetConversation } from "@/hooks/useChat";
import { UserAvatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  UserPlus,
  Check,
  X,
  Loader2,
  UserMinus,
  Clock,
  Users,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchUserData } from "@/types/api";

const FriendsTab: React.FC = () => {
  const { user } = useAuth();
  const { navigateToConversation } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(
    debouncedQuery,
    isDropdownOpen && debouncedQuery.length >= 3
  );

  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const removeFriend = useRemoveFriend();
  const createOrGetConversation = useCreateOrGetConversation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 3) {
      setIsDropdownOpen(true);
    }
  };

  const handleSendRequest = async (userData: SearchUserData) => {
    await sendRequest.mutateAsync(userData.username);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  // Check if user is already friend or has pending request
  const isAlreadyFriend = (userId: string) => {
    return user?.friends?.some((f) => f.friend_id === userId);
  };

  const hasPendingOutgoing = (userId: string) => {
    return user?.outgoing_requests?.some((r) => r.receiver_id === userId);
  };

  const hasPendingIncoming = (userId: string) => {
    return user?.incoming_requests?.some((r) => r.sender_id === userId);
  };

  const canSendRequest = (userData: SearchUserData) => {
    if (userData.id === user?.auth?.id) return false;
    if (isAlreadyFriend(userData.id)) return false;
    if (hasPendingOutgoing(userData.id)) return false;
    if (hasPendingIncoming(userData.id)) return false;
    return true;
  };

  const getSearchResultStatus = (userData: SearchUserData) => {
    if (userData.id === user?.auth?.id) return "You";
    if (isAlreadyFriend(userData.id)) return "Already friends";
    if (hasPendingOutgoing(userData.id)) return "Request sent";
    if (hasPendingIncoming(userData.id)) return "Sent you a request";
    return null;
  };

  const handleStartConversation = async (friendId: string) => {
    try {
      const response = await createOrGetConversation.mutateAsync(friendId);
      navigateToConversation(response.conversation_id);
    } catch (error) {
      // Error is already handled by the hook's onError callback
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header with search */}
      <div className="flex-shrink-0 border-b border-border p-4 md:p-6">
        <h1 className="mb-4 text-xl font-bold md:text-2xl">Friends</h1>

        {/* Search */}
        <div ref={dropdownRef} className="relative max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search users by username (min 3 chars)..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 3 && setIsDropdownOpen(true)}
              className="pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Search dropdown */}
          {isDropdownOpen && debouncedQuery.length >= 3 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-popover shadow-lg animate-fade-in">
              {isSearching ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults?.usernames &&
                searchResults.usernames.length > 0 ? (
                <ul className="py-1">
                  {searchResults.usernames.map((userData) => {
                    const status = getSearchResultStatus(userData);
                    const canSend = canSendRequest(userData);

                    return (
                      <li
                        key={userData.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar username={userData.username} size="sm" />
                          <span className="font-medium">
                            {userData.username}
                          </span>
                          {status && (
                            <span className="text-xs text-muted-foreground">
                              ({status})
                            </span>
                          )}
                        </div>
                        {canSend && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendRequest(userData)}
                            disabled={sendRequest.isPending}
                            className="h-8 gap-1"
                          >
                            {sendRequest.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4" />
                                Add
                              </>
                            )}
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Incoming Requests */}
          <RequestSection
            title="Incoming Requests"
            icon={<UserPlus className="h-5 w-5 text-primary" />}
            requests={user?.incoming_requests || []}
            type="incoming"
            onAccept={(id) => acceptRequest.mutate(id)}
            onDecline={(id) => declineRequest.mutate(id)}
            isAccepting={acceptRequest.isPending}
            isDeclining={declineRequest.isPending}
          />

          {/* Outgoing Requests */}
          <RequestSection
            title="Pending Requests"
            icon={<Clock className="h-5 w-5 text-warning" />}
            requests={user?.outgoing_requests || []}
            type="outgoing"
            onCancel={(id) => cancelRequest.mutate(id)}
            isCancelling={cancelRequest.isPending}
          />
        </div>

        {/* Friends List */}
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-success" />
            <h2 className="text-lg font-semibold">
              Friends ({user?.friends?.length || 0})
            </h2>
          </div>

          {user?.friends && user.friends.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {user.friends.map((friend) => (
                <div
                  key={friend.friend_id}
                  className="flex items-center justify-between rounded-lg bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar username={friend.username} size="sm" />
                    <div>
                      <p className="font-medium">
                        {friend.username || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Since {new Date(friend.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleStartConversation(friend.friend_id)}
                      disabled={createOrGetConversation.isPending}
                      title="Start conversation"
                    >
                      {createOrGetConversation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MessageCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFriend.mutate(friend.friend_id)}
                      disabled={removeFriend.isPending}
                      title="Remove friend"
                    >
                      {removeFriend.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No friends yet. Search for users to add friends!" />
          )}
        </div>
      </div>
    </div>
  );
};

interface RequestSectionProps {
  title: string;
  icon: React.ReactNode;
  requests: Array<{
    id?: string;
    sender_id?: string;
    receiver_id?: string;
    username: string | null;
  }>;
  type: "incoming" | "outgoing";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
  isCancelling?: boolean;
}

const RequestSection: React.FC<RequestSectionProps> = ({
  title,
  icon,
  requests,
  type,
  onAccept,
  onDecline,
  onCancel,
  isAccepting,
  isDeclining,
  isCancelling,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="font-semibold">{title}</h2>
        {requests.length > 0 && (
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {requests.length}
          </span>
        )}
      </div>

      {requests.length > 0 ? (
        <ul className="space-y-2">
          {requests.map((request) => {
            const userId =
              type === "incoming" ? request.sender_id : request.receiver_id;

            return (
              <li
                key={request.id || userId}
                className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar username={request.username} size="sm" />
                  <span className="font-medium">
                    {request.username || "Unknown"}
                  </span>
                </div>
                <div className="flex gap-1">
                  {type === "incoming" ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-success hover:bg-success/20 hover:text-success"
                        onClick={() => onAccept?.(userId!)}
                        disabled={isAccepting}
                        title="Accept"
                      >
                        {isAccepting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => onDecline?.(userId!)}
                        disabled={isDeclining}
                        title="Decline"
                      >
                        {isDeclining ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onCancel?.(userId!)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Cancel"
                      )}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4">
          {type === "incoming" ? "No incoming requests" : "No pending requests"}
        </p>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-lg border border-dashed border-border p-8 text-center">
    <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

export default FriendsTab;
