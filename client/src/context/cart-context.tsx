import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { getSessionId } from "@/lib/utils";

type CartItem = {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    comparePrice?: number;
    imageUrls: string[];
    slug: string;
  };
};

type CartContextType = {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  addToCart: (item: { productId: number; quantity: number }) => Promise<void>;
  updateCartItemQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeCartItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartState = {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  cartId?: number;
};

type CartAction =
  | { type: "INITIALIZE_CART"; payload: { items: CartItem[]; cartId: number } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_ITEM"; payload: { itemId: number; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "CLEAR_CART" };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "INITIALIZE_CART":
      return {
        ...state,
        cartItems: action.payload.items,
        cartId: action.payload.cartId,
        isLoading: false,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "ADD_ITEM":
      // Check if item already exists
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.productId === action.payload.productId
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.cartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return {
          ...state,
          cartItems: updatedItems,
          isLoading: false,
        };
      } else {
        // Add new item
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
          isLoading: false,
        };
      }
    case "UPDATE_ITEM":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        isLoading: false,
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        cartItems: state.cartItems.filter((item) => item.id !== action.payload),
        isLoading: false,
      };
    case "CLEAR_CART":
      return {
        ...state,
        cartItems: [],
        isLoading: false,
      };
    default:
      return state;
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const sessionId = getSessionId();
  
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: [],
    isLoading: true,
    error: null,
    sessionId,
  });
  
  // Initialize cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await fetch(`/api/cart/${sessionId}`, {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }
        
        const data = await response.json();
        
        dispatch({
          type: "INITIALIZE_CART",
          payload: { items: data.items || [], cartId: data.cart.id },
        });
      } catch (error) {
        console.error("Error fetching cart:", error);
        dispatch({
          type: "SET_ERROR",
          payload: error instanceof Error ? error.message : "Failed to fetch cart",
        });
      }
    };
    
    fetchCart();
  }, [sessionId]);
  
  // Add item to cart
  const addToCart = async (item: { productId: number; quantity: number }) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      const response = await apiRequest(
        "POST",
        `/api/cart/${sessionId}/items`,
        item
      );
      
      const data = await response.json();
      
      dispatch({
        type: "ADD_ITEM",
        payload: {
          ...data.cartItem,
          product: data.product,
        },
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to add item to cart",
      });
      throw error;
    }
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = async (itemId: number, quantity: number) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      await apiRequest(
        "PUT",
        `/api/cart/items/${itemId}`,
        { quantity }
      );
      
      dispatch({
        type: "UPDATE_ITEM",
        payload: { itemId, quantity },
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to update cart item",
      });
      throw error;
    }
  };
  
  // Remove item from cart
  const removeCartItem = async (itemId: number) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      await apiRequest(
        "DELETE",
        `/api/cart/items/${itemId}`
      );
      
      dispatch({
        type: "REMOVE_ITEM",
        payload: itemId,
      });
    } catch (error) {
      console.error("Error removing cart item:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to remove cart item",
      });
      throw error;
    }
  };
  
  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      // In a real implementation, we would call an API to clear the cart
      // Since there's no clear cart endpoint in our API, we'll simulate it
      // by removing each item individually
      await Promise.all(
        state.cartItems.map((item) => removeCartItem(item.id))
      );
      
      dispatch({ type: "CLEAR_CART" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to clear cart",
      });
      throw error;
    }
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems: state.cartItems,
        isLoading: state.isLoading,
        error: state.error,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
