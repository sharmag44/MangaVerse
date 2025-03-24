import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useChapter, useMangaWithRelations } from "@/hooks/use-manga";
import MangaReader from "@/components/manga/MangaReader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

const ReadChapter = () => {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ mangaId: string; chapterId: string }>("/manga/:mangaId/chapter/:chapterId");
  
  const mangaId = match ? parseInt(params.mangaId) : 0;
  const chapterId = match ? parseInt(params.chapterId) : 0;
  
  // Fetch the current chapter
  const { data: chapter, isLoading: isLoadingChapter, isError: isChapterError } = useChapter(chapterId);
  
  // Fetch the manga with its chapters to determine prev/next chapters
  const { data: mangaData, isLoading: isLoadingManga, isError: isMangaError } = useMangaWithRelations(mangaId);
  
  // Find the prev/next chapter IDs
  const [prevChapterId, setPrevChapterId] = useState<number | undefined>(undefined);
  const [nextChapterId, setNextChapterId] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    if (mangaData?.chapters && chapter) {
      const sortedChapters = [...mangaData.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
      const currentIndex = sortedChapters.findIndex(ch => ch.id === chapter.id);
      
      if (currentIndex > 0) {
        setPrevChapterId(sortedChapters[currentIndex - 1].id);
      } else {
        setPrevChapterId(undefined);
      }
      
      if (currentIndex < sortedChapters.length - 1) {
        setNextChapterId(sortedChapters[currentIndex + 1].id);
      } else {
        setNextChapterId(undefined);
      }
    }
  }, [mangaData, chapter]);
  
  const isLoading = isLoadingChapter || isLoadingManga;
  const isError = isChapterError || isMangaError;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Skeleton className="w-full max-w-3xl h-[80vh]" />
      </div>
    );
  }
  
  if (isError || !chapter || !mangaData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Chapter Not Found</h2>
          <p className="text-muted-foreground mb-6">The chapter you are looking for doesn't exist or has been removed.</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate(`/manga/${mangaId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manga
            </Button>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <MangaReader
      mangaId={mangaId}
      chapter={chapter}
      prevChapterId={prevChapterId}
      nextChapterId={nextChapterId}
    />
  );
};

export default ReadChapter;
