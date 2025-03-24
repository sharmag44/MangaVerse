import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { insertMangaSchema } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Checkbox,
  CheckboxItem,
} from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Genre, Category, Manga } from "@shared/schema";

// Extended validation schema
const formSchema = insertMangaSchema.extend({
  // Ensure coverImage is a valid URL
  coverImage: z.string().url({ message: "Please enter a valid image URL" }),
  // Add extra validation for other fields if needed
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
});

interface MangaFormProps {
  editId?: number;
  defaultValues?: Partial<z.infer<typeof formSchema>>;
}

const MangaForm = ({ editId, defaultValues }: MangaFormProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch genres and categories
  const { data: genres = [] } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch manga data if editing
  const { data: mangaData, isLoading: isFetchingManga } = useQuery<{manga: Manga}>({
    queryKey: [`/api/manga/${editId}`],
    enabled: !!editId,
  });
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      author: "",
      coverImage: "",
      rating: 0,
      status: "ongoing",
      genreIds: [],
      categoryIds: [],
    },
  });
  
  // Update form values when manga data is loaded for editing
  useEffect(() => {
    if (editId && mangaData?.manga) {
      form.reset({
        title: mangaData.manga.title,
        description: mangaData.manga.description,
        author: mangaData.manga.author,
        coverImage: mangaData.manga.coverImage,
        rating: mangaData.manga.rating,
        status: mangaData.manga.status,
        genreIds: mangaData.manga.genreIds,
        categoryIds: mangaData.manga.categoryIds,
      });
    }
  }, [editId, mangaData, form]);
  
  // Mutations for creating/updating manga
  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("POST", "/api/manga", data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manga"] });
      toast({
        title: "Manga created successfully",
        description: "The manga has been added to the database.",
      });
      navigate("/admin");
    },
    onError: (error) => {
      toast({
        title: "Error creating manga",
        description: error.message || "There was an error creating the manga.",
        variant: "destructive",
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("PUT", `/api/manga/${editId}`, data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manga"] });
      queryClient.invalidateQueries({ queryKey: [`/api/manga/${editId}`] });
      toast({
        title: "Manga updated successfully",
        description: "The manga information has been updated.",
      });
      navigate("/admin");
    },
    onError: (error) => {
      toast({
        title: "Error updating manga",
        description: error.message || "There was an error updating the manga.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  if (editId && isFetchingManga) {
    return <p>Loading manga data...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manga title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter author name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter cover image URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a valid URL to an image for the manga cover.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter manga description" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (0-5)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="5" 
                        step="0.1" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="hiatus">Hiatus</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="genreIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Genres</FormLabel>
                      <FormDescription>
                        Select the genres for this manga.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {genres.map((genre) => (
                        <FormField
                          key={genre.id}
                          control={form.control}
                          name="genreIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={genre.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(genre.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = [...(field.value || [])];
                                      if (checked) {
                                        field.onChange([...currentValue, genre.id]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter((value) => value !== genre.id)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {genre.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoryIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Categories</FormLabel>
                      <FormDescription>
                        Select the categories for this manga.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <FormField
                          key={category.id}
                          control={form.control}
                          name="categoryIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={category.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(category.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = [...(field.value || [])];
                                      if (checked) {
                                        field.onChange([...currentValue, category.id]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter((value) => value !== category.id)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {category.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin")}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editId ? "Update Manga" : "Create Manga"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MangaForm;
