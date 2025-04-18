import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Product } from "@shared/schema";
import ProductDetails from "@/components/products/product-details";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from 'react-helmet';

export default function ProductDetailPage() {
  const [match, params] = useRoute("/product/:slug");
  const [, setLocation] = useLocation();
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products/slug", params?.slug],
    enabled: !!params?.slug,
  });
  
  // Redirect to products page if slug is not found or invalid
  useEffect(() => {
    if (!isLoading && !product && error) {
      setLocation("/products");
    }
  }, [product, isLoading, error, setLocation]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product image skeleton */}
          <Skeleton className="h-80 md:h-96 w-full rounded-lg" />
          
          {/* Product info skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <div className="flex space-x-4">
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-12 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div>
      <Helmet>
        <title>{product.name} | Okkyno</title>
        <meta name="description" content={product.description.slice(0, 160)} />
      </Helmet>
      
      <ProductDetails product={product} />
    </div>
  );
}
