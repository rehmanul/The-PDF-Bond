import { useState } from 'react';
import { Link } from 'wouter';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { Product } from '@shared/schema';
import { formatPrice } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add product to cart",
        variant: "destructive"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? `${product.name} removed from your favorites` : `${product.name} added to your favorites`,
    });
  };

  return (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition relative group">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white rounded-full p-2 shadow-sm hover:text-primary transition"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={isFavorite ? "fill-primary text-primary" : ""} />
        </Button>
      </div>
      
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-60 overflow-hidden">
          <img 
            src={product.imageUrl || "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          
          {product.featured && (
            <div className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
              FEATURED
            </div>
          )}
          
          {product.comparePrice && product.comparePrice > product.price && (
            <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
              SALE
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-heading font-semibold text-lg leading-tight">{product.name}</h3>
          </div>
          <div className="flex items-center mb-2">
            <div className="flex text-secondary">
              <Rating value={product.rating || 0} max={5} readonly />
            </div>
            <span className="text-sm text-gray-600 ml-1">({product.reviewCount || 0})</span>
          </div>
          <div className="mb-4">
            <span className="text-lg font-semibold text-primary">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </Link>
    </div>
  );
}
