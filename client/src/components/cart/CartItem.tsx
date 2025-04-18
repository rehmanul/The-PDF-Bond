import { useState } from 'react';
import { Link } from 'wouter';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem as CartItemType } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatters';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleRemove = async () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    try {
      await removeFromCart(item.id);
    } finally {
      setIsRemoving(false);
    }
  };
  
  // If product data is missing, show minimal version with error
  if (!item.product) {
    return (
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1">
          <p className="text-sm text-gray-500">Product information unavailable</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-500 hover:text-error"
          onClick={handleRemove}
          disabled={isRemoving}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    );
  }
  
  const { product } = item;
  const itemTotal = product.price * item.quantity;
  
  return (
    <div className="flex items-center py-6 border-b">
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <img 
            src={product.imageUrl || "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
      
      <div className="ml-4 flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 hover:text-primary transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500">
          {product.sku}
        </p>
        <div className="mt-1 text-primary font-medium">
          {formatPrice(product.price)}
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center ml-4">
        <div className="flex items-center border rounded-md">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-10 text-center text-sm">{item.quantity}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="w-20 text-right font-medium ml-4">
        {formatPrice(itemTotal)}
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="ml-4 text-gray-500 hover:text-error"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
