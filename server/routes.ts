import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertGenreSchema, 
  insertCategorySchema, 
  insertMangaSchema, 
  insertChapterSchema 
} from "@shared/schema";
import session from "express-session";
import { z } from "zod";

// Middleware for checking admin status
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.session as any;
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  next();
};

// Middleware for checking authentication
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.session as any;
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "manga-verse-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 }
    })
  );

  // User Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      };
      
      return res.status(200).json({ 
        id: user.id, 
        username: user.username, 
        isAdmin: user.isAdmin 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser({
        ...userData,
        isAdmin: false // Prevent users from registering as admin
      });
      
      (req.session as any).user = {
        id: newUser.id,
        username: newUser.username,
        isAdmin: newUser.isAdmin
      };
      
      return res.status(201).json({ 
        id: newUser.id, 
        username: newUser.username,
        isAdmin: newUser.isAdmin
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", (req, res) => {
    const user = (req.session as any).user;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json(user);
  });
  
  // Genre Routes
  app.get("/api/genres", async (req, res) => {
    try {
      const genres = await storage.getGenres();
      res.status(200).json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });
  
  app.post("/api/genres", requireAdmin, async (req, res) => {
    try {
      const genreData = insertGenreSchema.parse(req.body);
      const newGenre = await storage.createGenre(genreData);
      res.status(201).json(newGenre);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid genre data", errors: error.errors });
      }
      console.error("Error creating genre:", error);
      res.status(500).json({ message: "Failed to create genre" });
    }
  });
  
  // Category Routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  // Manga Routes
  app.get("/api/manga", async (req, res) => {
    try {
      const manga = await storage.getAllManga();
      res.status(200).json(manga);
    } catch (error) {
      console.error("Error fetching manga:", error);
      res.status(500).json({ message: "Failed to fetch manga" });
    }
  });
  
  app.get("/api/manga/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const featuredManga = await storage.getFeaturedManga(limit);
      res.status(200).json(featuredManga);
    } catch (error) {
      console.error("Error fetching featured manga:", error);
      res.status(500).json({ message: "Failed to fetch featured manga" });
    }
  });
  
  app.get("/api/manga/trending", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const trendingManga = await storage.getTrendingManga(limit);
      res.status(200).json(trendingManga);
    } catch (error) {
      console.error("Error fetching trending manga:", error);
      res.status(500).json({ message: "Failed to fetch trending manga" });
    }
  });
  
  app.get("/api/manga/latest", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const latestManga = await storage.getLatestUpdatedManga(limit);
      res.status(200).json(latestManga);
    } catch (error) {
      console.error("Error fetching latest manga:", error);
      res.status(500).json({ message: "Failed to fetch latest manga" });
    }
  });
  
  app.get("/api/manga/genre/:genreId", async (req, res) => {
    try {
      const genreId = parseInt(req.params.genreId);
      if (isNaN(genreId)) {
        return res.status(400).json({ message: "Invalid genre ID" });
      }
      
      const manga = await storage.getMangaByGenre(genreId);
      res.status(200).json(manga);
    } catch (error) {
      console.error("Error fetching manga by genre:", error);
      res.status(500).json({ message: "Failed to fetch manga by genre" });
    }
  });
  
  app.get("/api/manga/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const manga = await storage.getMangaByCategory(categoryId);
      res.status(200).json(manga);
    } catch (error) {
      console.error("Error fetching manga by category:", error);
      res.status(500).json({ message: "Failed to fetch manga by category" });
    }
  });
  
  app.get("/api/manga/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await storage.searchManga(query);
      res.status(200).json(results);
    } catch (error) {
      console.error("Error searching manga:", error);
      res.status(500).json({ message: "Failed to search manga" });
    }
  });
  
  app.get("/api/manga/:id", async (req, res) => {
    try {
      const mangaId = parseInt(req.params.id);
      if (isNaN(mangaId)) {
        return res.status(400).json({ message: "Invalid manga ID" });
      }
      
      const manga = await storage.getMangaWithRelations(mangaId);
      if (!manga) {
        return res.status(404).json({ message: "Manga not found" });
      }
      
      res.status(200).json(manga);
    } catch (error) {
      console.error("Error fetching manga details:", error);
      res.status(500).json({ message: "Failed to fetch manga details" });
    }
  });
  
  app.post("/api/manga", requireAdmin, async (req, res) => {
    try {
      const mangaData = insertMangaSchema.parse(req.body);
      const newManga = await storage.createManga(mangaData);
      res.status(201).json(newManga);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid manga data", errors: error.errors });
      }
      console.error("Error creating manga:", error);
      res.status(500).json({ message: "Failed to create manga" });
    }
  });
  
  app.put("/api/manga/:id", requireAdmin, async (req, res) => {
    try {
      const mangaId = parseInt(req.params.id);
      if (isNaN(mangaId)) {
        return res.status(400).json({ message: "Invalid manga ID" });
      }
      
      const mangaData = insertMangaSchema.partial().parse(req.body);
      const updatedManga = await storage.updateManga(mangaId, mangaData);
      
      if (!updatedManga) {
        return res.status(404).json({ message: "Manga not found" });
      }
      
      res.status(200).json(updatedManga);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid manga data", errors: error.errors });
      }
      console.error("Error updating manga:", error);
      res.status(500).json({ message: "Failed to update manga" });
    }
  });
  
  app.delete("/api/manga/:id", requireAdmin, async (req, res) => {
    try {
      const mangaId = parseInt(req.params.id);
      if (isNaN(mangaId)) {
        return res.status(400).json({ message: "Invalid manga ID" });
      }
      
      const success = await storage.deleteManga(mangaId);
      if (!success) {
        return res.status(404).json({ message: "Manga not found" });
      }
      
      res.status(200).json({ message: "Manga deleted successfully" });
    } catch (error) {
      console.error("Error deleting manga:", error);
      res.status(500).json({ message: "Failed to delete manga" });
    }
  });
  
  // Chapter Routes
  app.get("/api/manga/:mangaId/chapters", async (req, res) => {
    try {
      const mangaId = parseInt(req.params.mangaId);
      if (isNaN(mangaId)) {
        return res.status(400).json({ message: "Invalid manga ID" });
      }
      
      const chapters = await storage.getChapters(mangaId);
      res.status(200).json(chapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });
  
  app.get("/api/chapters/latest", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const latestChapters = await storage.getLatestChapters(limit);
      res.status(200).json(latestChapters);
    } catch (error) {
      console.error("Error fetching latest chapters:", error);
      res.status(500).json({ message: "Failed to fetch latest chapters" });
    }
  });
  
  app.get("/api/chapters/:id", async (req, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      if (isNaN(chapterId)) {
        return res.status(400).json({ message: "Invalid chapter ID" });
      }
      
      const chapter = await storage.getChapterById(chapterId);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      res.status(200).json(chapter);
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ message: "Failed to fetch chapter" });
    }
  });
  
  app.post("/api/chapters", requireAdmin, async (req, res) => {
    try {
      const chapterData = insertChapterSchema.parse(req.body);
      
      // Validate that manga exists
      const manga = await storage.getMangaById(chapterData.mangaId);
      if (!manga) {
        return res.status(404).json({ message: "Manga not found" });
      }
      
      const newChapter = await storage.createChapter(chapterData);
      res.status(201).json(newChapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chapter data", errors: error.errors });
      }
      console.error("Error creating chapter:", error);
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });
  
  app.put("/api/chapters/:id", requireAdmin, async (req, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      if (isNaN(chapterId)) {
        return res.status(400).json({ message: "Invalid chapter ID" });
      }
      
      const chapterData = insertChapterSchema.partial().parse(req.body);
      const updatedChapter = await storage.updateChapter(chapterId, chapterData);
      
      if (!updatedChapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      res.status(200).json(updatedChapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chapter data", errors: error.errors });
      }
      console.error("Error updating chapter:", error);
      res.status(500).json({ message: "Failed to update chapter" });
    }
  });
  
  app.delete("/api/chapters/:id", requireAdmin, async (req, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      if (isNaN(chapterId)) {
        return res.status(400).json({ message: "Invalid chapter ID" });
      }
      
      const success = await storage.deleteChapter(chapterId);
      if (!success) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      res.status(200).json({ message: "Chapter deleted successfully" });
    } catch (error) {
      console.error("Error deleting chapter:", error);
      res.status(500).json({ message: "Failed to delete chapter" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
