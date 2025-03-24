import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MangaForm from "@/components/admin/MangaForm";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const EditManga = () => {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/admin/manga/edit/:id");
  const mangaId = match ? parseInt(params.id) : 0;
  
  const { toast } = useToast();
  
  // Check for admin authorization
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/me"],
  });
  
  // Fetch manga data
  const { data: mangaData, isLoading: isMangaLoading, isError } = useQuery({
    queryKey: [`/api/manga/${mangaId}`],
    enabled: !!mangaId,
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
  
  const isLoading = isUserLoading || isMangaLoading;
  
  if (isLoading) {
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
  
  if (isError || !mangaData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Manga Not Found</h2>
            <p className="text-muted-foreground mb-6">The manga you are trying to edit doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/admin")}>Return to Dashboard</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Edit className="h-6 w-6 mr-2 text-primary" />
              <div>
                <CardTitle>Edit Manga</CardTitle>
                <CardDescription>
                  Editing {mangaData.manga.title}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <MangaForm editId={mangaId} />
      </main>
      
      <Footer />
    </div>
  );
};

export default EditManga;
