import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  ShoppingCart,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Products", icon: Package, href: "/admin/products" },
    { label: "Blog Posts", icon: FileText, href: "/admin/blog" },
    { label: "Customers", icon: Users, href: "/admin/customers" },
    { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
    { label: "Reviews", icon: MessageSquare, href: "/admin/reviews" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ];
  
  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };
  
  // Mobile menu button
  const mobileMenuButton = (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden fixed top-4 left-4 z-50"
      onClick={toggleMobileMenu}
    >
      {isMobileOpen ? <X /> : <Menu />}
    </Button>
  );
  
  const sidebarContent = (
    <>
      <div className="px-4 py-6">
        <Link href="/admin" className="flex items-center">
          <span className="text-primary font-bold text-2xl">OKKYNO</span>
          <span className="ml-2 bg-primary text-white px-2 py-1 rounded text-xs">Admin</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive 
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "hover:bg-gray-100"
                  )}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                  {isActive && <ChevronRight className="ml-auto h-5 w-5" />}
                </Button>
              </Link>
            );
          })}
        </nav>
        
        <Separator className="my-4" />
        
        <div className="px-3">
          <Button
            variant="outline"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Log Out
          </Button>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div className="ml-3">
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-gray-500">admin@okkyno.com</p>
          </div>
        </div>
      </div>
    </>
  );
  
  return (
    <>
      {mobileMenuButton}
      
      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm",
          isMobileOpen ? "block" : "hidden"
        )}
        onClick={toggleMobileMenu}
      />
      
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
