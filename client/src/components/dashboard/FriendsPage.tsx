import { useState } from "react";
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
import { Search, UserPlus, X, Check, MoreVertical } from "lucide-react";
import type { Friend, FriendRequest } from "@/lib/auth-schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends] = useState<Friend[]>([]);
  const [requests] = useState<FriendRequest[]>([]);

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-friends"
              />
            </div>
            <Button data-testid="button-search-friends">
              <UserPlus className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>
              {requests.length} pending friend{" "}
              {requests.length === 1 ? "request" : "requests"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-md border"
                  data-testid={`request-${request.from.username}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {request.from.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.from.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.from.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      data-testid={`button-accept-${request.from.username}`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      data-testid={`button-reject-${request.from.username}`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
                        <DropdownMenuItem
                          className="text-destructive"
                          data-testid={`action-remove-${friend.username}`}
                        >
                          Remove Friend
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          data-testid={`action-block-${friend.username}`}
                        >
                          Block User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {friend.email}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFriends.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No friends found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
