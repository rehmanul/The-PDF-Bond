import { useMemo } from "react";
import { Link } from "wouter";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowRight } from "lucide-react";

export default function CartSummary() {
  const { cartItems } = useCart();
  
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  }, [cartItems]);
  
  const shipping = subtotal > 75 ? 0 : 9.99;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;
  
  const itemCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);
  
  if (cartItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cart Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Items ({itemCount}):</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping:</span>
            <span>
              {shipping === 0 
                ? "Free" 
                : formatPrice(shipping)
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (7%):</span>
            <span>{formatPrice(tax)}</span>
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>
        
        {shipping > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Add <span className="font-semibold">{formatPrice(75 - subtotal)}</span> more to qualify for free shipping.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-2">
          <Link href="/checkout">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
