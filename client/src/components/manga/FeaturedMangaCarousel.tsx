import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, BookOpen, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Manga } from "@shared/schema";

interface FeaturedMangaCarouselProps {
  manga: Manga[];
  className?: string;
}

const FeaturedMangaCarousel = ({ manga, className }: FeaturedMangaCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = manga.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [totalSlides]);

  if (!manga || manga.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {manga.map((item) => (
          <div key={item.id} className="w-full flex-shrink-0 relative h-60 md:h-96">
            <img 
              src={item.coverImage} 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <Badge className="bg-accent text-accent-foreground mb-2">POPULAR</Badge>
              <h2 className="text-2xl md:text-4xl font-bold font-['Bebas_Neue'] tracking-wide text-white mb-2">
                {item.title}
              </h2>
              <p className="text-gray-300 mb-4 max-w-md line-clamp-2 md:line-clamp-3">
                {item.description}
              </p>
              <div className="flex space-x-3">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href={`/manga/${item.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" /> Read Now
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href={`/manga/${item.id}`}>
                    <Info className="mr-2 h-4 w-4" /> Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalSlides > 1 && (
        <>
          {/* Carousel Navigation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {manga.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full focus:outline-none",
                  index === currentSlide 
                    ? "bg-white" 
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FeaturedMangaCarousel;
