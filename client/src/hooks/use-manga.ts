import { useQuery } from "@tanstack/react-query";
import { Manga, Genre, Category, Chapter, MangaWithRelations } from "@shared/schema";

// Get featured manga for carousel
export function useFeaturedManga(limit: number = 5) {
  return useQuery<Manga[]>({
    queryKey: [`/api/manga/featured?limit=${limit}`],
  });
}

// Get trending manga
export function useTrendingManga(limit: number = 6) {
  return useQuery<Manga[]>({
    queryKey: [`/api/manga/trending?limit=${limit}`],
  });
}

// Get latest updated manga
export function useLatestUpdatedManga(limit: number = 4) {
  return useQuery<{manga: Manga, latestChapter: Chapter}[]>({
    queryKey: [`/api/manga/latest?limit=${limit}`],
  });
}

// Get manga by genre
export function useMangaByGenre(genreId: number) {
  return useQuery<Manga[]>({
    queryKey: [`/api/manga/genre/${genreId}`],
    enabled: !!genreId,
  });
}

// Get manga by category
export function useMangaByCategory(categoryId: number) {
  return useQuery<Manga[]>({
    queryKey: [`/api/manga/category/${categoryId}`],
    enabled: !!categoryId,
  });
}

// Search manga
export function useSearchManga(query: string) {
  return useQuery<Manga[]>({
    queryKey: [`/api/manga/search?q=${encodeURIComponent(query)}`],
    enabled: !!query,
  });
}

// Get manga details with relations
export function useMangaWithRelations(id: number) {
  return useQuery<MangaWithRelations>({
    queryKey: [`/api/manga/${id}`],
    enabled: !!id,
  });
}

// Get chapter details
export function useChapter(id: number) {
  return useQuery<Chapter>({
    queryKey: [`/api/chapters/${id}`],
    enabled: !!id,
  });
}

// Get all genres
export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });
}

// Get all categories
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
}

// Get all manga (for admin)
export function useAllManga() {
  return useQuery<Manga[]>({
    queryKey: ["/api/manga"],
  });
}
