import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/home/FloatingButtons";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { generateProducts } from "@/lib/product-generator";
import StarRating from "@/components/ui/star-rating";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/ui/product-card";

export default function ProductPage() {
  const [match, params] = useRoute("/product/:slug");
  const slug = match ? params?.slug : "";
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product data
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${slug}`],
    queryFn: async () => {
      // Simulating API call - in reality this would be fetching from the server
      const allProducts = generateProducts();
      return allProducts.find((p) => p.slug === slug);
    },
  });

  // Fetch related products
  const { data: relatedProducts, isLoading: relatedLoading } = useQuery({
    queryKey: ['/api/products/related', product?.categoryId],
    enabled: !!product,
    queryFn: async () => {
      // Simulating API call - in reality this would be fetching from the server
      const allProducts = generateProducts();
      return allProducts
        .filter((p) => p.categoryId === product?.categoryId && p.id !== product?.id)
        .slice(0, 4);
    },
  });

  // Update page title when product loads
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - Okkyno Gardening Supplies`;
    } else {
      document.title = "Product - Okkyno Gardening Supplies";
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
      });
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  // Create a gallery view of images
  const productImages = product ? [
    `${product.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`,
    `${product.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80&sat=-100`, // Desaturated version
    `${product.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80&blur=100`, // Blurred version 
    `${product.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80&flip=h`, // Flipped version
  ] : [];

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="py-8 bg-neutral min-h-screen">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="animate-pulse">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2">
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                    <div className="flex mt-4 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-20 h-20 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-8"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="py-8 bg-neutral min-h-screen">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
              <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
              <p className="mb-6">Sorry, the product you're looking for doesn't exist or has been removed.</p>
              <Link href="/shop">
                <a className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition">
                  Continue Shopping
                </a>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="py-8 bg-neutral">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="mb-6 text-sm">
            <Link href="/">
              <a className="text-gray-500 hover:text-primary">Home</a>
            </Link>{" "}
            /{" "}
            <Link href="/shop">
              <a className="text-gray-500 hover:text-primary">Shop</a>
            </Link>{" "}
            /{" "}
            <Link href={`/shop/${product.categoryId === 1 ? 'garden-tools' : product.categoryId === 2 ? 'indoor-plants' : product.categoryId === 3 ? 'vegetable-seeds' : 'planters-pots'}`}>
              <a className="text-gray-500 hover:text-primary">
                {product.categoryId === 1 ? 'Garden Tools' : 
                 product.categoryId === 2 ? 'Indoor Plants' : 
                 product.categoryId === 3 ? 'Vegetable Seeds' : 'Planters & Pots'}
              </a>
            </Link>{" "}
            / <span className="text-gray-700">{product.name}</span>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Product Images */}
              <div className="md:w-1/2">
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
                <div className="flex gap-2 overflow-auto pb-2">
                  {productImages.map((img, idx) => (
                    <div
                      key={idx}
                      className={`cursor-pointer border-2 rounded overflow-hidden ${
                        selectedImage === idx ? "border-primary" : "border-transparent"
                      }`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-20 h-20 object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="md:w-1/2">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={product.rating} size="md" />
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                
                <div className="mb-6">
                  <span className="text-2xl font-bold text-primary">
                    ${product.salePrice?.toFixed(2) || product.price.toFixed(2)}
                  </span>
                  {product.salePrice && (
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-6">{product.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                      <i className={`fas ${product.inStock ? "fa-check-circle" : "fa-times-circle"} mr-1`}></i>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                    
                    {product.isOrganic && (
                      <span className="text-success">
                        <i className="fas fa-leaf mr-1"></i>
                        Organic
                      </span>
                    )}
                    
                    {product.isBestseller && (
                      <span className="text-primary">
                        <i className="fas fa-award mr-1"></i>
                        Bestseller
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-shipping-fast mr-1"></i>
                    Free shipping on orders over $50
                  </div>
                </div>
                
                {/* Quantity selector */}
                <div className="flex items-center mb-6">
                  <span className="mr-4 text-gray-700">Quantity:</span>
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border-r border-gray-300 rounded-l-md"
                      onClick={decrementQuantity}
                      disabled={!product.inStock}
                    >
                      <i className="fas fa-minus text-gray-600"></i>
                    </button>
                    <input
                      type="number"
                      min="1"
                      className="w-16 text-center focus:outline-none"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      disabled={!product.inStock}
                    />
                    <button
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border-l border-gray-300 rounded-r-md"
                      onClick={incrementQuantity}
                      disabled={!product.inStock}
                    >
                      <i className="fas fa-plus text-gray-600"></i>
                    </button>
                  </div>
                </div>
                
                {/* Add to cart button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full shadow-md flex-1"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? (
                      <>
                        <i className="fas fa-shopping-cart mr-2"></i> Add to Cart
                      </>
                    ) : (
                      "Out of Stock"
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="px-4 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-full"
                  >
                    <i className="far fa-heart mr-2"></i> Add to Wishlist
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <Tabs defaultValue="description">
              <TabsList className="w-full border-b mb-6">
                <TabsTrigger value="description" className="text-lg px-6 py-3">Description</TabsTrigger>
                <TabsTrigger value="specifications" className="text-lg px-6 py-3">Specifications</TabsTrigger>
                <TabsTrigger value="reviews" className="text-lg px-6 py-3">Reviews ({product.reviewCount})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  {product.description} Our {product.name} is designed to make your gardening experience easier and more enjoyable.
                </p>
                <p className="mb-4">
                  Whether you're a beginner or experienced gardener, this high-quality product will help you achieve better results in your garden.
                  Made from premium materials, it's built to last and provide years of reliable service.
                </p>
                <p>
                  The ergonomic design ensures comfortable use, reducing strain during prolonged gardening sessions.
                  It's an essential addition to any gardener's toolkit and makes a perfect gift for plant enthusiasts.
                </p>
              </TabsContent>
              
              <TabsContent value="specifications">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Product Details</h3>
                    <ul className="space-y-2">
                      <li className="flex">
                        <span className="font-medium w-32">Item ID:</span>
                        <span className="text-gray-600">{product.id}</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32">Category:</span>
                        <span className="text-gray-600">
                          {product.categoryId === 1 ? 'Garden Tools' : 
                           product.categoryId === 2 ? 'Indoor Plants' : 
                           product.categoryId === 3 ? 'Vegetable Seeds' : 'Planters & Pots'}
                        </span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32">Availability:</span>
                        <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32">Rating:</span>
                        <span className="text-gray-600">
                          {product.rating} out of 5
                        </span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Shipping Information</h3>
                    <ul className="space-y-2">
                      <li className="flex">
                        <span className="font-medium w-32">Delivery:</span>
                        <span className="text-gray-600">3-5 business days</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32">Shipping:</span>
                        <span className="text-gray-600">Free over $50</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32">Returns:</span>
                        <span className="text-gray-600">30-day return policy</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32">Warranty:</span>
                        <span className="text-gray-600">1 year manufacturer warranty</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      <div className="text-5xl font-bold text-gray-800">{product.rating.toFixed(1)}</div>
                      <div className="text-sm text-gray-500">out of 5</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center">
                            <span className="text-sm w-6">{star}</span>
                            <div className="w-full bg-gray-200 h-2 mx-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-yellow-400 h-full" 
                                style={{ width: `${Math.random() * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {Math.floor(Math.random() * product.reviewCount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Write a Review
                  </Button>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-6">
                  {/* Sample reviews */}
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <img 
                            src={`https://images.unsplash.com/photo-${1500000000000 + idx}?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80`} 
                            alt="Reviewer" 
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <h4 className="font-semibold">Customer {idx + 1}</h4>
                            <p className="text-xs text-gray-500">Verified Purchase</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(2023, 0, 1 + idx * 30).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mb-2">
                        <StarRating rating={5 - idx * 0.5} />
                      </div>
                      <h5 className="font-semibold mb-2">
                        {idx === 0 ? "Excellent quality and value" : 
                         idx === 1 ? "Good product but shipping was slow" : 
                         "Does what it needs to do"}
                      </h5>
                      <p className="text-gray-700">
                        {idx === 0 ? 
                          "I'm really impressed with this product. The quality is excellent and it's exactly what I needed for my garden. Highly recommend!" : 
                          idx === 1 ? 
                          "The product itself is good quality and works well. However, shipping took longer than expected. Otherwise, I'm satisfied with my purchase." : 
                          "This product does what it's supposed to do. Nothing extraordinary but gets the job done."}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                  >
                    Load More Reviews
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            
            {relatedLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                      <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse mb-3"></div>
                      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts?.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
