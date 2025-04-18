import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductDetail from "@/components/products/ProductDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetailPage() {
  const [match, params] = useRoute("/products/:slug");
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/slug/${params?.slug}`],
    enabled: !!params?.slug,
  });
  
  // If route doesn't match or no slug parameter
  if (!match || !params?.slug) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-heading font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">The product you're looking for could not be found.</p>
        <Link href="/products">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> View All Products
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
            ? "Loading Product... | Okkyno"
            : product
              ? `${product.name} | Okkyno`
              : "Product Not Found | Okkyno"}
        </title>
        <meta 
          name="description" 
          content={product?.shortDescription || "View product details, specifications, and purchase options."} 
        />
      </Helmet>
      
      <ProductDetail productSlug={params.slug} />
    </>
  );
}
