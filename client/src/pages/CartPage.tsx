import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { ShoppingCart, AlertCircle, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cartItems, isLoading, clearCart } = useCart();
  const [isClearing, setIsClearing] = useState(false);
  
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setIsClearing(true);
      await clearCart();
      setIsClearing(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Shopping Cart | Okkyno</title>
        <meta name="description" content="View and manage items in your shopping cart." />
      </Helmet>
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage>Cart</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review and manage your selected items</p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-20 h-20 mx-auto mb-4 text-gray-300">
              <ShoppingCart size={80} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to your cart to continue shopping</p>
            <Link href="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <ShoppingBag className="mr-2 h-5 w-5" /> Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                  </h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearCart}
                    disabled={isClearing}
                  >
                    {isClearing ? "Clearing..." : "Clear Cart"}
                  </Button>
                </div>
                
                <div className="space-y-1">
                  {cartItems.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
              
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Shipping Information</p>
                  <p className="mt-1">Free shipping on orders over $50. Standard delivery takes 3-5 business days.</p>
                </div>
              </div>
            </div>
            
            <div>
              <CartSummary />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
