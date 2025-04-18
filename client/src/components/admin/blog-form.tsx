import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertBlogPostSchema, BlogPost, User } from "@shared/schema";
import { useNavigate } from "wouter";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { generateSlug } from "@/lib/utils";
import { AlertCircle, Loader2, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context";

const validationSchema = insertBlogPostSchema.extend({
  authorId: z.number(),
  publishedAt: z.preprocess(
    // Handle date conversion
    (val) => val === "" ? undefined : val,
    z.string().optional()
  ),
});

type FormValues = z.infer<typeof validationSchema>;

interface BlogFormProps {
  post?: BlogPost;
  isEdit?: boolean;
}

export default function BlogForm({ post, isEdit = false }: BlogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useNavigate();
  const { user } = useAuth();
  
  // Initialize form with post data if editing
  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: isEdit && post
      ? {
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          imageUrl: post.imageUrl,
          authorId: post.authorId,
          publishedAt: post.publishedAt 
            ? new Date(post.publishedAt).toISOString().split('T')[0] 
            : undefined,
          isFeatured: post.isFeatured,
        }
      : {
          title: "",
          slug: "",
          content: "",
          excerpt: "",
          imageUrl: "",
          authorId: user?.id || 1,
          publishedAt: new Date().toISOString().split('T')[0],
          isFeatured: false,
        }
  });
  
  // Generate slug from title
  const generateSlugFromTitle = () => {
    const title = form.getValues("title");
    if (title) {
      form.setValue("slug", generateSlug(title));
    }
  };
  
  // Generate excerpt from content
  const generateExcerptFromContent = () => {
    const content = form.getValues("content");
    if (content) {
      const plainText = content.replace(/<[^>]+>/g, '');
      const excerpt = plainText.slice(0, 160) + (plainText.length > 160 ? '...' : '');
      form.setValue("excerpt", excerpt);
    }
  };
  
  // Create or update blog post
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (isEdit && post) {
        // Update existing post
        await apiRequest("PUT", `/api/blog/${post.id}`, values);
        toast({
          title: "Blog post updated",
          description: "The blog post has been updated successfully",
        });
      } else {
        // Create new post
        await apiRequest("POST", "/api/blog", values);
        toast({
          title: "Blog post created",
          description: "The blog post has been created successfully",
        });
      }
      
      // Invalidate blog posts cache and redirect
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      navigate("/admin/blog");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred while saving the blog post";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title*</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter blog post title" 
                          onChange={(e) => {
                            field.onChange(e);
                            if (!isEdit || !post) {
                              setTimeout(generateSlugFromTitle, 300);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug*</FormLabel>
                      <div className="flex">
                        <FormControl>
                          <Input {...field} placeholder="blog-post-slug" />
                        </FormControl>
                        {!isEdit && (
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-2"
                            onClick={generateSlugFromTitle}
                          >
                            Generate
                          </Button>
                        )}
                      </div>
                      <FormDescription>
                        Used in the URL. Must be unique and contain only letters, numbers, and hyphens.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL*</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="https://example.com/image.jpg" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publication Date</FormLabel>
                      <div className="flex">
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className="ml-2"
                          onClick={() => field.onChange(new Date().toISOString().split('T')[0])}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormDescription>
                        Leave empty to save as draft
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Post</FormLabel>
                        <FormDescription>
                          Display this post on the home page and featured sections
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt*</FormLabel>
                      <div className="flex flex-col">
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Brief summary of the post"
                            className="h-24"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 self-end"
                          onClick={generateExcerptFromContent}
                        >
                          Generate from Content
                        </Button>
                      </div>
                      <FormDescription>
                        A brief summary displayed in blog listings (max 160 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content*</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Full blog post content"
                      className="min-h-[300px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Supports HTML for formatting. You can add headings, lists, links, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/blog")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Post" : "Publish Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
