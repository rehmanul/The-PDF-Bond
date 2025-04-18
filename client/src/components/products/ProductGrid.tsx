import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
  categoryId?: number;
  searchQuery?: string;
}

const PAGE_SIZE = 12;

export default function ProductGrid({ categoryId, searchQuery }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  
  // Construct queryKey based on filters
  const queryKey = categoryId 
    ? [`/api/products/category/${categoryId}`] 
    : searchQuery 
      ? [`/api/products/search?q=${searchQuery}`]
      : ['/api/products'];
      
  const { data, isLoading, error } = useQuery<Product[]>({
    queryKey,
  });
  
  // Sort products
  const sortProducts = (products: Product[]) => {
    if (!products) return [];
    
    const sortedProducts = [...products];
    
    switch (sortOption) {
      case 'price-low-high':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'rating':
        return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'alphabetical':
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      default: // newest
        return sortedProducts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };
  
  // Calculate pagination
  const sortedProducts = data ? sortProducts(data) : [];
  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  
  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-6 w-40" />
          </div>
          <div>
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <Skeleton className="h-60 w-full rounded-md mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !data) {
    return (
      <div className="text-center py-8">
        <p>Error loading products. Please try again later.</p>
      </div>
    );
  }
  
  // Empty state
  if (totalProducts === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <p className="text-gray-600">Showing {Math.min(totalProducts, PAGE_SIZE)} of {totalProducts} products</p>
        </div>
        <div>
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low-high">Price: Low to High</SelectItem>
              <SelectItem value="price-high-low">Price: High to Low</SelectItem>
              <SelectItem value="rating">Best Rating</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
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
    </div>
  );
}
