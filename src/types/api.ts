// Auth types
export interface UserRegistration {
  email: string;
  username: string;
  password: string;
}

export interface UserRegistrationResponse {
  id: string;
  email: string;
  username: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  access_token: string;
  expires_in: number;
  user_id: string;
  email: string;
}

export interface AccessTokenResponse {
  access_token: string;
}

export interface AuthInfo {
  id: string;
  email: string;
}

export interface ProfileInfo {
  username: string;
  created_at: string;
}

export interface FriendItem {
  friend_id: string;
  username: string | null;
  created_at: string;
}

export interface IncomingRequestItem {
  id: string;
  sender_id: string;
  username: string | null;
  status: string;
  created_at: string;
}

export interface OutgoingRequestItem {
  id: string;
  receiver_id: string;
  username: string | null;
  status: string;
  created_at: string;
}

export interface MeResponse {
  auth: AuthInfo;
  profile: ProfileInfo;
  friends: FriendItem[];
  incoming_requests: IncomingRequestItem[];
  outgoing_requests: OutgoingRequestItem[];
}

// Friends types
export interface SearchUserData {
  username: string;
  id: string;
}

export interface FriendsSearchResponse {
  usernames: SearchUserData[];
}

export interface FriendRequestDetail {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
}

export interface FriendRequestResponse {
  message: string;
  request: FriendRequestDetail;
}

export interface AcceptFriendRequestDetail {
  friendship_id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

export interface AcceptFriendRequestResponse {
  friendship_accept: boolean;
  details: AcceptFriendRequestDetail;
}

export interface DeclineFriendRequestResponse {
  request_declined: boolean;
}

export interface CancelFriendRequestResponse {
  request_canceled: boolean;
}

export interface RemoveFriendResponse {
  friend_removed: boolean;
}

// Chat types
export interface ConversationData {
  id: string;
  is_group: boolean;
  created_at: string;
}

export interface GetConversationsResponse {
  conversations: ConversationData[];
}

export interface CreateDirectConversationResponse {
  conversation_id: string;
  is_new: boolean;
}

export interface MessageData {
  id: string;
  sender_id: string;
  sender_username: string;
  content: string;
  created_at: string;
}

export interface GetMessagesResponse {
  messages: MessageData[];
}

export interface SendMessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface SendMessageResponse {
  response_data: SendMessageData[];
}

export interface ConversationParticipantInfo {
  participant_username: string;
  is_friend: boolean;
}

// API error type
export interface ApiError {
  detail: string | { msg: string }[];
}
