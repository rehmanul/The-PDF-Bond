import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Product } from "@shared/schema";
import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from 'react-helmet';

type ProductsResponse = {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export default function ProductsPage() {
  const [, params] = useRoute("/category/:slug");
  const categorySlug = params?.slug;
  const [, setLocation] = useLocation();
  
  const [filters, setFilters] = useState({
    categoryId: 0,
    page: 1,
    limit: 12,
    search: "",
    featured: false,
    bestseller: false,
    minPrice: 0,
    maxPrice: 100,
  });
  
  // Fetch category ID if category slug is provided
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!categorySlug,
  });
  
  // Update filter when category is fetched
  useEffect(() => {
    if (categorySlug && categories) {
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        setFilters(prev => ({
          ...prev,
          categoryId: category.id,
        }));
      }
    }
  }, [categorySlug, categories]);
  
  // Fetch products based on filters
  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ["/api/products", { 
      category: filters.categoryId || undefined,
      featured: filters.featured || undefined,
      bestseller: filters.bestseller || undefined,
      search: filters.search || undefined,
      page: filters.page,
      limit: filters.limit,
    }],
  });
  
  const products = data?.products || [];
  const pagination = data?.pagination;
  
  // Get category name for title
  const categoryName = categorySlug && categories 
    ? categories.find(cat => cat.slug === categorySlug)?.name 
    : "All Products";
  
  // Apply filters
  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({
      ...prev,
      page: 1, // Reset to first page on filter change
      ...newFilters,
    }));
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };
  
  return (
    <main className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{categoryName ? `${categoryName} | Okkyno` : 'All Products | Okkyno'}</title>
        <meta name="description" content={`Browse our selection of ${categoryName || 'garden products'} - high-quality plants, tools, and accessories for your garden.`} />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{categoryName || "All Products"}</h1>
        {pagination && (
          <p className="text-gray-600 mt-2">
            Showing {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters 
            initialFilters={{
              categories: filters.categoryId ? [filters.categoryId] : [],
              price: [filters.minPrice, filters.maxPrice],
              features: [
                ...(filters.featured ? ["Featured"] : []),
                ...(filters.bestseller ? ["Best Seller"] : []),
              ],
              search: filters.search,
            }}
            onFilterChange={(newFilters) => {
              handleFilterChange({
                categoryId: newFilters.categories[0] || 0,
                search: newFilters.search,
                featured: newFilters.features.includes("Featured"),
                bestseller: newFilters.features.includes("Best Seller"),
                minPrice: newFilters.price[0],
                maxPrice: newFilters.price[1],
              });
            }}
            maxPrice={100}
          />
        </div>
        
        {/* Product grid */}
        <div className="lg:col-span-3">
          <ProductGrid 
            products={products}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </main>
  );
}
