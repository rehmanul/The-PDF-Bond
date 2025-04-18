import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Product } from "../../shared/schema";

// Extended CartItem with product details
export interface CartItemWithProduct {
  id: number;
  sessionId: string;
  productId: number;
  quantity: number;
  createdAt: string;
  product?: Product;
}

interface CartContextType {
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize session ID and load cart items on mount
  useEffect(() => {
    const initializeCart = async () => {
      // Get or create session ID from localStorage
      let sid = localStorage.getItem("cartSessionId");
      if (!sid) {
        sid = uuidv4();
        localStorage.setItem("cartSessionId", sid);
      }
      setSessionId(sid);
      
      // Fetch cart items
      await fetchCartItems(sid);
    };

    initializeCart();
  }, []);

  // Fetch cart items from API
  const fetchCartItems = async (sid: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart?sessionId=${sid}`);
      if (response.ok) {
        const items = await response.json();
        setCartItems(items);
      }
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId: number, quantity: number) => {
    setIsLoading(true);
    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.productId === productId);
      
      if (existingItem) {
        // Update quantity if item exists
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Add new item
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            productId,
            quantity,
          }),
        });

        if (response.ok) {
          const newItem = await response.json();
          setCartItems(prev => [...prev, newItem]);
        }
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setCartItems(prev => 
          prev.map(item => item.id === itemId ? updatedItem : item)
        );
      }
    } catch (error) {
      console.error("Failed to update cart item quantity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total number of items in cart
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calculate cart subtotal
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};