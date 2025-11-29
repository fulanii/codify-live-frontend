import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type {
  Friend,
  FriendSearchResult,
  OutgoingFriendRequest,
  IncomingFriendRequest,
} from "@/lib/auth-schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  UserPlus,
  X,
  Check,
  MoreVertical,
  Loader2,
} from "lucide-react";

export function FriendsPage() {
  const { accessToken, user } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sendingToUserId, setSendingToUserId] = useState<string | null>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingSent, setPendingSent] = useState<OutgoingFriendRequest[]>([]);
  const [pendingReceived, setPendingReceived] = useState<
    IncomingFriendRequest[]
  >([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      setDataLoading(true);
      setDataError(null);

      const profile = await api.getFullProfile(accessToken);
      setFriends(profile.friends || []);
      setPendingSent(
        (profile.outgoing_requests || []).map((request) => ({
          receiverId: request.receiver_id,
          receiverUsername: request.username,
          createdAt: request.created_at,
        }))
      );
      setPendingReceived(
        (profile.incoming_requests || []).map((request) => ({
          senderId: request.sender_id,
          senderUsername: request.username,
          createdAt: request.created_at,
        }))
      );
    } catch (error) {
      setDataError(
        error instanceof Error ? error.message : "Failed to load data"
      );
    } finally {
      setDataLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!accessToken) return;

    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    let cancelled = false;
    const debounce = setTimeout(async () => {
      try {
        const results = await api.searchUsers(trimmed, accessToken);
        if (cancelled) return;
        // Filter out current user from search results
        const filteredResults = results.filter(
          (result) =>
            result.id !== user?.id && result.username !== user?.username
        );
        setSearchResults(filteredResults);
      } catch (error) {
        if (cancelled) return;
        setSearchError(
          error instanceof Error ? error.message : "Failed to search users"
        );
        setSearchResults([]);
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [searchQuery, accessToken, user?.id, user?.username]);

  const handleSendRequest = async (result: FriendSearchResult) => {
    if (!accessToken) return;
    setSendingToUserId(result.id);

    try {
      const request = await api.sendFriendRequest(result.username, accessToken);
      setPendingSent((prev) => [
        {
          receiverId: request.receiverId,
          receiverUsername: request.receiverUsername,
          createdAt: request.createdAt,
        },
        ...prev,
      ]);
      // Remove the user from search results since request was sent
      setSearchResults((prev) => prev.filter((r) => r.id !== result.id));
      toast({
        title: "Request sent",
        description: `Friend request sent to ${result.username}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send request",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while sending the request.",
        variant: "destructive",
      });
    } finally {
      setSendingToUserId(null);
    }
  };

  const handleAcceptRequest = async (request: IncomingFriendRequest) => {
    if (!accessToken) return;
    setAcceptingId(request.senderId);

    try {
      await api.acceptFriendRequest(request.senderId, accessToken);
      setPendingReceived((prev) =>
        prev.filter((item) => item.senderId !== request.senderId)
      );
      toast({
        title: "Friend added",
        description: `You are now friends with ${request.senderUsername}`,
      });
      await loadInitialData();
    } catch (error) {
      toast({
        title: "Failed to accept request",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while accepting the request.",
        variant: "destructive",
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredFriends = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return friends;
    return friends.filter((friend) =>
      friend.username.toLowerCase().includes(trimmed)
    );
  }, [friends, searchQuery]);

  const isUserRequested = (userId: string, username: string) => {
    return (
      pendingSent.some(
        (request) =>
          request.receiverId === userId ||
          request.receiverUsername.toLowerCase() === username.toLowerCase()
      ) ||
      friends.some(
        (friend) =>
          friend.id === userId ||
          friend.username.toLowerCase() === username.toLowerCase()
      )
    );
  };

  return (
    <div className="container max-w-6xl p-8 space-y-8 mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Friends</h1>
        <p className="text-muted-foreground">
          Connect with friends and manage your network
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Friends</CardTitle>
          <CardDescription>Search for users by username</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Type at least 3 characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-friends"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              {searchQuery.trim().length >= 3 && (
                <div className="absolute z-20 mt-2 w-full rounded-md border bg-popover shadow-lg">
                  <div className="max-h-64 overflow-y-auto py-2">
                    {searchError && (
                      <p className="px-3 py-2 text-sm text-destructive">
                        {searchError}
                      </p>
                    )}
                    {!searchError &&
                      searchResults.length === 0 &&
                      !searchLoading && (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          No users found
                        </p>
                      )}
                    {searchResults.map((result) => {
                      const isRequested = isUserRequested(
                        result.id,
                        result.username
                      );
                      const isSending = sendingToUserId === result.id;

                      return (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => {
                            if (!isRequested && !isSending) {
                              handleSendRequest(result);
                            }
                          }}
                          disabled={isRequested || isSending}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {result.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex items-center justify-between">
                            <p className="font-medium">{result.username}</p>
                            {isSending && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            {isRequested && (
                              <Badge variant="secondary" className="text-xs">
                                Request Sent
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests — Sent</CardTitle>
            <CardDescription>Requests you have sent</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingSent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sent requests.</p>
            ) : (
              <div className="space-y-3">
                {pendingSent.map((request) => (
                  <div
                    key={request.receiverId}
                    className="flex items-center justify-between rounded-md border p-4"
                  >
                    <div>
                      <p className="font-medium">{request.receiverUsername}</p>
                      {request.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          Sent{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests — Received</CardTitle>
            <CardDescription>
              Requests waiting for your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingReceived.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No received requests.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingReceived.map((request) => (
                  <div
                    key={request.senderId}
                    className="flex items-center justify-between rounded-md border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {request.senderUsername.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{request.senderUsername}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request)}
                      disabled={acceptingId === request.senderId}
                      data-testid={`button-accept-${request.senderUsername}`}
                    >
                      {acceptingId === request.senderId ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Accepting
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {dataError && (
        <Card>
          <CardContent>
            <p className="text-sm text-destructive">{dataError}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Friends</CardTitle>
          <CardDescription>
            {friends.length} {friends.length === 1 ? "friend" : "friends"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading friends...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFriends.map((friend) => (
                  <Card
                    key={friend.id}
                    className="hover-elevate"
                    data-testid={`card-friend-${friend.username}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {friend.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{friend.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {friend.email}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-friend-menu-${friend.username}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              data-testid={`action-message-${friend.username}`}
                            >
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              data-testid={`action-profile-${friend.username}`}
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Remove Friend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredFriends.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No friends found</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
