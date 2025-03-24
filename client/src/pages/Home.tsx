import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MangaCard from "@/components/manga/MangaCard";
import FeaturedMangaCarousel from "@/components/manga/FeaturedMangaCarousel";
import LatestUpdateItem from "@/components/manga/LatestUpdateItem";
import { 
  useFeaturedManga, 
  useTrendingManga, 
  useLatestUpdatedManga,
  useMangaByGenre,
  useGenres
} from "@/hooks/use-manga";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Fetch data
  const { data: featuredManga, isLoading: isFeaturedLoading } = useFeaturedManga(5);
  const { data: trendingManga, isLoading: isTrendingLoading } = useTrendingManga(6);
  const { data: latestManga, isLoading: isLatestLoading } = useLatestUpdatedManga(4);
  const { data: genres } = useGenres();
  
  // Get romance genre id and fetch romance manga
  const romanceGenre = genres?.find(genre => genre.name === "Romance");
  const { data: romanceManga } = useMangaByGenre(romanceGenre?.id || 0);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className="flex-1 px-4 md:px-8 py-6 md:ml-0 min-h-screen">
          <div>
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold font-heading mb-1">Featured Manga</h1>
              <p className="text-muted-foreground">Discover the most popular manga this week</p>
            </div>
            
            {/* Featured Manga Carousel */}
            {isFeaturedLoading ? (
              <Skeleton className="w-full h-60 md:h-96 rounded-xl mb-12" />
            ) : (
              <FeaturedMangaCarousel manga={featuredManga || []} className="mb-12" />
            )}
            
            {/* Trending Manga Section */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-heading">Trending Now</h2>
                  <p className="text-muted-foreground text-sm">Hot manga everyone's reading</p>
                </div>
                <Link href="/browse?sort=trending" className="text-primary hover:text-accent transition-colors flex items-center">
                  <span>View All</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {isTrendingLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="aspect-[3/4] rounded-lg" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  ))
                ) : (
                  trendingManga?.map(manga => (
                    <MangaCard
                      key={manga.id}
                      id={manga.id}
                      title={manga.title}
                      coverImage={manga.coverImage}
                      rating={manga.rating}
                      status={manga.status}
                      genres={genres?.filter(genre => manga.genreIds.includes(genre.id)).map(genre => ({
                        id: genre.id,
                        name: genre.name,
                      }))}
                    />
                  ))
                )}
              </div>
            </section>
            
            {/* Latest Updates Section */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-heading">Latest Updates</h2>
                  <p className="text-muted-foreground text-sm">Recently added chapters</p>
                </div>
                <Link href="/browse?sort=latest" className="text-primary hover:text-accent transition-colors flex items-center">
                  <span>View All</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLatestLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex space-x-3">
                      <Skeleton className="w-24 h-32 md:w-28 md:h-36" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-24" />
                        <div className="space-y-1 pt-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-5/6" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  latestManga?.map(({ manga, latestChapter }) => (
                    <LatestUpdateItem
                      key={`${manga.id}-${latestChapter.id}`}
                      manga={{
                        id: manga.id,
                        title: manga.title,
                        author: manga.author,
                        coverImage: manga.coverImage,
                      }}
                      latestChapter={{
                        id: latestChapter.id,
                        chapterNumber: latestChapter.chapterNumber,
                        createdAt: latestChapter.createdAt,
                      }}
                      genres={genres?.filter(genre => manga.genreIds.includes(genre.id)).map(genre => ({
                        id: genre.id,
                        name: genre.name,
                      }))}
                    />
                  ))
                )}
              </div>
            </section>
            
            {/* Romance Manga Section */}
            {romanceGenre && (
              <section>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold font-heading">Romance Manga</h2>
                    <p className="text-muted-foreground text-sm">Popular in Romance genre</p>
                  </div>
                  <Link href={`/browse?genre=${romanceGenre.id}`} className="text-primary hover:text-accent transition-colors flex items-center">
                    <span>View All</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {romanceManga?.slice(0, 6).map(manga => (
                    <MangaCard
                      key={manga.id}
                      id={manga.id}
                      title={manga.title}
                      coverImage={manga.coverImage}
                      rating={manga.rating}
                      status={manga.status}
                      genres={genres?.filter(genre => manga.genreIds.includes(genre.id)).map(genre => ({
                        id: genre.id,
                        name: genre.name,
                      }))}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;
