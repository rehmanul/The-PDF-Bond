import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import { Helmet } from 'react-helmet';
import { ShoppingBag, CreditCard, ArrowLeft, CheckCircle, Clock, Shield, Truck } from "lucide-react";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your street address"),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state/province"),
  zip: z.string().min(5, "Please enter a valid postal code"),
  country: z.string().min(2, "Please enter your country"),
  cardName: z.string().min(3, "Please enter the name on your card"),
  cardNumber: z.string().regex(/^\d{16}$/, "Please enter a valid 16-digit card number"),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Please use MM/YY format"),
  cardCvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      setLocation("/cart");
    }
  }, [cartItems, orderComplete, setLocation]);
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    }
  });
  
  // Calculate order summary
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const shipping = subtotal > 75 ? 0 : 9.99;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;
  
  const onSubmit = async (values: CheckoutFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate random order ID
      const randomOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(randomOrderId);
      
      // Clear cart
      await clearCart();
      
      // Show success
      setOrderComplete(true);
      
      toast({
        title: "Order placed successfully!",
        description: `Your order #${randomOrderId} has been confirmed.`,
      });
    } catch (error) {
      toast({
        title: "Error placing order",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Helmet>
          <title>Order Confirmation | Okkyno</title>
          <meta name="description" content="Thank you for your order at Okkyno." />
        </Helmet>
        
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
            <p className="text-xl text-gray-600">Your order has been received and is being processed.</p>
          </div>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Order Number:</span>
                  <span>{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Order Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Order Total:</span>
                  <span className="font-semibold text-primary">{formatPrice(total)}</span>
                </div>
                
                <Separator />
                
                <div className="text-sm text-gray-600">
                  <p>A confirmation email has been sent to your email address.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-primary hover:bg-primary/90" asChild>
                  <Link href="/">
                    Continue Shopping
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/account">
                    View Order History
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Clock className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Processing Time</h3>
              <p className="text-sm text-gray-600">Orders are processed within 24 hours.</p>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Shipping</h3>
              <p className="text-sm text-gray-600">Delivery in 2-5 business days.</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Satisfaction Guarantee</h3>
              <p className="text-sm text-gray-600">30-day money-back guarantee.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Checkout | Okkyno</title>
        <meta name="description" content="Complete your purchase at Okkyno." />
      </Helmet>
      
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/cart")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="John" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Doe" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="john@example.com" type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="(123) 456-7890" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123 Garden Street" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Plantville" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="CA" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP/Postal Code*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="12345" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="United States" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                  
                  <Tabs defaultValue="credit-card" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="credit-card">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Credit Card
                      </TabsTrigger>
                      <TabsTrigger value="paypal" disabled>
                        <span className="mr-2">
                          <i className="fab fa-paypal"></i>
                        </span>
                        PayPal
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="credit-card">
                      <div className="space-y-4 mt-4">
                        <FormField
                          control={form.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name on Card*</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John Doe" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number*</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="1234 5678 9012 3456"
                                  maxLength={16}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cardExpiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiration Date*</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="MM/YY" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardCvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV*</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="123" maxLength={4} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 py-3 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Place Order
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex">
                      <span className="font-medium">{item.quantity} x</span>
                      <span className="ml-2 truncate max-w-[200px]">{item.product?.name}</span>
                    </div>
                    <span>
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax (7%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded p-4 flex items-start">
              <Shield className="text-green-600 h-5 w-5 mr-2 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-semibold">Secure Checkout</p>
                <p>Your payment information is encrypted and secure.</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-start">
              <Truck className="text-blue-600 h-5 w-5 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Free Shipping on Orders Over $75</p>
                <p>Orders typically ship within 1-2 business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
