import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Get comments for a manga
export function useComments(mangaId: number) {
  return useQuery<Comment[]>({
    queryKey: ['/api/manga', mangaId, 'comments'],
    enabled: !!mangaId,
  });
}

// Add a new comment
export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commentData: { mangaId: number; content: string }) => {
      return apiRequest('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
      });
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
      return apiRequest(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate the comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/manga', variables.mangaId, 'comments'] });
    }
  });
}