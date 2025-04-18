import { Link } from "wouter";
import CategoryCard from "@/components/ui/category-card";
import { useQuery } from "@tanstack/react-query";
import { sampleCategories } from "@/lib/data";

export default function FeaturedCategories() {
  // In a real app, we'd fetch from API
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      // Simulating API call with sample data
      return sampleCategories;
    }
  });

  return (
    <section className="py-16 bg-neutral">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark font-heading mb-4">Popular Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Browse our most popular collections and find exactly what your garden needs.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {isLoading ? (
            // Show 6 skeleton loaders while loading
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-36 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            categories?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/shop" className="inline-block px-6 py-3 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition font-semibold">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
