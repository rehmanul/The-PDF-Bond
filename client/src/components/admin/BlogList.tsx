import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { BlogPost } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  Edit, 
  MoreHorizontal, 
  Trash2, 
  Plus, 
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatShortDate, truncateText } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';

export default function BlogList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch blog posts
  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
    queryFn: async () => {
      const response = await fetch('/api/blog?publishedOnly=false');
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    }
  });
  
  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/blog/${id}`, undefined);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete blog post');
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Blog Post Deleted",
        description: "The blog post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleteModalOpen(false);
    }
  });
  
  // Toggle publish status mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: number, published: boolean }) => {
      const response = await apiRequest('PUT', `/api/blog/${id}`, { published });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update blog post');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Status Updated",
        description: "The blog post status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter posts by search term
  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle post deletion
  const handleDeletePost = (id: number) => {
    setSelectedPostId(id);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedPostId) {
      deleteMutation.mutate(selectedPostId);
    }
  };
  
  // Navigate to edit post
  const handleEditPost = (id: number) => {
    setLocation(`/admin/blog/edit/${id}`);
  };
  
  // Toggle post publish status
  const handleTogglePublish = (id: number, currentStatus: boolean) => {
    togglePublishMutation.mutate({ id, published: !currentStatus });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Blog Posts</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Post
          </Button>
        </div>
        <div className="w-full h-12 bg-gray-100 animate-pulse rounded-md mb-4" />
        <div className="w-full h-64 bg-gray-100 animate-pulse rounded-md" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading blog posts. Please try again later.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/blog'] })} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Post
          </Button>
        </Link>
      </div>
      
      {/* Search */}
      <div className="relative w-full md:w-1/3 mb-4">
        <Input
          type="text"
          placeholder="Search blog posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {/* Blog posts table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-start gap-3">
                      {post.imageUrl && (
                        <div className="h-12 w-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div>{post.title}</div>
                        {post.excerpt && (
                          <div className="text-sm text-gray-500 mt-1">
                            {truncateText(post.excerpt, 60)}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={post.published} 
                      onCheckedChange={() => handleTogglePublish(post.id, post.published)}
                      disabled={togglePublishMutation.isPending}
                    />
                  </TableCell>
                  <TableCell>{formatShortDate(post.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPost(post.id)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePublish(post.id, post.published)}>
                          {post.published ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" /> Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" /> Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-500"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {searchTerm ? "No posts match your search." : "No blog posts available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              blog post and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
