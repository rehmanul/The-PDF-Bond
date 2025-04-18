import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, Calendar, User, MessageSquare, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import { BlogPost, User as UserType } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { formatDate, getInitials } from '@/utils/formatters';
import BlogCard from '@/components/blog/BlogCard';

interface BlogDetailProps {
  postSlug: string;
}

export default function BlogDetail({ postSlug }: BlogDetailProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch blog post
  const { data: post, isLoading: postLoading, error: postError } = useQuery<BlogPost>({
    queryKey: [`/api/blog/slug/${postSlug}`],
  });
  
  // Fetch author if post is loaded
  const { data: author, isLoading: authorLoading } = useQuery<UserType>({
    queryKey: [`/api/users/${post?.authorId}`],
    enabled: !!post,
  });
  
  // Fetch related posts
  const { data: relatedPosts, isLoading: relatedLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
    enabled: !!post,
    select: (data) => {
      if (!post) return [];
      // Get 3 posts that aren't the current one
      return data
        .filter(p => p.id !== post.id)
        .sort(() => 0.5 - Math.random()) // Shuffle for random selection
        .slice(0, 3);
    }
  });
  
  const isLoading = postLoading || (post && authorLoading);
  const error = postError;
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast({
        title: "Comment is empty",
        description: "Please enter a comment before submitting",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to leave a comment",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted for review",
      });
      setComment('');
      setIsSubmitting(false);
    }, 1000);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" className="mb-4 text-gray-500">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Button>
            <div className="space-y-4">
              <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-4xl mx-auto">
          <p>Error loading blog post. Please try again later.</p>
          <Link href="/blog">
            <Button className="mt-4" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-4 text-gray-500">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
        </Link>
        
        {/* Post header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center text-gray-600 mb-6">
            <span className="flex items-center mr-6">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(post.createdAt)}
            </span>
            
            <span className="flex items-center mr-6">
              <User className="h-4 w-4 mr-2" />
              {author?.firstName && author?.lastName 
                ? `${author.firstName} ${author.lastName}`
                : author?.username || 'Unknown Author'}
            </span>
            
            <span className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              {post.commentCount} Comments
            </span>
          </div>
          
          {/* Featured image */}
          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden mb-8">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-auto"
              />
            </div>
          )}
        </header>
        
        {/* Post content */}
        <div className="prose max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />
        
        {/* Share links */}
        <div className="flex items-center mb-12">
          <span className="text-gray-600 mr-4">Share this post:</span>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Separator className="mb-8" />
        
        {/* Author box */}
        {author && (
          <div className="bg-light p-6 rounded-lg flex flex-col md:flex-row items-center mb-12">
            <Avatar className="h-20 w-20 mb-4 md:mb-0 md:mr-6">
              <AvatarImage src="/placeholder-avatar.jpg" alt={author.username} />
              <AvatarFallback>{getInitials(author.firstName || author.username)}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-2">
                {author.firstName && author.lastName 
                  ? `${author.firstName} ${author.lastName}`
                  : author.username}
              </h3>
              <p className="text-gray-600">
                Gardening enthusiast and plant expert. Sharing tips and advice to help your garden thrive.
              </p>
            </div>
          </div>
        )}
        
        {/* Related posts */}
        {!relatedLoading && relatedPosts && relatedPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-heading font-bold mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <BlogCard key={relatedPost.id} post={relatedPost} variant="compact" />
              ))}
            </div>
          </div>
        )}
        
        {/* Comments section */}
        <div>
          <h2 className="text-2xl font-heading font-bold mb-6">Comments ({post.commentCount})</h2>
          
          {/* Comment form */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
            <form onSubmit={handleCommentSubmit}>
              <Textarea
                placeholder="Write your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4"
                rows={4}
                disabled={isSubmitting || !user}
              />
              <div className="flex justify-between items-center">
                {!user && (
                  <p className="text-sm text-gray-500">
                    Please <Link href="/login"><a className="text-primary">login</a></Link> to leave a comment
                  </p>
                )}
                <Button 
                  type="submit" 
                  className="ml-auto"
                  disabled={isSubmitting || !user}
                >
                  {isSubmitting ? "Submitting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Sample comments - in a real app, these would be fetched from API */}
          <div className="space-y-6">
            {post.commentCount > 0 ? (
              <>
                <div className="flex">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src="https://randomuser.me/api/portraits/women/42.jpg" alt="Jessica Smith" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <h4 className="font-semibold">Jessica Smith</h4>
                        <span className="text-xs text-gray-500 ml-2">3 days ago</span>
                      </div>
                      <p className="text-gray-700">
                        This is such a helpful article! I've been struggling with my garden and these tips are exactly what I needed.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src="https://randomuser.me/api/portraits/men/57.jpg" alt="Michael Johnson" />
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <h4 className="font-semibold">Michael Johnson</h4>
                        <span className="text-xs text-gray-500 ml-2">1 week ago</span>
                      </div>
                      <p className="text-gray-700">
                        I tried these methods in my own garden and the results have been amazing. Thank you for sharing your expertise!
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
