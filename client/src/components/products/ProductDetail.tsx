import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Minus, 
  Plus, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react';
import { Product, Category } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatters';
import { Link } from 'wouter';

interface ProductDetailProps {
  productSlug: string;
}

export default function ProductDetail({ productSlug }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Fetch product details
  const { data: product, isLoading: productLoading, error: productError } = useQuery<Product>({
    queryKey: [`/api/products/slug/${productSlug}`],
  });

  // Fetch category if product is loaded
  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${product?.categoryId}`],
    enabled: !!product,
  });

  const isLoading = productLoading || (product && categoryLoading);
  const error = productError;

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to your cart`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not add product to cart",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (product) {
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite ? `${product.name} removed from your favorites` : `${product.name} added to your favorites`,
      });
    }
  };

  const increaseQuantity = () => {
    setQuantity(q => q + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(q => (q > 1 ? q - 1 : 1));
  };

  // Get all product images
  const getProductImages = (): string[] => {
    if (!product) return [];
    
    const images = [];
    
    if (product.imageUrl) {
      images.push(product.imageUrl);
    }
    
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      images.push(...product.imageUrls);
    }
    
    // If no images, use a placeholder
    if (images.length === 0) {
      images.push("https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80");
    }
    
    return images;
  };

  const productImages = getProductImages();
  const activeImage = productImages[activeImageIndex];

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image section */}
          <div>
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>
          
          {/* Product info section */}
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-36 mb-6" />
            <Skeleton className="h-7 w-32 mb-4" />
            <Skeleton className="h-28 w-full mb-6" />
            <div className="flex items-center space-x-3 mb-6">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="border-t border-b py-4 mb-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Error loading product. Please try again later.</p>
        <Link href="/products">
          <Button className="mt-4" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6 text-sm text-gray-500">
        <Link href="/">Home</Link> / {" "}
        <Link href="/products">Products</Link> / {" "}
        {category && (
          <>
            <Link href={`/products/category/${category.slug}`}>{category.name}</Link> / {" "}
          </>
        )}
        <span className="text-gray-700">{product.name}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image section */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden border">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-auto aspect-square object-contain p-4"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {productImages.map((image, index) => (
              <div 
                key={index}
                className={`border rounded-md overflow-hidden cursor-pointer ${
                  index === activeImageIndex ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img 
                  src={image} 
                  alt={`${product.name} - view ${index + 1}`} 
                  className="w-full h-full aspect-square object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Product info section */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">{product.name}</h1>
          <div className="flex items-center mb-4">
            <div className="flex text-secondary mr-2">
              <Rating value={product.rating || 0} max={5} readonly />
            </div>
            <span className="text-sm text-gray-600">
              {product.reviewCount || 0} reviews
            </span>
            {product.stock > 0 ? (
              <span className="ml-4 text-success text-sm">In Stock</span>
            ) : (
              <span className="ml-4 text-error text-sm">Out of Stock</span>
            )}
          </div>
          
          <div className="mb-6">
            <span className="text-2xl font-semibold text-primary">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-gray-500 line-through ml-2">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700">{product.shortDescription || product.description}</p>
          </div>
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={decreaseQuantity} 
                disabled={quantity <= 1}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={increaseQuantity}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 gap-2" 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleFavorite}
              className={isFavorite ? "text-primary" : ""}
            >
              <Heart className={isFavorite ? "fill-primary" : ""} />
            </Button>
          </div>
          
          <div className="border-t border-b py-4 mb-6">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-primary mr-2" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <span>30-day satisfaction guarantee</span>
              </div>
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-primary mr-2" />
                <span>Easy 30-day returns and exchanges</span>
              </div>
            </div>
          </div>
          
          {/* Social sharing */}
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-3">Share:</span>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.441 16.892c-2.102.144-6.784.144-8.883 0-2.276-.156-2.541-1.27-2.558-4.892.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0 2.277.156 2.541 1.27 2.559 4.892-.018 3.629-.285 4.736-2.559 4.892zm-6.441-7.234l4.917 2.338-4.917 2.346v-4.684z" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product details tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="mb-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details & Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="p-4 bg-white rounded-lg">
            {product.description ? (
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p className="text-gray-600">No description available for this product.</p>
            )}
          </TabsContent>
          <TabsContent value="details" className="p-4 bg-white rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Product Specifications</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">SKU</span>
                    <span>{product.sku}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span>{category?.name || 'Uncategorized'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Stock</span>
                    <span>{product.stock} units</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Additional Information</h3>
                <p className="text-gray-600">
                  For complete care instructions and detailed product information, 
                  please refer to the product description or contact our customer support.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="p-4 bg-white rounded-lg">
            <h3 className="font-semibold mb-2">Shipping Policy</h3>
            <p className="mb-4">
              We offer free standard shipping on all orders over $50. Orders typically ship within 
              1-2 business days and arrive within 3-7 business days depending on your location.
            </p>
            
            <h3 className="font-semibold mb-2">Return Policy</h3>
            <p>
              If you're not completely satisfied with your purchase, you can return it within 
              30 days of receipt for a full refund or exchange. Please note that items must be 
              returned in their original condition and packaging.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
