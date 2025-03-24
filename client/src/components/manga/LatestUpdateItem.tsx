import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface LatestUpdateItemProps {
  manga: {
    id: number;
    title: string;
    author: string;
    coverImage: string;
  };
  latestChapter: {
    id: number;
    chapterNumber: number;
    createdAt: Date;
  };
  previousChapter?: {
    id: number;
    chapterNumber: number;
    createdAt: Date;
  };
  genres?: { id: number; name: string }[];
}

const LatestUpdateItem = ({
  manga,
  latestChapter,
  previousChapter,
  genres = [],
}: LatestUpdateItemProps) => {
  return (
    <div className="bg-card rounded-lg overflow-hidden flex hover:shadow-md transition-all">
      <div className="w-24 h-32 md:w-28 md:h-36 flex-shrink-0">
        <img
          src={manga.coverImage}
          alt={manga.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 p-3 flex flex-col">
        <h3 className="font-['Bebas_Neue'] text-lg font-bold tracking-wide">
          {manga.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-2">{manga.author}</p>
        <div className="mb-auto">
          {genres.slice(0, 1).map((genre) => (
            <Badge
              key={genre.id}
              variant="secondary"
              className="mr-1"
            >
              {genre.name}
            </Badge>
          ))}
        </div>
        <div className="mt-2">
          <p className="text-sm">
            <Link
              href={`/manga/${manga.id}/chapter/${latestChapter.id}`}
              className="text-primary hover:underline"
            >
              Chapter {latestChapter.chapterNumber}
            </Link>{" "}
            <span className="text-muted-foreground">
              • {formatDistanceToNow(new Date(latestChapter.createdAt), { addSuffix: true })}
            </span>
          </p>
          {previousChapter && (
            <p className="text-sm text-muted-foreground">
              <Link
                href={`/manga/${manga.id}/chapter/${previousChapter.id}`}
                className="hover:text-primary hover:underline"
              >
                Chapter {previousChapter.chapterNumber}
              </Link>{" "}
              • {formatDistanceToNow(new Date(previousChapter.createdAt), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestUpdateItem;
