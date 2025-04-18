import { useState } from "react";
import { Link } from "wouter";
import { CartItem as CartItemType, Product } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface CartItemProps {
  item: CartItemType & { product?: Product };
}

export default function CartItem({ item }: CartItemProps) {
  const { updateCartItemQuantity, removeCartItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  if (!item.product) {
    return null;
  }
  
  const product = item.product;
  const itemTotal = product.price * item.quantity;
  
  const handleQuantityChange = (newValue: string) => {
    const quantity = parseInt(newValue);
    if (quantity === item.quantity) return;
    
    setIsUpdating(true);
    updateCartItemQuantity(item.id, quantity)
      .finally(() => {
        setIsUpdating(false);
      });
  };
  
  const handleRemove = () => {
    setIsRemoving(true);
    removeCartItem(item.id)
      .finally(() => {
        setIsRemoving(false);
      });
  };
  
  return (
    <div className="flex flex-col sm:flex-row py-6 border-b">
      {/* Product Image */}
      <div className="w-full sm:w-24 h-24 mb-4 sm:mb-0">
        <Link href={`/product/${product.slug}`}>
          <img 
            src={product.imageUrls[0]} 
            alt={product.name} 
            className="w-full h-full object-cover rounded"
          />
        </Link>
      </div>
      
      {/* Product Details */}
      <div className="flex-1 sm:ml-6 flex flex-col sm:flex-row">
        <div className="flex-1">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-semibold text-lg hover:text-primary transition">
              {product.name}
            </h3>
          </Link>
          
          <div className="text-gray-600 text-sm mt-1">
            SKU: PROD-{product.id}
          </div>
          
          {product.comparePrice && (
            <div className="flex items-center mt-1">
              <span className="text-sm text-primary font-medium mr-2">
                Save {formatPrice(product.comparePrice - product.price)}
              </span>
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-row sm:flex-col justify-between items-center mt-4 sm:mt-0">
          <div className="w-24 sm:mb-2">
            <Select
              value={item.quantity.toString()}
              onValueChange={handleQuantityChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Qty" />
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
          
          <div className="font-semibold">
            {formatPrice(itemTotal)}
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isRemoving}
            aria-label="Remove item"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
