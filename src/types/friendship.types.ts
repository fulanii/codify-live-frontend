export interface UserSearchResult {
  id: string;
  username: string;
}

export interface FriendRequestResponse {
  id: string;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface FriendRequest {
  id: string;
  sender_id: string;
  sender_username: string;
  receiver_id: string;
  receiver_username: string;
  status: FriendRequestStatus;
  created_at: string;
}
