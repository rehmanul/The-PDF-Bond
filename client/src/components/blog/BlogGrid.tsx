import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlogPost } from '@shared/schema';
import BlogCard from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

const PAGE_SIZE = 9;

export default function BlogGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  
  // Fetch blog posts
  const { data: allPosts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });
  
  // Filter posts by search query
  const filterPosts = (posts: BlogPost[]) => {
    if (!searchQuery.trim() || !searching) return posts;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(lowercaseQuery) || 
      (post.excerpt && post.excerpt.toLowerCase().includes(lowercaseQuery)) ||
      post.content.toLowerCase().includes(lowercaseQuery)
    );
  };
  
  // Sort posts by date (newest first)
  const sortPosts = (posts: BlogPost[]) => {
    return [...posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };
  
  // Apply filters and pagination
  const filteredPosts = allPosts ? filterPosts(allPosts) : [];
  const sortedPosts = sortPosts(filteredPosts);
  const totalPosts = sortedPosts.length;
  const totalPages = Math.ceil(totalPosts / PAGE_SIZE);
  const displayedPosts = sortedPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setCurrentPage(1);
  };
  
  // Reset search
  const resetSearch = () => {
    setSearchQuery('');
    setSearching(false);
    setCurrentPage(1);
  };
  
  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-4 w-24 mr-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !allPosts) {
    return (
      <div className="text-center py-8">
        <p>Error loading blog posts. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex max-w-md">
          <Input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-r-none"
          />
          <Button type="submit" className="rounded-l-none">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
        
        {searching && (
          <div className="mt-2 flex items-center">
            <p className="text-sm">
              {totalPosts} {totalPosts === 1 ? 'result' : 'results'} for "{searchQuery}"
            </p>
            <Button 
              variant="link" 
              className="text-sm p-0 h-auto ml-2"
              onClick={resetSearch}
            >
              Clear search
            </Button>
          </div>
        )}
      </div>
      
      {/* Blog grid */}
      {totalPosts === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searching 
              ? `No posts found matching "${searchQuery}". Try a different search term.` 
              : 'No blog posts available yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    onClick={() => goToPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
