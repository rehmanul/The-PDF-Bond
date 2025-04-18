import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatters';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
}

export default function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const { cartItems, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Calculate summary values
  const shipping = cartItems.length > 0 ? (subtotal >= 50 ? 0 : 5.99) : 0;
  const tax = subtotal * 0.08; // Assuming 8% tax rate
  const total = subtotal + shipping + tax;
  
  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive"
      });
      return;
    }
    
    setIsApplyingPromo(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Invalid promo code",
        description: "The promo code you entered is not valid or has expired",
        variant: "destructive"
      });
      setIsApplyingPromo(false);
    }, 1000);
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add some products to your cart before checking out",
        variant: "destructive"
      });
      return;
    }
    
    setLocation('/checkout');
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-heading font-bold mb-4">Order Summary</h2>
      
      {/* Promo code input */}
      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="flex-1"
          disabled={isApplyingPromo}
        />
        <Button 
          variant="outline"
          onClick={handleApplyPromo}
          disabled={isApplyingPromo}
        >
          {isApplyingPromo ? "Applying..." : "Apply"}
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      {/* Summary calculations */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (estimated)</span>
          <span>{formatPrice(tax)}</span>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between font-bold text-lg mb-6">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      
      {showCheckoutButton && (
        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </Button>
      )}
      
      {/* Shipping note */}
      <p className="text-xs text-center text-gray-500 mt-4">
        {subtotal < 50 ? (
          <>
            Add <span className="font-semibold">{formatPrice(50 - subtotal)}</span> more to qualify for FREE shipping
          </>
        ) : (
          "You've qualified for FREE shipping!"
        )}
      </p>
      
      {/* Return to shopping */}
      {cartItems.length > 0 && (
        <div className="text-center mt-4">
          <Link href="/products">
            <Button variant="link" className="text-sm">
              Continue Shopping
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
