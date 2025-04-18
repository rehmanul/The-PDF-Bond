import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { Category } from "../../../shared/schema";

export default function CategoryShowcase() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Explore By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No categories case
  if (!categories || categories.length === 0) {
    return null;
  }

  // Only display up to 6 categories
  const displayCategories = categories.slice(0, 6);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Explore By Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our carefully curated plant categories for your perfect garden
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {displayCategories.map((category) => (
            <Link key={category.id} href={`/products/category/${category.slug}`}>
              <div className="text-center transition-all hover:transform hover:scale-105 cursor-pointer">
                <div className="bg-light rounded-lg aspect-square mb-3 overflow-hidden">
                  {category.imageUrl ? (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-primary/10">
                      <span className="text-4xl text-primary">🌿</span>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-center">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center">
          <Button asChild variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            <Link href="/products">View All Categories</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}