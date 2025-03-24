import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Define the shape of comment with user information
interface CommentWithUser {
  id: number;
  userId: number;
  mangaId: number;
  content: string;
  createdAt: Date;
  username: string;
  avatarUrl: string | null;
}

// Get comments for a manga
export function useComments(mangaId: number) {
  return useQuery<CommentWithUser[]>({
    queryKey: ['/api/manga', mangaId, 'comments'],
    enabled: !!mangaId,
  });
}

// Add a new comment
export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commentData: { mangaId: number; content: string }) => {
      return apiRequest('POST', '/api/comments', commentData);
    },
    onSuccess: (_, variables) => {
      // Invalidate the comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/manga', variables.mangaId, 'comments'] });
    }
  });
}

// Delete a comment
export function useDeleteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, mangaId }: { commentId: number; mangaId: number }) => {
      return apiRequest('DELETE', `/api/comments/${commentId}`);
    },
    onSuccess: (_, variables) => {
      // Invalidate the comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/manga', variables.mangaId, 'comments'] });
    }
  });
}