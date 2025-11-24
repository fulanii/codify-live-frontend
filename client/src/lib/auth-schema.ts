import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(8, "Username must be at most 8 characters")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username can only contain letters, numbers, underscores, and dots"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+={}\[\]|\\;:'",.<>?/~`]).{8,}$/,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  user_id: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Friend {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface FriendRequest {
  id: string;
  from: User;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participant: Friend;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface LogoutResponse {
  message: string;
}
