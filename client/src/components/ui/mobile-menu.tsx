import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/utils/constants";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [currentLocation] = useLocation();
  
  // Close the menu when location changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [currentLocation, isOpen, onClose]);

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="fixed right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="text-2xl font-bold text-primary" onClick={onClose}>
              OKKYNO
            </Link>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <nav className="space-y-1">
            {navLinks.map((link, index) => (
              <div key={index}>
                <Link 
                  href={link.path}
                  className={`block py-3 text-lg font-semibold ${
                    currentLocation === link.path ? "text-primary" : "text-gray-800"
                  }`}
                  onClick={link.submenu.length === 0 ? onClose : undefined}
                >
                  {link.name}
                </Link>
                
                {link.submenu.length > 0 && (
                  <div className="pl-4 border-l border-gray-200 mt-1 mb-3 space-y-1">
                    {link.submenu.map((sublink, subIndex) => (
                      <Link 
                        key={subIndex} 
                        href={sublink.path}
                        className="block py-2 text-gray-600 hover:text-primary"
                        onClick={onClose}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              href="/account" 
              className="block py-3 text-lg font-semibold text-gray-800 hover:text-primary"
              onClick={onClose}
            >
              My Account
            </Link>
            <Link 
              href="/cart" 
              className="block py-3 text-lg font-semibold text-gray-800 hover:text-primary"
              onClick={onClose}
            >
              Shopping Cart
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-3">
              <a href="tel:+18005551234" className="block py-2 text-gray-600 hover:text-primary">
                📞 (800) 555-1234
              </a>
              <a href="mailto:info@okkyno.com" className="block py-2 text-gray-600 hover:text-primary">
                ✉️ info@okkyno.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}