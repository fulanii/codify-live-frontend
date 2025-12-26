import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRef, useEffect } from 'react';

export function useSearchUsers(query: string, enabled: boolean) {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // Cancel any pending request on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: async () => {
      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      return friendsApi.search(query, abortControllerRef.current.signal);
    },
    enabled: enabled && query.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (username: string) => friendsApi.sendRequest(username),
    onSuccess: () => {
      toast({
        title: 'Friend request sent',
        description: 'Your friend request has been sent successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (senderId: string) => friendsApi.acceptRequest(senderId),
    onSuccess: () => {
      toast({
        title: 'Friend request accepted',
        description: 'You are now friends!',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to accept request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeclineFriendRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (senderId: string) => friendsApi.declineRequest(senderId),
    onSuccess: () => {
      toast({
        title: 'Friend request declined',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to decline request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (receiverId: string) => friendsApi.cancelRequest(receiverId),
    onSuccess: () => {
      toast({
        title: 'Friend request cancelled',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to cancel request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (userId: string) => friendsApi.removeFriend(userId),
    onSuccess: () => {
      toast({
        title: 'Friend removed',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove friend',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
