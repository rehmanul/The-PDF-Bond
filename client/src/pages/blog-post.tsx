import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { BlogPost, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Helmet } from 'react-helmet';
import { ArrowLeft } from "lucide-react";

export default function BlogPostPage() {
  const [match, params] = useRoute("/blog/:slug");
  const [, setLocation] = useLocation();
  
  const { data: post, isLoading: postLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog/slug", params?.slug],
    enabled: !!params?.slug,
  });
  
  // Get author information
  const { data: author, isLoading: authorLoading } = useQuery<User>({
    queryKey: ["/api/users", post?.authorId],
    enabled: !!post?.authorId,
  });
  
  // Fetch related blog posts
  const { data: relatedData } = useQuery<{ posts: BlogPost[] }>({
    queryKey: ["/api/blog", { limit: 3 }],
    enabled: !!post,
  });
  
  const relatedPosts = relatedData?.posts.filter(p => p.id !== post?.id).slice(0, 3) || [];
  
  // Redirect to blog page if slug is not found or invalid
  useEffect(() => {
    if (!postLoading && !post && error) {
      setLocation("/blog");
    }
  }, [post, postLoading, error, setLocation]);
  
  if (postLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{post.title} | Okkyno Blog</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation("/blog")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
        
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center text-gray-600 mb-6">
              <span className="mr-4">
                <i className="far fa-calendar mr-1"></i> 
                {post.publishedAt ? formatDate(post.publishedAt) : "Draft"}
              </span>
              <span>
                <i className="far fa-comment mr-1"></i> 
                {post.commentCount} {post.commentCount === 1 ? "Comment" : "Comments"}
              </span>
            </div>
            
            <div className="rounded-lg overflow-hidden mb-8">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          </header>
          
          <div 
            className="prose max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white mr-4">
                <span className="text-lg font-bold">
                  {author?.firstName?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {author ? `${author.firstName} ${author.lastName}` : "Author"}
                </h3>
                <p className="text-gray-600">
                  Garden enthusiast and expert contributor
                </p>
              </div>
            </div>
          </div>
        </article>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card 
                  key={relatedPost.id} 
                  className="overflow-hidden hover:shadow-md transition"
                >
                  <a href={`/blog/${relatedPost.slug}`}>
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={relatedPost.imageUrl} 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold hover:text-primary transition line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2">
                        {relatedPost.publishedAt ? formatDate(relatedPost.publishedAt) : "Draft"}
                      </p>
                    </CardContent>
                  </a>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
