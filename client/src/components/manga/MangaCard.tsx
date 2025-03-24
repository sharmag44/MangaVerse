import { Link } from "wouter";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MangaCardProps {
  id: number;
  title: string;
  coverImage: string;
  rating?: number;
  status: string;
  currentChapter?: number;
  genres?: { id: number; name: string }[];
  className?: string;
}

const MangaCard = ({
  id,
  title,
  coverImage,
  rating = 0,
  status,
  currentChapter,
  genres = [],
  className,
}: MangaCardProps) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col bg-card rounded-lg overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1",
        className
      )}
    >
      <div className="relative overflow-hidden">
        <AspectRatio ratio={3/4}>
          <img
            src={coverImage}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </AspectRatio>
        
        {rating > 0 && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary text-primary-foreground">
              {rating.toFixed(1)} ★
            </Badge>
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 hover:bg-black/70 rounded-full text-white h-8 w-8"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-['Bebas_Neue'] text-lg font-bold tracking-wide leading-tight mb-1 truncate">
          {title}
        </h3>
        
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          {currentChapter && (
            <>
              <span>Ch. {currentChapter}</span>
              <span className="mx-1">•</span>
            </>
          )}
          <span className="capitalize">{status}</span>
        </div>
        
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {genres.slice(0, 2).map((genre) => (
              <Badge
                key={genre.id}
                variant="secondary"
                className="px-2 py-0.5 text-xs rounded-md"
              >
                {genre.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <Link href={`/manga/${id}`} className="absolute inset-0" aria-label={`View details for ${title}`} />
    </div>
  );
};

export default MangaCard;
