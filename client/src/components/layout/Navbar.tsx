import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  BookOpen, 
  Search, 
  LogOut, 
  LogIn,
  Menu,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

type NavbarProps = {
  toggleSidebar?: () => void;
};

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user from query client cache
  const currentUser = queryClient.getQueryData<{ id: number; username: string; isAdmin: boolean }>(["/api/auth/me"]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      queryClient.setQueryData(["/api/auth/me"], null);
      toast({
        title: "Logged out successfully",
        duration: 3000,
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            {isMobile && toggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden text-muted-foreground hover:text-foreground focus:outline-none"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold tracking-wider font-['Bebas_Neue']">
                MANGA<span className="text-primary">VERSE</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-6 font-medium">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/browse" className="text-muted-foreground hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/browse?sort=latest" className="text-muted-foreground hover:text-primary transition-colors">
              Latest
            </Link>
            <Link href="/browse?sort=popular" className="text-muted-foreground hover:text-primary transition-colors">
              Popular
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden md:block w-64">
              <Input
                type="text"
                placeholder="Search manga..."
                className="w-full py-2 px-4 bg-background border border-border rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent hover:text-accent-foreground">
              <BookOpen className="h-5 w-5" />
            </Button>
            
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent hover:text-accent-foreground">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {currentUser.username}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {currentUser.isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                <LogIn className="mr-2 h-4 w-4" />
                <span>Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
