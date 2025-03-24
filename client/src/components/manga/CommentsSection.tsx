import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useComments, useAddComment, useDeleteComment } from "@/hooks/use-comments";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

// Import the CommentWithUser type from our hook
import { CommentWithUser } from "@/hooks/use-comments";

// Define the props for this component
  id: number;
  userId: number;
  mangaId: number;
  content: string;
  createdAt: Date;
  username: string;
  avatarUrl: string | null;
}

interface CommentsSectionProps {
  mangaId: number;
  currentUser: { id: number; username: string; isAdmin: boolean } | null;
}

export function CommentsSection({ mangaId, currentUser }: CommentsSectionProps) {
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();
  
  const { data: comments, isLoading } = useComments(mangaId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast({
        title: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: "Please login to comment",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addComment.mutateAsync({
        mangaId,
        content: commentText.trim()
      });
      setCommentText("");
      toast({
        title: "Comment added successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to add comment",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment.mutateAsync({ commentId, mangaId });
      toast({
        title: "Comment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to delete comment",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };
  
  return (
    <div className="py-4 space-y-6">
      <h3 className="text-xl font-semibold">Comments</h3>
      
      {currentUser ? (
        <div className="flex flex-col space-y-2">
          <Textarea 
            placeholder="Add a comment..." 
            value={commentText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentText(e.target.value)}
            className="min-h-24"
          />
          <div className="self-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={addComment.isPending || !commentText.trim()}
            >
              {addComment.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            Please login to add comments
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4 mt-6">
        {isLoading ? (
          <div className="text-center py-4">Loading comments...</div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment: CommentWithUser) => (
            <div key={comment.id} className="flex space-x-4 p-4 border rounded-lg">
              <Avatar>
                <AvatarImage src={comment.avatarUrl || undefined} alt={comment.username} />
                <AvatarFallback>{getInitials(comment.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{comment.username}</h4>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1">{comment.content}</p>
              </div>
              {currentUser && (currentUser.id === comment.userId || currentUser.isAdmin) && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={deleteComment.isPending}
                >
                  Delete
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">No comments yet</div>
        )}
      </div>
    </div>
  );
}