import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MangaCard from "@/components/manga/MangaCard";
import { useGenres, useCategories, useSearchManga, useMangaByGenre, useMangaByCategory } from "@/hooks/use-manga";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Manga } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Browse = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Parse URL params
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const urlQuery = searchParams.get("q") || "";
  const genreId = searchParams.get("genre") ? parseInt(searchParams.get("genre")!) : undefined;
  const categoryId = searchParams.get("category") ? parseInt(searchParams.get("category")!) : undefined;
  const status = searchParams.get("status") || undefined;
  const sort = searchParams.get("sort") || "all";
  
  // Set initial search query from URL
  useEffect(() => {
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
    
    if (sort) {
      setActiveTab(sort);
    }
  }, [urlQuery, sort]);
  
  // Fetch data
  const { data: genres } = useGenres();
  const { data: categories } = useCategories();
  const { data: searchResults, isLoading: isSearchLoading } = useSearchManga(urlQuery);
  const { data: genreResults, isLoading: isGenreLoading } = useMangaByGenre(genreId || 0);
  const { data: categoryResults, isLoading: isCategoryLoading } = useMangaByCategory(categoryId || 0);
  
  // Fetch all manga
  const { data: allManga, isLoading: isAllMangaLoading } = useQuery<Manga[]>({
    queryKey: ["/api/manga"],
  });
  
  // Determine which data to display
  let displayData: Manga[] = [];
  let isLoading = false;
  
  if (urlQuery) {
    displayData = searchResults || [];
    isLoading = isSearchLoading;
  } else if (genreId) {
    displayData = genreResults || [];
    isLoading = isGenreLoading;
  } else if (categoryId) {
    displayData = categoryResults || [];
    isLoading = isCategoryLoading;
  } else {
    displayData = allManga || [];
    isLoading = isAllMangaLoading;
  }
  
  // Apply status filter if present
  if (status) {
    displayData = displayData.filter(manga => manga.status === status);
  }
  
  // Apply sorting based on active tab
  if (activeTab === "latest") {
    displayData = [...displayData].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (activeTab === "popular" || activeTab === "trending") {
    displayData = [...displayData].sort((a, b) => b.rating - a.rating);
  } else if (activeTab === "az") {
    displayData = [...displayData].sort((a, b) => a.title.localeCompare(b.title));
  } else if (activeTab === "za") {
    displayData = [...displayData].sort((a, b) => b.title.localeCompare(a.title));
  }
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const [path] = location.split("?");
    const newSearchParams = new URLSearchParams();
    
    if (searchQuery) {
      newSearchParams.set("q", searchQuery);
    }
    
    window.history.replaceState(
      {},
      "",
      `${path}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`
    );
  };
  
  // Get page title based on current filters
  const getPageTitle = () => {
    if (urlQuery) {
      return `Search Results for "${urlQuery}"`;
    } else if (genreId && genres) {
      const genre = genres.find(g => g.id === genreId);
      return genre ? `${genre.name} Manga` : "Browse Manga";
    } else if (categoryId && categories) {
      const category = categories.find(c => c.id === categoryId);
      return category ? `${category.name} Manga` : "Browse Manga";
    } else if (status) {
      return `${status.charAt(0).toUpperCase() + status.slice(1)} Manga`;
    } else {
      return "Browse Manga";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className="flex-1 px-4 md:px-8 py-6 md:ml-0 min-h-screen">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold font-heading mb-4">{getPageTitle()}</h1>
            
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <form onSubmit={handleSearch} className="relative w-full md:w-auto md:min-w-[350px]">
                <Input
                  type="text"
                  placeholder="Search manga..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Button type="submit" className="md:hidden w-full mt-2">Search</Button>
              </form>
              
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="latest">Latest</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="az">A-Z</TabsTrigger>
                  <TabsTrigger value="za">Z-A</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Manga Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="aspect-[3/4] rounded-lg" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          ) : displayData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {displayData.map(manga => (
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
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No manga found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Browse;
