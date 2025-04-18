import { useState } from "react";
import { Link } from "wouter";
import { X, ChevronDown, ChevronUp } from "lucide-react";

type MenuItem = {
  name: string;
  path: string;
  submenu?: MenuItem[];
};

type MobileMenuProps = {
  isOpen: boolean;
  categories: MenuItem[];
  onClose: () => void;
};

export default function MobileMenu({ isOpen, categories, onClose }: MobileMenuProps) {
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  
  // Toggle submenu open/closed
  const toggleSubmenu = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setOpenSubmenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };
  
  // Stop event propagation to prevent menu closing
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // If menu is not open, render nothing
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 lg:hidden overflow-hidden" aria-modal="true" role="dialog">
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Mobile menu drawer */}
      <div 
        className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-xl overflow-y-auto" 
        onClick={handleMenuClick}
      >
        {/* Menu header with close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button 
            className="p-2 -mr-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation links */}
        <div className="px-4 py-2">
          <nav className="space-y-1">
            {categories.map((category, index) => (
              <div key={index} className="border-b border-gray-200 py-2">
                {category.submenu ? (
                  <>
                    {/* Category with submenu */}
                    <button
                      className="flex items-center justify-between w-full py-2 text-left text-gray-900 hover:text-primary"
                      onClick={(e) => toggleSubmenu(category.name, e)}
                      aria-expanded={!!openSubmenus[category.name]}
                    >
                      <span className="font-medium text-base">{category.name}</span>
                      {openSubmenus[category.name] ? (
                        <ChevronUp size={18} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-500" />
                      )}
                    </button>
                    
                    {/* Submenu items */}
                    {openSubmenus[category.name] && (
                      <div className="pl-4 mt-1 space-y-1">
                        {category.submenu.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.path}
                            className="block py-2 text-gray-600 hover:text-primary"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* Regular category link */
                  <Link
                    href={category.path}
                    className="block py-2 font-medium text-base text-gray-900 hover:text-primary"
                  >
                    {category.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
