import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  Settings,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chapter } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MangaReaderProps {
  mangaId: number;
  chapter: Chapter;
  prevChapterId?: number;
  nextChapterId?: number;
}

const MangaReader = ({
  mangaId,
  chapter,
  prevChapterId,
  nextChapterId,
}: MangaReaderProps) => {
  const [, navigate] = useLocation();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showControls, setShowControls] = useState(true);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(timeout);
      setShowControls(true);
      
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    
    resetTimer();
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);
  
  const handleZoomIn = () => {
    if (zoomLevel < 150) {
      setZoomLevel(zoomLevel + 10);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 10);
    }
  };
  
  const goToPreviousChapter = () => {
    if (prevChapterId) {
      navigate(`/manga/${mangaId}/chapter/${prevChapterId}`);
    }
  };
  
  const goToNextChapter = () => {
    if (nextChapterId) {
      navigate(`/manga/${mangaId}/chapter/${nextChapterId}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Top controls */}
      <div
        className={`sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/manga/${mangaId}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="text-sm font-medium">
                Chapter {chapter.chapterNumber}: {chapter.title}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoomLevel}%</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 150}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/manga/${mangaId}`)}>
                    <List className="mr-2 h-4 w-4" />
                    <span>Chapter List</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reader content */}
      <div className="flex-1 overflow-auto">
        <div
          className="mx-auto"
          style={{ maxWidth: `${zoomLevel}%` }}
        >
          {chapter.pages.map((page, index) => (
            <img
              key={index}
              src={page}
              alt={`Page ${index + 1}`}
              className="w-full mb-1"
            />
          ))}
        </div>
      </div>
      
      {/* Bottom controls */}
      <div
        className={`sticky bottom-0 z-50 bg-background/90 backdrop-blur-sm border-t transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousChapter}
              disabled={!prevChapterId}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Chapter
            </Button>
            
            <Button
              variant="outline"
              onClick={goToNextChapter}
              disabled={!nextChapterId}
            >
              Next Chapter
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaReader;
