import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { insertBlogPostSchema } from '@shared/schema';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { slugify } from '@/utils/formatters';
import { useAuth } from '@/context/AuthContext';

// Extend the insert schema with validation rules
const blogFormSchema = insertBlogPostSchema.extend({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters" }),
  excerpt: z.string().optional(),
  imageUrl: z.string().optional(),
  published: z.boolean().default(false),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

interface BlogFormProps {
  postId?: number;
}

export default function BlogForm({ postId }: BlogFormProps) {
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Fetch blog post if in edit mode
  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/blog/${postId}`],
    enabled: !!postId,
  });
  
  const isEditMode = !!postId;
  
  // Form setup
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      authorId: user?.id || 1, // Default to current user or first user (admin)
      published: false,
    },
  });
  
  // Update form with post data when available
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || '',
        imageUrl: post.imageUrl || '',
        authorId: post.authorId,
        published: post.published,
      });
    } else if (user) {
      form.setValue('authorId', user.id);
    }
  }, [post, form, user]);
  
  // Handle form submission - create post
  const createMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      const response = await apiRequest('POST', '/api/blog', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create blog post');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Blog Post Created",
        description: "The blog post has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      setLocation('/admin/blog');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission - update post
  const updateMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      const response = await apiRequest('PUT', `/api/blog/${postId}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update blog post');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Blog Post Updated",
        description: "The blog post has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      queryClient.invalidateQueries({ queryKey: [`/api/blog/${postId}`] });
      setLocation('/admin/blog');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: BlogFormValues) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues('title');
    if (!title) {
      toast({
        title: "Error",
        description: "Please enter a title first",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingSlug(true);
    const slug = slugify(title);
    form.setValue('slug', slug);
    setIsGeneratingSlug(false);
  };
  
  // Loading state
  if (isEditMode && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter blog post title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      placeholder="blog-post-slug" 
                      {...field} 
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateSlug}
                    disabled={isGeneratingSlug}
                  >
                    Generate
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Image URL */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Published Status */}
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Published</FormLabel>
                  <div className="text-sm text-gray-500">
                    Make this post visible to the public
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Excerpt */}
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief summary of the blog post" 
                  className="resize-none" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your blog post content here. HTML is supported." 
                  className="min-h-[300px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Author ID (hidden) */}
        <FormField
          control={form.control}
          name="authorId"
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : isEditMode ? "Update Post" : "Create Post"}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setLocation('/admin/blog')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
