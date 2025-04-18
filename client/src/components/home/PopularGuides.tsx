import { Link } from "wouter";
import BlogCard from "@/components/ui/blog-card";
import { useQuery } from "@tanstack/react-query";
import { sampleBlogPosts } from "@/lib/data";

export default function PopularGuides() {
  // In a real app, we'd fetch from API
  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['/api/blog/featured'],
    queryFn: async () => {
      // Simulating API call with sample data
      return sampleBlogPosts;
    }
  });

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark font-heading mb-4">Gardening Guides & Tips</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Nurture your green thumb with expert advice and step-by-step tutorials.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {isLoading ? (
            // Show 3 skeleton loaders while loading
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-neutral rounded-xl overflow-hidden shadow-sm h-full">
                <div className="h-52 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mr-2"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            blogPosts?.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/blog" className="inline-block px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-full transition">
            View All Guides
          </Link>
        </div>
      </div>
    </section>
  );
}
