import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import StarRating from "./star-rating";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product.id, 1);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div 
      className="group bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative">
          <div className="h-56 overflow-hidden">
            <img 
              src={`${product.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80`} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}
            />
          </div>
          <div className="absolute top-2 right-2 flex space-x-1">
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition">
              <i className="far fa-heart text-dark text-sm"></i>
            </button>
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition">
              <i className="fas fa-search text-dark text-sm"></i>
            </button>
          </div>
          {product.salePrice && (
            <div className="absolute top-2 left-2">
              <span className="bg-secondary text-dark text-xs px-2 py-1 rounded-full font-medium">SALE</span>
            </div>
          )}
          {!product.salePrice && product.isOrganic && (
            <div className="absolute top-2 left-2">
              <span className="bg-green-100 text-success text-xs px-2 py-1 rounded-full font-medium">ORGANIC</span>
            </div>
          )}
          {!product.salePrice && !product.isOrganic && product.isBestseller && (
            <div className="absolute top-2 left-2">
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">BESTSELLER</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center mb-1">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
          </div>
          <h3 className="font-semibold text-dark text-lg mb-1">{product.name}</h3>
          <div className="flex items-center mb-3">
            <span className="text-primary font-bold">${product.salePrice || product.price}</span>
            {product.salePrice && (
              <span className="text-gray-400 line-through text-sm ml-2">${product.price}</span>
            )}
          </div>
          <button 
            className="w-full py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary hover:text-white transition"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </Link>
    </div>
  );
}
