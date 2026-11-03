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

/**
 * What accept, decline and cancel all return: the updated row, without the
 * usernames `GET /friend-request` joins in.
 */
export interface UpdatedFriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendRequestStatus;
  created_at: string;
}

/** A row of `GET /friends`: the other person, already resolved by the server. */
export interface Friend {
  id: string;
  friend_id: string;
  friend_username: string;
  friends_since: string;
}
