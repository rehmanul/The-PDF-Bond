import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "../../../shared/schema";

export default function FeaturedBlogs() {
  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const response = await fetch("/api/blog?limit=3&publishedOnly=true");
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }
      return response.json();
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">From Our Blog</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No blog posts case
  if (!blogPosts || blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Garden Wisdom & Inspiration</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Expert tips, plant guides, and creative ideas to help your garden flourish
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="h-full transition-all hover:shadow-md cursor-pointer overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.imageUrl || "https://images.unsplash.com/photo-1598901847978-4ce242253a8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80"} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                
                <CardContent className="p-5">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>
                      {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "Recently"}
                    </span>
                    {post.commentCount > 0 && (
                      <span className="ml-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        {post.commentCount}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-xl mb-2 line-clamp-2">{post.title}</h3>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 line-clamp-3 mb-3">{post.excerpt}</p>
                  )}
                </CardContent>
                
                <CardFooter className="px-5 py-4 border-t">
                  <Button
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0"
                  >
                    Read More →
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-10 space-y-4">
          <Button asChild variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            <Link href="/blog">View All Articles</Link>
          </Button>
          
          <div className="mt-8 p-4 bg-green-50 rounded-lg max-w-xl mx-auto">
            <h3 className="text-lg font-medium mb-2">Try Our New AI Garden Assistant</h3>
            <p className="text-sm text-gray-600 mb-3">
              Get personalized plant care advice and product recommendations powered by Perplexity AI
            </p>
            <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
              <Link href="/ai-assistant">Ask the AI Assistant</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}