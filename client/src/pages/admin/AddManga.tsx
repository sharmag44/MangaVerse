import { useEffect } from "react";
import { useLocation } from "wouter";
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
import { PlusCircle } from "lucide-react";

const AddManga = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Check for admin authorization
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/me"],
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <PlusCircle className="h-6 w-6 mr-2 text-primary" />
              <div>
                <CardTitle>Add New Manga</CardTitle>
                <CardDescription>
                  Create a new manga entry in the database
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <MangaForm />
      </main>
      
      <Footer />
    </div>
  );
};

export default AddManga;
