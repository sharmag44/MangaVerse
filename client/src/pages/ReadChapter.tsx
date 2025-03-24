
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useChapter, useMangaWithRelations } from "@/hooks/use-manga";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ReadChapter = () => {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ mangaId: string; chapterId: string }>("/manga/:mangaId/chapter/:chapterId");
  
  const mangaId = match ? parseInt(params.mangaId) : 0;
  const chapterId = match ? parseInt(params.chapterId) : 0;
  
  const { data: chapter, isLoading: isLoadingChapter, isError: isChapterError } = useChapter(chapterId);
  const { data: mangaData, isLoading: isLoadingManga, isError: isMangaError } = useMangaWithRelations(mangaId);
  
  const [prevChapterId, setPrevChapterId] = useState<number | undefined>(undefined);
  const [nextChapterId, setNextChapterId] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    if (mangaData?.chapters && chapter) {
      const sortedChapters = [...mangaData.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
      const currentIndex = sortedChapters.findIndex(ch => ch.id === chapter.id);
      
      setPrevChapterId(currentIndex > 0 ? sortedChapters[currentIndex - 1].id : undefined);
      setNextChapterId(currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1].id : undefined);
    }
  }, [mangaData, chapter]);
  
  const isLoading = isLoadingChapter || isLoadingManga;
  const isError = isChapterError || isMangaError;

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (isError || !chapter) {
    return <div className="flex justify-center items-center min-h-screen">Error loading chapter</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold">
            Chapter {chapter.chapterNumber}: {chapter.title}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => prevChapterId && navigate(`/manga/${mangaId}/chapter/${prevChapterId}`)}
              disabled={!prevChapterId}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => nextChapterId && navigate(`/manga/${mangaId}/chapter/${nextChapterId}`)}
              disabled={!nextChapterId}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <ScrollArea className="h-[calc(100vh-8rem)] rounded-md border p-4">
          {chapter.contentType === 'images' && chapter.content.images && (
            <div className="flex flex-col items-center gap-4">
              {chapter.content.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Page ${index + 1}`}
                  className="max-w-full h-auto"
                  loading="lazy"
                />
              ))}
            </div>
          )}
          
          {chapter.contentType === 'pdf' && chapter.content.pdfUrl && (
            <iframe
              src={`${chapter.content.pdfUrl}#toolbar=0`}
              className="w-full h-full"
              title={chapter.title}
            />
          )}
        </ScrollArea>
      </main>
    </div>
  );
};

export default ReadChapter;
