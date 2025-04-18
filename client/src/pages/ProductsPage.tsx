import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { Category, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilter, { FilterOptions } from "@/components/products/ProductFilter";
import { useSearch } from "@/context/SearchContext";
import { Helmet } from "react-helmet";
import { ChevronLeft } from "lucide-react";

export default function ProductsPage() {
  // Check if we're on a category page or search page
  const [, paramsProducts] = useRoute("/products/category/:slug");
  const [, paramsCategory] = useRoute("/category/:slug");
  const params = paramsProducts || paramsCategory; // Use whichever route matched
  const [location] = useLocation();
  const { searchQuery, searchResults } = useSearch();
  
  // State for active category
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>();
  
  // State for filters
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 1000],
    rating: null,
    inStock: false,
    onSale: false
  });
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch active category if we're on a category page
  const { data: activeCategory } = useQuery<Category>({
    queryKey: [`/api/categories/slug/${params?.slug}`],
    enabled: !!params?.slug,
  });
  
  // Set active category when it loads
  useEffect(() => {
    if (activeCategory) {
      setActiveCategoryId(activeCategory.id);
      setFilters(prev => ({
        ...prev,
        categories: [activeCategory.id]
      }));
    }
  }, [activeCategory]);
  
  // Parse search query from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const query = searchParams.get('search');
    if (query) {
      // The search query is already processed by the SearchContext
    }
  }, [location]);
  
  // Filter products based on category or search
  const getPageTitle = () => {
    if (params?.slug && activeCategory) {
      return activeCategory.name;
    }
    if (searchQuery) {
      return `Search Results: ${searchQuery}`;
    }
    return "All Products";
  };
  
  // Get page description
  const getPageDescription = () => {
    if (params?.slug && activeCategory) {
      return activeCategory.description || `Browse our selection of ${activeCategory.name.toLowerCase()}.`;
    }
    if (searchQuery) {
      return `Search results for "${searchQuery}"`;
    }
    return "Explore our wide range of gardening products, from plants and seeds to tools and accessories.";
  };
  
  return (
    <>
      <Helmet>
        <title>{getPageTitle()} | Okkyno</title>
        <meta name="description" content={getPageDescription()} />
      </Helmet>
      
      <main className="container mx-auto px-4 py-8">
        {/* Simple Breadcrumbs */}
        <nav className="flex mb-6 text-sm">
          <Link href="/" className="text-gray-600 hover:text-primary">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/products" className="text-gray-600 hover:text-primary">Products</Link>
          
          {activeCategory && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-primary">{activeCategory.name}</span>
            </>
          )}
          
          {searchQuery && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-primary">Search: {searchQuery}</span>
            </>
          )}
        </nav>
        
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">{getPageTitle()}</h1>
          <p className="text-gray-600">{getPageDescription()}</p>
        </div>
        
        {/* Back button for search results */}
        {searchQuery && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-[100px]">
              <h2 className="text-lg font-semibold mb-4">Filter Products</h2>
              <ProductFilter 
                onFilterChange={setFilters}
                initialFilters={{
                  categories: activeCategoryId ? [activeCategoryId] : [],
                }}
              />
            </div>
          </div>
          
          {/* Product grid */}
          <div className="flex-grow">
            <ProductGrid 
              categoryId={activeCategoryId}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </main>
    </>
  );
}
