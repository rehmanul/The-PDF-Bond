import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import BlogPage from "@/pages/BlogPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import LoginPage from "@/pages/LoginPage";
import AboutPage from "@/pages/AboutPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminProductsPage from "@/pages/AdminProductsPage";
import AdminBlogsPage from "@/pages/AdminBlogsPage";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/context/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { SearchProvider } from "@/context/SearchContext";
import { queryClient } from "@/lib/queryClient";
import DeploymentHelperPage from "@/pages/DeploymentHelperPage"; // Added import

function Router() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/category/:slug" component={ProductsPage} />
      <Route path="/category/:slug" component={ProductsPage} />
      <Route path="/products/:slug" component={ProductDetailPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/ai-assistant" component={AIAssistantPage} />
      <Route path="/deployment-helper" component={DeploymentHelperPage} /> {/* Added route */}

      {/* Admin routes - only accessible if user is admin */}
      {isAdmin && (
        <>
          <Route path="/admin" component={AdminDashboardPage} />
          <Route path="/admin/products" component={AdminProductsPage} />
          <Route path="/admin/blog" component={AdminBlogsPage} />
          <Route path="/admin/orders" component={AdminOrdersPage} />
        </>
      )}

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// This App function is not used directly anymore - see main.tsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <Header />
            <Router />
            <Footer />
            <Toaster />
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;