import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import MangaDetail from "@/pages/MangaDetail";
import ReadChapter from "@/pages/ReadChapter";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AddManga from "@/pages/admin/AddManga";
import EditManga from "@/pages/admin/EditManga";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/manga/:id" component={MangaDetail} />
      <Route path="/manga/:mangaId/chapter/:chapterId" component={ReadChapter} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/manga/add" component={AddManga} />
      <Route path="/admin/manga/edit/:id" component={EditManga} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="manga-verse-theme">
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
