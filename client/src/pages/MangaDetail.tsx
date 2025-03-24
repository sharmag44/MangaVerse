import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useMangaWithRelations } from "@/hooks/use-manga";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChapterList from "@/components/manga/ChapterList";
import { CommentsSection } from "@/components/manga/CommentsSection";
import MangaCard from "@/components/manga/MangaCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BookOpen, Share2, Star, Calendar, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";

const MangaDetail = () => {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/manga/:id");
  const mangaId = match ? parseInt(params.id) : 0;
  
  const { data, isLoading, isError } = useMangaWithRelations(mangaId);
  const [activeTab, setActiveTab] = useState("chapters");
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [mangaId]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="rounded-lg w-full md:w-72 aspect-[3/4]" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-28 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (isError || !data) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Manga Not Found</h2>
            <p className="text-muted-foreground mb-6">The manga you are looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const { manga, genres, categories, chapters } = data;
  
  const handleReadClick = () => {
    if (chapters.length > 0) {
      navigate(`/manga/${manga.id}/chapter/${chapters[0].id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero section with manga details */}
        <div className="bg-background shadow-md">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cover image */}
              <div className="w-full md:w-72 flex-shrink-0">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                  <img
                    src={manga.coverImage}
                    alt={manga.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button 
                    className="w-full" 
                    onClick={handleReadClick}
                    disabled={chapters.length === 0}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Read Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
              
              {/* Manga info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold font-['Bebas_Neue'] tracking-wide mb-2">
                  {manga.title}
                </h1>
                
                <h2 className="text-lg text-muted-foreground mb-3">
                  by {manga.author}
                </h2>
                
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-primary text-white gap-1">
                    <Star className="h-3 w-3" /> {manga.rating.toFixed(1)}
                  </Badge>
                  <Badge variant="outline" className="capitalize">{manga.status}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(manga.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                
                {/* Genres/Categories */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {genres.map(genre => (
                      <Badge key={genre.id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {categories.map(category => (
                      <Badge key={category.id} variant="outline">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Description */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
                  <p className="text-muted-foreground">{manga.description}</p>
                </div>
                
                {/* Chapter info */}
                <div className="mt-6 flex items-center gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Chapters</div>
                    <div className="text-xl font-bold">{chapters.length}</div>
                  </div>
                  
                  {chapters.length > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground">Latest</div>
                      <div className="text-xl font-bold">Ch. {chapters[0].chapterNumber}</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Updated</div>
                    <div className="text-base">
                      {chapters.length > 0 ? (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(chapters[0].createdAt), "MMM d, yyyy")}
                        </span>
                      ) : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs section */}
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="related">Related Manga</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chapters" className="pt-2">
              <ChapterList mangaId={manga.id} chapters={chapters} />
            </TabsContent>
            
            <TabsContent value="related" className="pt-2">
              {genres.length > 0 ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Similar Manga in {genres[0].name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {/* We would fetch related manga here, for now just displaying a message */}
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                      Related manga will appear here
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No related manga available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MangaDetail;
