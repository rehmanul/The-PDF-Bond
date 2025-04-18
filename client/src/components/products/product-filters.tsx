import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, Search } from "lucide-react";

interface FilterState {
  categories: number[];
  price: [number, number];
  features: string[];
  search: string;
}

interface ProductFiltersProps {
  initialFilters?: Partial<FilterState>;
  onFilterChange: (filters: FilterState) => void;
  maxPrice?: number;
}

export default function ProductFilters({ initialFilters, onFilterChange, maxPrice = 100 }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: initialFilters?.categories || [],
    price: initialFilters?.price || [0, maxPrice],
    features: initialFilters?.features || [],
    search: initialFilters?.search || ""
  });
  
  const [searchInput, setSearchInput] = useState(filters.search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Apply filters when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);
  
  // Handle category checkbox change
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryId] 
        : prev.categories.filter(id => id !== categoryId)
    }));
  };
  
  // Handle feature checkbox change
  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      features: checked 
        ? [...prev.features, feature] 
        : prev.features.filter(f => f !== feature)
    }));
  };
  
  // Handle price slider change
  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      price: [value[0], value[1]] as [number, number]
    }));
  };
  
  // Handle search input change
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setFilters(prev => ({
      ...prev,
      search: searchInput
    }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      categories: [],
      price: [0, maxPrice],
      features: [],
      search: ""
    });
    setSearchInput("");
  };
  
  // Filter panel content
  const filterPanelContent = (
    <>
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pr-10"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
          >
            <Search size={18} />
          </Button>
        </div>
      </form>
      
      <Accordion type="multiple" defaultValue={["categories", "price", "features"]}>
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="px-2">
              <Slider
                defaultValue={[filters.price[0], filters.price[1]]}
                max={maxPrice}
                step={1}
                value={[filters.price[0], filters.price[1]]}
                onValueChange={handlePriceChange}
                className="my-4"
              />
              <div className="flex justify-between text-sm">
                <span>${filters.price[0]}</span>
                <span>${filters.price[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="features">
          <AccordionTrigger>Features</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {["Best Seller", "Featured", "New Arrival", "On Sale"].map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${feature}`}
                    checked={filters.features.includes(feature)}
                    onCheckedChange={(checked) => 
                      handleFeatureChange(feature, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`feature-${feature}`}
                    className="text-sm cursor-pointer"
                  >
                    {feature}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Button 
        variant="outline" 
        className="w-full mt-4"
        onClick={resetFilters}
      >
        Reset Filters
      </Button>
    </>
  );
  
  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <SlidersHorizontal size={16} className="mr-2" />
          {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
        </Button>
        
        {mobileFiltersOpen && (
          <Card className="mt-2">
            <CardContent className="pt-4">
              {filterPanelContent}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Desktop filter panel */}
      <div className="hidden lg:block">
        {filterPanelContent}
      </div>
    </>
  );
}
