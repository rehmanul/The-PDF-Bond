import { BlogPost } from "@shared/schema";
import BlogCard from "./blog-card";
import { Pagination } from "@/components/ui/pagination";

interface BlogGridProps {
  posts: BlogPost[];
  isLoading: boolean;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
}

export default function BlogGrid({ posts, isLoading, pagination, onPageChange }: BlogGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-200 animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-200 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 animate-pulse mb-4"></div>
              <div className="h-4 bg-gray-200 animate-pulse w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold mb-2">No blog posts found</h3>
        <p className="text-gray-600">
          Check back later for new content or try a different search.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
      
      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.First 
                  onClick={() => onPageChange?.(1)} 
                  isDisabled={pagination.page === 1}
                />
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Previous 
                  onClick={() => onPageChange?.(pagination.page - 1)} 
                  isDisabled={pagination.page === 1}
                />
              </Pagination.Item>
              
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.pages || 
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                )
                .map((page, i, array) => {
                  // Add ellipsis
                  if (i > 0 && page - array[i - 1] > 1) {
                    return (
                      <Pagination.Item key={`ellipsis-${page}`}>
                        <Pagination.Ellipsis />
                      </Pagination.Item>
                    );
                  }
                  
                  return (
                    <Pagination.Item key={page}>
                      <Pagination.Link 
                        isActive={page === pagination.page}
                        onClick={() => onPageChange?.(page)}
                      >
                        {page}
                      </Pagination.Link>
                    </Pagination.Item>
                  );
                })}
              
              <Pagination.Item>
                <Pagination.Next 
                  onClick={() => onPageChange?.(pagination.page + 1)} 
                  isDisabled={pagination.page === pagination.pages}
                />
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Last 
                  onClick={() => onPageChange?.(pagination.pages)} 
                  isDisabled={pagination.page === pagination.pages}
                />
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      )}
    </div>
  );
}
