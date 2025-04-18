import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, ArrowLeftRight, Truck, Calendar, Shield } from "lucide-react";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Fetch related products
  const { data: relatedProductsData } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/products", { categoryId: product.categoryId, limit: 4 }],
  });
  
  const relatedProducts = relatedProductsData?.products.filter(p => p.id !== product.id).slice(0, 4) || [];
  
  const handleAddToCart = () => {
    setIsAddingToCart(true);
    
    addToCart({
      productId: product.id,
      quantity
    }).then(() => {
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }).finally(() => {
      setIsAddingToCart(false);
    });
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isFavorite ? "removed from" : "added to"} your wishlist.`,
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <Carousel className="w-full max-w-md mx-auto">
            <CarouselContent>
              {product.imageUrls.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="h-80 md:h-96 overflow-hidden rounded-lg">
                    <img 
                      src={image} 
                      alt={`${product.name} - Image ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          
          {/* Thumbnail Navigation */}
          <div className="flex justify-center space-x-2 mt-4">
            {product.imageUrls.map((image, index) => (
              <button
                key={index}
                className="w-16 h-16 rounded-md overflow-hidden border-2 border-transparent hover:border-primary transition"
                onClick={() => {
                  // In a real implementation, this would control the Carousel
                }}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* Product Info */}
        <div>
          {product.isBestSeller && (
            <Badge variant="secondary" className="mb-2">BEST SELLER</Badge>
          )}
          
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {/* Ratings */}
          {product.rating !== undefined && (
            <div className="flex items-center mb-4">
              <div className="flex text-[#f8b042]">
                {Array(Math.floor(product.rating)).fill(0).map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
                {product.rating % 1 >= 0.5 && <i className="fas fa-star-half-alt"></i>}
                {Array(5 - Math.ceil(product.rating)).fill(0).map((_, i) => (
                  <i key={i} className="far fa-star"></i>
                ))}
              </div>
              <span className="text-gray-600 ml-2">
                {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
          
          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-gray-500 line-through ml-3">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          
          {/* Short Description */}
          <p className="text-gray-600 mb-6">{product.description.split('.')[0]}.</p>
          
          {/* Add to Cart */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-8">
            <div className="w-full sm:w-1/3">
              <Select
                value={quantity.toString()} 
                onValueChange={(value) => setQuantity(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Quantity" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full sm:w-2/3 bg-primary hover:bg-primary/90"
              size="lg"
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isAddingToCart ? "Adding..." : product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
          
          {/* Secondary Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleFavorite}
            >
              <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
              {isFavorite ? "Added to Wishlist" : "Add to Wishlist"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Compare
            </Button>
          </div>
          
          {/* Product Meta */}
          <div className="border-t border-b py-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Truck className="text-primary mr-2" />
                <span>Free shipping over $75</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="text-primary mr-2" />
                <span>Delivery in 2-5 business days</span>
              </div>
              
              <div className="flex items-center">
                <ShoppingCart className="text-primary mr-2" />
                <span>{product.stock > 0 ? 'In stock' : 'Out of stock'}</span>
              </div>
              
              <div className="flex items-center">
                <Shield className="text-primary mr-2" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b mb-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="prose max-w-none">
            <p>{product.description}</p>
          </TabsContent>
          
          <TabsContent value="specifications">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-b pb-2">
                <span className="font-semibold">SKU:</span> 
                <span className="ml-2">PROD-{product.id}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-semibold">Category:</span> 
                <span className="ml-2">Category {product.categoryId}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-semibold">Stock:</span> 
                <span className="ml-2">{product.stock} units</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-semibold">Weight:</span> 
                <span className="ml-2">1.2 kg</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="text-center py-8">
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div 
                key={relatedProduct.id} 
                className="border rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <a href={`/product/${relatedProduct.slug}`}>
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={relatedProduct.imageUrls[0]} 
                      alt={relatedProduct.name} 
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-1">{relatedProduct.name}</h3>
                    <div className="mt-2">
                      <span className="text-primary font-semibold">
                        {formatPrice(relatedProduct.price)}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
