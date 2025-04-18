import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "@shared/schema";
import BlogGrid from "@/components/blog/blog-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Helmet } from 'react-helmet';

type BlogResponse = {
  posts: BlogPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery<BlogResponse>({
    queryKey: ["/api/blog", { 
      search: activeSearch,
      page,
      limit: 9
    }],
  });
  
  const posts = data?.posts || [];
  const pagination = data?.pagination;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
    setPage(1); // Reset to first page on new search
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  return (
    <main className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Blog | Okkyno - Gardening Tips & Advice</title>
        <meta name="description" content="Explore our gardening blog for expert tips, plant care guides, and inspiration for your garden. Learn from our experienced gardeners." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Gardening Blog</h1>
        <p className="text-lg text-gray-600 mb-6">
          Expert tips, guides, and inspiration for gardeners of all levels
        </p>
        
        <form onSubmit={handleSearch} className="max-w-lg mx-auto relative">
          <Input
            type="text"
            placeholder="Search for articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            disabled={isLoading}
          >
            <Search className="h-5 w-5" />
          </Button>
        </form>
      </div>
      
      {activeSearch && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold">
            Search results for: <span className="text-primary">"{activeSearch}"</span>
          </h2>
          <Button
            variant="link"
            onClick={() => {
              setActiveSearch("");
              setSearchQuery("");
              setPage(1);
            }}
            className="text-sm"
          >
            Clear search
          </Button>
        </div>
      )}
      
      <BlogGrid
        posts={posts}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </main>
  );
}
