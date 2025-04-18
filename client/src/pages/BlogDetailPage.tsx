import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "@shared/schema";
import BlogDetail from "@/components/blog/BlogDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function BlogDetailPage() {
  const [match, params] = useRoute("/blog/:slug");
  
  // Fetch blog post
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog/slug/${params?.slug}`],
    enabled: !!params?.slug,
  });
  
  // If route doesn't match or no slug parameter
  if (!match || !params?.slug) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-heading font-bold mb-4">Blog Post Not Found</h1>
        <p className="mb-6">The blog post you're looking for could not be found.</p>
        <Link href="/blog">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> View All Blog Posts
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>
          {isLoading
            ? "Loading Blog Post... | Okkyno"
            : post
              ? `${post.title} | Okkyno Blog`
              : "Blog Post Not Found | Okkyno"}
        </title>
        <meta 
          name="description" 
          content={post?.excerpt || "Read our latest gardening article with tips and advice."} 
        />
      </Helmet>
      
      <BlogDetail postSlug={params.slug} />
    </>
  );
}
