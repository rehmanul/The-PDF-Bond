import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import BlogGrid from "@/components/blog/BlogGrid";

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title>Blog | Okkyno</title>
        <meta 
          name="description" 
          content="Explore gardening tips, plant care guides, and expert advice on our gardening blog." 
        />
      </Helmet>
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage>Blog</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Gardening Blog</h1>
          <p className="text-gray-600">Explore our latest articles, tips, and guides for your gardening journey.</p>
        </div>
        
        {/* Featured post (optional) */}
        {/* <div className="mb-10">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-64 md:h-auto">
                <img 
                  src="https://images.unsplash.com/photo-1527069438729-2eb562e7c9e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                  alt="Featured post" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <span className="text-primary font-semibold mb-2">Featured Article</span>
                <h2 className="text-2xl font-heading font-bold mb-3">
                  How to Create a Sustainable Garden That Thrives Year-Round
                </h2>
                <p className="text-gray-600 mb-4">
                  Learn the essential techniques for building a garden that's not only beautiful but also environmentally friendly and productive through all seasons.
                </p>
                <Link href="/blog/sustainable-garden-guide">
                  <a className="text-primary font-semibold hover:underline">Read More →</a>
                </Link>
              </div>
            </div>
          </div>
        </div> */}
        
        {/* Blog grid */}
        <BlogGrid />
      </main>
    </>
  );
}
