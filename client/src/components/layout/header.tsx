import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import MobileMenu from "./mobile-menu";

const categories = [
  { name: "Plants", path: "/category/plants", submenu: [
    { name: "Vegetables", path: "/category/vegetables" },
    { name: "Herbs", path: "/category/herbs" },
    { name: "Flowers", path: "/category/flowers" },
    { name: "Indoor Plants", path: "/category/indoor-plants" },
    { name: "Seeds", path: "/category/seeds" },
  ]},
  { name: "Tools", path: "/category/tools", submenu: [
    { name: "Hand Tools", path: "/category/hand-tools" },
    { name: "Power Tools", path: "/category/power-tools" },
    { name: "Watering", path: "/category/watering" },
    { name: "Pruning", path: "/category/pruning" },
  ]},
  { name: "Accessories", path: "/category/accessories", submenu: [
    { name: "Pots & Planters", path: "/category/pots-planters" },
    { name: "Soil & Fertilizers", path: "/category/soil-fertilizers" },
    { name: "Garden Decor", path: "/category/garden-decor" },
    { name: "Pest Control", path: "/category/pest-control" },
  ]},
  { name: "Blog", path: "/blog" },
  { name: "About", path: "/about" },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { cartItems } = useCart();
  const { user } = useAuth();

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle closing the mobile menu
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar with contact, account and cart */}
      <div className="bg-primary text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:+18005551234" className="text-sm hover:text-secondary transition flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              (800) 555-1234
            </a>
            <a href="mailto:info@okkyno.com" className="text-sm hover:text-secondary transition flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              info@okkyno.com
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href={user ? "/account" : "/login"} className="text-sm hover:text-secondary transition">
              <span className="flex items-center">
                <User size={16} className="mr-1" />
                <span className="hidden md:inline">{user ? 'Account' : 'Sign In'}</span>
              </span>
            </Link>
            <Link href="/cart" className="text-sm hover:text-secondary transition relative">
              <span className="flex items-center">
                <ShoppingCart size={16} className="mr-1" />
                <span className="hidden md:inline">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-secondary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-primary font-bold text-2xl md:text-3xl">OKKYNO</span>
          </Link>

          <div className="hidden lg:block flex-grow mx-10">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search plants, tools, and guides..."
                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
              >
                <Search size={18} />
              </Button>
            </form>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            {categories.map((category, index) => (
              <div key={index} className="group relative">
                <Link
                  href={category.path}
                  className={cn(
                    "text-dark font-semibold hover:text-primary transition py-2",
                    location === category.path && "text-primary"
                  )}
                >
                  {category.name}
                  {category.submenu && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </Link>

                {category.submenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50 hidden group-hover:block">
                    {category.submenu.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.path}
                        className="block px-4 py-2 hover:bg-light hover:text-primary transition"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/ai-assistant" className="text-dark font-semibold hover:text-primary transition py-2">
              AI Assistant
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">New</span>
            </Link>
            <Link href="/deployment-helper" className="text-dark font-semibold hover:text-primary transition py-2">Deployment Helper</Link>
          </nav>

          <button
            className="lg:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile search */}
        <div className="mt-4 lg:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search plants, tools, and guides..."
              className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
            >
              <Search size={18} />
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        categories={categories} 
        onClose={closeMobileMenu}
      />
    </header>
  );
}