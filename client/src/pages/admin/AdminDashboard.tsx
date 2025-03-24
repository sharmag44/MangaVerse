import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAllManga } from "@/hooks/use-manga";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, 
  Trash2, 
  MoreVertical, 
  Plus, 
  Search, 
  BookOpen, 
  Filter, 
  ShieldCheck 
} from "lucide-react";
import { useGenres, useCategories } from "@/hooks/use-manga";
import { format } from "date-fns";

const AdminDashboard = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check for admin authorization
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/me"],
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mangaToDelete, setMangaToDelete] = useState<number | null>(null);
  
  const { data: allManga, isLoading: isMangaLoading } = useAllManga();
  const { data: genres } = useGenres();
  const { data: categories } = useCategories();
  
  // Filter manga based on search query
  const filteredManga = allManga?.filter(manga => 
    manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manga.author.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Delete manga mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/manga/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manga"] });
      toast({
        title: "Manga deleted successfully",
        duration: 3000,
      });
      setMangaToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete manga",
        description: error.message || "There was an error deleting the manga.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });
  
  // Redirect non-admin users
  useEffect(() => {
    if (!isUserLoading && (!userData || !userData.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
        duration: 5000,
      });
      navigate("/");
    }
  }, [userData, isUserLoading, navigate, toast]);
  
  if (isUserLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1">
          <Skeleton className="h-10 w-1/3 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!userData || !userData.isAdmin) {
    return null; // Will be redirected by the useEffect
  }
  
  const handleDeleteClick = (id: number) => {
    setMangaToDelete(id);
  };
  
  const confirmDelete = () => {
    if (mangaToDelete) {
      deleteMutation.mutate(mangaToDelete);
    }
  };
  
  // Get genre and category names for a manga
  const getMangaGenres = (manga: any) => {
    if (!genres) return [];
    return manga.genreIds
      .map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean);
  };
  
  const getMangaCategories = (manga: any) => {
    if (!categories) return [];
    return manga.categoryIds
      .map(id => categories.find(c => c.id === id)?.name)
      .filter(Boolean);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <ShieldCheck className="mr-2 h-6 w-6 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage manga content and chapters</p>
          </div>
          
          <Button asChild>
            <Link href="/admin/manga/add">
              <Plus className="mr-2 h-4 w-4" /> Add New Manga
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue="manga">
          <TabsList className="mb-6">
            <TabsTrigger value="manga">Manga</TabsTrigger>
            <TabsTrigger value="genres">Genres & Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manga">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <CardTitle>Manga Library</CardTitle>
                    <CardDescription>
                      {filteredManga.length} manga in the database
                    </CardDescription>
                  </div>
                  
                  <div className="relative w-full md:w-64">
                    <Input
                      placeholder="Search manga..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {isMangaLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : filteredManga.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead className="hidden md:table-cell">Genres</TableHead>
                          <TableHead className="hidden lg:table-cell">Status</TableHead>
                          <TableHead className="hidden lg:table-cell">Added</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredManga.map((manga) => (
                          <TableRow key={manga.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-8 rounded-sm overflow-hidden flex-shrink-0">
                                  <img 
                                    src={manga.coverImage} 
                                    alt={manga.title} 
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                {manga.title}
                              </div>
                            </TableCell>
                            <TableCell>{manga.author}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getMangaGenres(manga).slice(0, 2).join(", ")}
                              {getMangaGenres(manga).length > 2 && "..."}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell capitalize">
                              {manga.status}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {format(new Date(manga.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/manga/${manga.id}`}>
                                      <BookOpen className="mr-2 h-4 w-4" />
                                      <span>View</span>
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/manga/edit/${manga.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      <span>Edit</span>
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick(manga.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No manga found matching your search.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="genres">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Genres</CardTitle>
                  <CardDescription>
                    Manage genre categories for manga
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {genres ? (
                      <div className="grid grid-cols-2 gap-2">
                        {genres.map(genre => (
                          <div key={genre.id} className="flex items-center p-2 border rounded-md">
                            <span>{genre.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Skeleton className="h-32 w-full" />
                    )}
                    
                    <Button variant="outline" className="w-full mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Genre
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Manage categories for manga classification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories ? (
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map(category => (
                          <div key={category.id} className="flex items-center p-2 border rounded-md">
                            <span>{category.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Skeleton className="h-32 w-full" />
                    )}
                    
                    <Button variant="outline" className="w-full mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={mangaToDelete !== null} onOpenChange={(open) => !open && setMangaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this manga and all its chapters.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
