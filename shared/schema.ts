import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  provider: text("provider"), // 'local', 'google', 'facebook', 'twitter'
  providerId: text("provider_id"),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  avatarUrl: true,
  provider: true,
  providerId: true,
  isAdmin: true,
});

// Genres table
export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertGenreSchema = createInsertSchema(genres).pick({
  name: true,
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

// Manga table
export const manga = pgTable("manga", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  author: text("author").notNull(),
  coverImage: text("cover_image").notNull(),
  rating: integer("rating").default(0),
  status: text("status").notNull(), // "ongoing" or "completed"
  genreIds: jsonb("genre_ids").notNull().$type<number[]>(),
  categoryIds: jsonb("category_ids").notNull().$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMangaSchema = createInsertSchema(manga).omit({
  id: true,
  createdAt: true,
});

// Chapters table
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  mangaId: integer("manga_id").notNull(),
  title: text("title").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  pages: jsonb("pages").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  mangaId: integer("manga_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Genre = typeof genres.$inferSelect;
export type InsertGenre = z.infer<typeof insertGenreSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Manga = typeof manga.$inferSelect;
export type InsertManga = z.infer<typeof insertMangaSchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Extended schemas with manga data and related entities
export const mangaWithRelationsSchema = z.object({
  manga: z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    author: z.string(),
    coverImage: z.string(),
    rating: z.number(),
    status: z.string(),
    genreIds: z.array(z.number()),
    categoryIds: z.array(z.number()),
    createdAt: z.date(),
  }),
  genres: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })),
  categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })),
  chapters: z.array(z.object({
    id: z.number(),
    title: z.string(),
    chapterNumber: z.number(),
    createdAt: z.date(),
  })),
  comments: z.array(z.object({
    id: z.number(),
    userId: z.number(),
    content: z.string(),
    createdAt: z.date(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
  })).optional(),
});

export type MangaWithRelations = z.infer<typeof mangaWithRelationsSchema>;
