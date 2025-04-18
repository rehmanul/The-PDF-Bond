import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useState } from "react";
import { Heart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    addToCart({
      productId: product.id,
      quantity: 1
    }).finally(() => {
      setIsAddingToCart(false);
    });
  };
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  return (
    <Card className="product-card overflow-hidden hover:shadow-lg transition relative group">
      <div className="absolute top-2 right-2 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-white rounded-full p-2 shadow-sm hover:text-primary transition"
          onClick={toggleFavorite}
          aria-label="Add to favorites"
        >
          <Heart 
            size={18} 
            className={isFavorite ? "fill-primary text-primary" : ""}
          />
        </Button>
      </div>
      
      <Link href={`/product/${product.slug}`}>
        <div className="relative h-60 overflow-hidden">
          <img 
            src={product.imageUrls[0]} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {product.isBestSeller && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2"
            >
              BEST SELLER
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
          </div>
          
          {(product.rating !== undefined && product.rating > 0) && (
            <div className="flex items-center mb-2">
              <div className="flex text-[#f8b042]">
                {Array(Math.floor(product.rating)).fill(0).map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
                {product.rating % 1 >= 0.5 && <i className="fas fa-star-half-alt"></i>}
                {Array(5 - Math.ceil(product.rating)).fill(0).map((_, i) => (
                  <i key={i} className="far fa-star"></i>
                ))}
              </div>
              {product.reviewCount !== undefined && (
                <span className="text-sm text-gray-600 ml-1">({product.reviewCount})</span>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <span className="text-lg font-semibold text-primary">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded transition"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock <= 0}
          >
            {isAddingToCart ? "Adding..." : product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}
