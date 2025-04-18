import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";

export default function CategoryShowcase() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  if (isLoading) {
    return (
      <section className="py-12 bg-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Are You Looking For?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="h-40 bg-gray-200 animate-pulse"></div>
                <div className="p-3 text-center">
                  <div className="h-5 bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What Are You Looking For?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories?.slice(0, 6).map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <a className="category-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group">
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={category.imageUrl} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-semibold text-dark">{category.name}</h3>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
