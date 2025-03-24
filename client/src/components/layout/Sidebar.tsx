import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Genre, Category } from "@shared/schema";

type SidebarProps = {
  isOpen: boolean;
  className?: string;
};

const Sidebar = ({ isOpen, className }: SidebarProps) => {
  const [location, navigate] = useLocation();
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  
  // Fetch genres
  const { data: genres = [] } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Reset active filters when location changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1] || "");
    
    const genreParam = searchParams.get("genre");
    setActiveGenre(genreParam ? parseInt(genreParam) : null);
    
    const categoryParam = searchParams.get("category");
    setActiveCategory(categoryParam ? parseInt(categoryParam) : null);
    
    const statusParam = searchParams.get("status");
    setActiveStatus(statusParam);
  }, [location]);
  
  const handleGenreClick = (genreId: number) => {
    if (activeGenre === genreId) {
      // If already active, clear the filter
      navigate("/browse");
      setActiveGenre(null);
    } else {
      navigate(`/browse?genre=${genreId}`);
      setActiveGenre(genreId);
    }
  };
  
  const handleCategoryClick = (categoryId: number) => {
    if (activeCategory === categoryId) {
      // If already active, clear the filter
      navigate("/browse");
      setActiveCategory(null);
    } else {
      navigate(`/browse?category=${categoryId}`);
      setActiveCategory(categoryId);
    }
  };
  
  const handleStatusClick = (status: string) => {
    if (activeStatus === status) {
      // If already active, clear the filter
      navigate("/browse");
      setActiveStatus(null);
    } else {
      navigate(`/browse?status=${status}`);
      setActiveStatus(status);
    }
  };

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 transform md:translate-x-0 z-40 w-64 bg-background border-r border-border pt-20 pb-4 transition-transform duration-200 ease-in-out md:relative md:h-auto",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <ScrollArea className="px-4 h-full">
        <div className="mb-6">
          <h3 className="text-sm uppercase text-muted-foreground font-semibold tracking-wider mb-3">
            Genres
          </h3>
          <div className="space-y-1">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-left",
                  activeGenre === genre.id
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{genre.name}</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-auto text-xs rounded-full",
                    activeGenre === genre.id
                      ? "bg-primary/20"
                      : "bg-muted"
                  )}
                >
                  {Math.floor(Math.random() * 100) + 10} {/* This would be replaced with actual count */}
                </Badge>
              </button>
            ))}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="mb-6">
          <h3 className="text-sm uppercase text-muted-foreground font-semibold tracking-wider mb-3">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-left",
                  activeCategory === category.id
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm uppercase text-muted-foreground font-semibold tracking-wider mb-3">
            Status
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => handleStatusClick("ongoing")}
              className={cn(
                "flex items-center w-full px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-left",
                activeStatus === "ongoing"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Ongoing</span>
            </button>
            <button
              onClick={() => handleStatusClick("completed")}
              className={cn(
                "flex items-center w-full px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-left",
                activeStatus === "completed"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Completed</span>
            </button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;
