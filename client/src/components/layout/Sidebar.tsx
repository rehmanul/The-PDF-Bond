import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  ShoppingCart, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  className?: string;
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
}

const SidebarItem = ({ href, icon, title, isActive }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 font-normal",
          isActive 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        {icon}
        <span>{title}</span>
        {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
      </Button>
    </Link>
  );
};

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const sidebarItems = [
    {
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: "Dashboard"
    },
    {
      href: "/admin/products",
      icon: <Package className="h-5 w-5" />,
      title: "Products"
    },
    {
      href: "/admin/blog",
      icon: <FileText className="h-5 w-5" />,
      title: "Blog"
    },
    {
      href: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      title: "Orders"
    },
    {
      href: "/admin/customers",
      icon: <User className="h-5 w-5" />,
      title: "Customers"
    },
    {
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      title: "Settings"
    }
  ];

  return (
    <div className={cn("flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border", className)}>
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-primary font-heading font-bold text-xl">OKKYNO</span>
          <span className="text-xs bg-primary text-white px-1 py-0.5 rounded">Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              isActive={location === item.href}
            />
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 font-normal text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
