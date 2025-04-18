import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "../../../shared/schema";

export default function FeaturedProducts() {
  const [visibleProducts, setVisibleProducts] = useState(8);
  
  // Query for featured products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  // Function to handle showing more products
  const showMoreProducts = () => {
    setVisibleProducts((prev) => prev + 8);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No products case
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our expert-selected gardening essentials, designed to help your garden thrive
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, visibleProducts).map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="h-full transition-all hover:shadow-lg cursor-pointer">
                <div className="aspect-square relative overflow-hidden">
                  {product.comparePrice && product.comparePrice > product.price && (
                    <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600">
                      Sale
                    </Badge>
                  )}
                  
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <span className="text-white font-medium text-lg">Out of Stock</span>
                    </div>
                  )}
                  
                  <img 
                    src={product.imageUrl || "https://images.unsplash.com/photo-1624398146237-35f5a407958d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"} 
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center mb-1">
                    {product.rating > 0 && (
                      <div className="flex text-yellow-400 text-sm mr-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.floor(product.rating) ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                    )}
                    {product.reviewCount > 0 && (
                      <span className="text-xs text-gray-500">({product.reviewCount})</span>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-lg text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                  
                  {product.shortDescription && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.shortDescription}</p>
                  )}
                </CardContent>
                
                <CardFooter className="px-4 py-3 border-t flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-semibold text-lg">${product.price.toFixed(2)}</span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-gray-500 line-through text-sm ml-2">
                        ${product.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    View
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
        
        {products.length > visibleProducts && (
          <div className="text-center mt-10">
            <Button 
              onClick={showMoreProducts}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Show More Products
            </Button>
          </div>
        )}
        
        <div className="text-center mt-8">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}