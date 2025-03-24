import { 
  users, type User, type InsertUser,
  genres, type Genre, type InsertGenre,
  categories, type Category, type InsertCategory,
  manga, type Manga, type InsertManga,
  chapters, type Chapter, type InsertChapter,
  type MangaWithRelations
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Genre operations
  getGenres(): Promise<Genre[]>;
  getGenre(id: number): Promise<Genre | undefined>;
  createGenre(genre: InsertGenre): Promise<Genre>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Manga operations
  getAllManga(): Promise<Manga[]>;
  getFeaturedManga(limit?: number): Promise<Manga[]>;
  getTrendingManga(limit?: number): Promise<Manga[]>;
  getLatestUpdatedManga(limit?: number): Promise<{manga: Manga, latestChapter: Chapter}[]>;
  getMangaById(id: number): Promise<Manga | undefined>;
  getMangaWithRelations(id: number): Promise<MangaWithRelations | undefined>;
  getMangaByGenre(genreId: number): Promise<Manga[]>;
  getMangaByCategory(categoryId: number): Promise<Manga[]>;
  searchManga(query: string): Promise<Manga[]>;
  createManga(manga: InsertManga): Promise<Manga>;
  updateManga(id: number, manga: Partial<InsertManga>): Promise<Manga | undefined>;
  deleteManga(id: number): Promise<boolean>;
  
  // Chapter operations
  getChapters(mangaId: number): Promise<Chapter[]>;
  getChapterById(id: number): Promise<Chapter | undefined>;
  getLatestChapters(limit?: number): Promise<{manga: Manga, chapter: Chapter}[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: number, chapter: Partial<InsertChapter>): Promise<Chapter | undefined>;
  deleteChapter(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private genres: Map<number, Genre>;
  private categories: Map<number, Category>;
  private manga: Map<number, Manga>;
  private chapters: Map<number, Chapter>;
  
  private userId: number;
  private genreId: number;
  private categoryId: number;
  private mangaId: number;
  private chapterId: number;
  
  constructor() {
    this.users = new Map();
    this.genres = new Map();
    this.categories = new Map();
    this.manga = new Map();
    this.chapters = new Map();
    
    this.userId = 1;
    this.genreId = 1;
    this.categoryId = 1;
    this.mangaId = 1;
    this.chapterId = 1;
    
    this.initializeData();
  }
  
  private initializeData() {
    // Add admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true
    });
    
    // Add default genres
    const genres = ["Action", "Adventure", "Romance", "Fantasy", "Horror", "Comedy", "Sci-Fi"];
    genres.forEach(genre => this.createGenre({ name: genre }));
    
    // Add default categories
    const categories = ["Shonen", "Seinen", "Shoujo", "Josei"];
    categories.forEach(category => this.createCategory({ name: category }));
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Genre operations
  async getGenres(): Promise<Genre[]> {
    return Array.from(this.genres.values());
  }
  
  async getGenre(id: number): Promise<Genre | undefined> {
    return this.genres.get(id);
  }
  
  async createGenre(insertGenre: InsertGenre): Promise<Genre> {
    const id = this.genreId++;
    const genre: Genre = { ...insertGenre, id };
    this.genres.set(id, genre);
    return genre;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Manga operations
  async getAllManga(): Promise<Manga[]> {
    return Array.from(this.manga.values());
  }
  
  async getFeaturedManga(limit: number = 5): Promise<Manga[]> {
    return Array.from(this.manga.values())
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }
  
  async getTrendingManga(limit: number = 6): Promise<Manga[]> {
    return Array.from(this.manga.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
  
  async getLatestUpdatedManga(limit: number = 4): Promise<{manga: Manga, latestChapter: Chapter}[]> {
    const allChapters = Array.from(this.chapters.values());
    const mangaWithLatestChapter = new Map<number, Chapter>();
    
    // Find latest chapter for each manga
    allChapters.forEach(chapter => {
      const existingChapter = mangaWithLatestChapter.get(chapter.mangaId);
      if (!existingChapter || chapter.chapterNumber > existingChapter.chapterNumber) {
        mangaWithLatestChapter.set(chapter.mangaId, chapter);
      }
    });
    
    // Sort by creation date and limit
    const result = Array.from(mangaWithLatestChapter.entries())
      .map(([mangaId, chapter]) => ({
        manga: this.manga.get(mangaId)!,
        latestChapter: chapter
      }))
      .sort((a, b) => 
        new Date(b.latestChapter.createdAt).getTime() - 
        new Date(a.latestChapter.createdAt).getTime()
      )
      .slice(0, limit);
    
    return result;
  }
  
  async getMangaById(id: number): Promise<Manga | undefined> {
    return this.manga.get(id);
  }
  
  async getMangaWithRelations(id: number): Promise<MangaWithRelations | undefined> {
    const manga = this.manga.get(id);
    if (!manga) return undefined;
    
    const mangaGenres = manga.genreIds.map(gid => this.genres.get(gid)!);
    const mangaCategories = manga.categoryIds.map(cid => this.categories.get(cid)!);
    const mangaChapters = Array.from(this.chapters.values())
      .filter(chapter => chapter.mangaId === id)
      .sort((a, b) => b.chapterNumber - a.chapterNumber);
    
    return {
      manga,
      genres: mangaGenres,
      categories: mangaCategories,
      chapters: mangaChapters
    };
  }
  
  async getMangaByGenre(genreId: number): Promise<Manga[]> {
    return Array.from(this.manga.values())
      .filter(manga => manga.genreIds.includes(genreId));
  }
  
  async getMangaByCategory(categoryId: number): Promise<Manga[]> {
    return Array.from(this.manga.values())
      .filter(manga => manga.categoryIds.includes(categoryId));
  }
  
  async searchManga(query: string): Promise<Manga[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.manga.values())
      .filter(manga => 
        manga.title.toLowerCase().includes(lowercaseQuery) || 
        manga.description.toLowerCase().includes(lowercaseQuery) ||
        manga.author.toLowerCase().includes(lowercaseQuery)
      );
  }
  
  async createManga(insertManga: InsertManga): Promise<Manga> {
    const id = this.mangaId++;
    const manga: Manga = { 
      ...insertManga, 
      id, 
      createdAt: new Date() 
    };
    this.manga.set(id, manga);
    return manga;
  }
  
  async updateManga(id: number, mangaUpdate: Partial<InsertManga>): Promise<Manga | undefined> {
    const manga = this.manga.get(id);
    if (!manga) return undefined;
    
    const updatedManga = { ...manga, ...mangaUpdate };
    this.manga.set(id, updatedManga);
    return updatedManga;
  }
  
  async deleteManga(id: number): Promise<boolean> {
    // Delete all chapters for this manga
    const chaptersToDelete = Array.from(this.chapters.entries())
      .filter(([_, chapter]) => chapter.mangaId === id)
      .map(([chapterId]) => chapterId);
    
    chaptersToDelete.forEach(chapterId => this.chapters.delete(chapterId));
    
    // Delete the manga
    return this.manga.delete(id);
  }
  
  // Chapter operations
  async getChapters(mangaId: number): Promise<Chapter[]> {
    return Array.from(this.chapters.values())
      .filter(chapter => chapter.mangaId === mangaId)
      .sort((a, b) => b.chapterNumber - a.chapterNumber);
  }
  
  async getChapterById(id: number): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }
  
  async getLatestChapters(limit: number = 10): Promise<{manga: Manga, chapter: Chapter}[]> {
    return Array.from(this.chapters.values())
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - 
        new Date(a.createdAt).getTime()
      )
      .slice(0, limit)
      .map(chapter => ({
        manga: this.manga.get(chapter.mangaId)!,
        chapter
      }));
  }
  
  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = this.chapterId++;
    const chapter: Chapter = {
      ...insertChapter,
      id,
      createdAt: new Date()
    };
    this.chapters.set(id, chapter);
    return chapter;
  }
  
  async updateChapter(id: number, chapterUpdate: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const chapter = this.chapters.get(id);
    if (!chapter) return undefined;
    
    const updatedChapter = { ...chapter, ...chapterUpdate };
    this.chapters.set(id, updatedChapter);
    return updatedChapter;
  }
  
  async deleteChapter(id: number): Promise<boolean> {
    return this.chapters.delete(id);
  }
}

export const storage = new MemStorage();
