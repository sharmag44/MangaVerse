
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { insertChapterSchema } from "@shared/schema";

const AddChapter = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentType, setContentType] = useState<'images' | 'pdf'>('images');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const files = formData.getAll('files');
      
      // Upload files first
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: fileFormData,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        const { url } = await response.json();
        return url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Create chapter
      const chapterData = {
        mangaId: parseInt(formData.get('mangaId') as string),
        title: formData.get('title') as string,
        chapterNumber: parseInt(formData.get('chapterNumber') as string),
        contentType,
        content: contentType === 'images' 
          ? { images: uploadedUrls }
          : { pdfUrl: uploadedUrls[0] }
      };
      
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapterData),
      });
      
      if (!response.ok) throw new Error('Failed to create chapter');
      
      toast({
        title: "Success",
        description: "Chapter created successfully",
      });
      
      navigate(`/manga/${chapterData.mangaId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chapter",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Add New Chapter</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="chapterNumber">Chapter Number</Label>
          <Input id="chapterNumber" name="chapterNumber" type="number" required />
        </div>
        
        <Tabs value={contentType} onValueChange={(value) => setContentType(value as 'images' | 'pdf')}>
          <TabsList>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="pdf">PDF</TabsTrigger>
          </TabsList>
          
          <TabsContent value="images">
            <div className="space-y-2">
              <Label htmlFor="images">Upload Images</Label>
              <Input
                id="images"
                name="files"
                type="file"
                accept="image/*"
                multiple
                required={contentType === 'images'}
              />
              <p className="text-sm text-muted-foreground">
                Upload multiple images in the correct page order
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="pdf">
            <div className="space-y-2">
              <Label htmlFor="pdf">Upload PDF</Label>
              <Input
                id="pdf"
                name="files"
                type="file"
                accept=".pdf"
                required={contentType === 'pdf'}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Chapter"}
        </Button>
      </form>
    </div>
  );
};

export default AddChapter;
