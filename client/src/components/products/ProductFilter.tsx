import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@shared/schema';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';

interface ProductFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
}

export interface FilterOptions {
  categories: number[];
  priceRange: [number, number];
  rating: number | null;
  inStock: boolean;
  onSale: boolean;
}

const defaultFilters: FilterOptions = {
  categories: [],
  priceRange: [0, 1000],
  rating: null,
  inStock: false,
  onSale: false
};

export default function ProductFilter({ onFilterChange, initialFilters = {} }: ProductFilterProps) {
  // Merge initial filters with defaults
  const [filters, setFilters] = useState<FilterOptions>({
    ...defaultFilters,
    ...initialFilters
  });
  
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);
  
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    setFilters(prev => {
      if (checked) {
        return { ...prev, categories: [...prev.categories, categoryId] };
      } else {
        return { ...prev, categories: prev.categories.filter(id => id !== categoryId) };
      }
    });
  };
  
  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, priceRange: [value[0], value[1]] }));
  };
  
  const handleRatingChange = (rating: number) => {
    setFilters(prev => ({ 
      ...prev, 
      rating: prev.rating === rating ? null : rating 
    }));
  };
  
  const handleCheckboxChange = (field: 'inStock' | 'onSale', checked: boolean) => {
    setFilters(prev => ({ ...prev, [field]: checked }));
  };
  
  const clearFilters = () => {
    setFilters(defaultFilters);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-6 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-gray-500">Failed to load categories</p>
        ) : (
          <div className="space-y-2">
            {categories?.map(category => (
              <div key={category.id} className="flex items-center">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`category-${category.id}`}
                  className="ml-2 text-sm font-normal cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            defaultValue={[filters.priceRange[0], filters.priceRange[1]]}
            max={1000}
            step={10}
            onValueChange={handlePriceChange}
          />
          <div className="flex items-center justify-between mt-2 text-sm">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div
              key={rating}
              className={`flex items-center cursor-pointer p-1 rounded ${
                filters.rating === rating ? 'bg-primary/10' : ''
              }`}
              onClick={() => handleRatingChange(rating)}
            >
              <Rating value={rating} max={5} readonly />
              <span className="ml-2 text-sm">{rating} & up</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox
              id="in-stock"
              checked={filters.inStock}
              onCheckedChange={(checked) => 
                handleCheckboxChange('inStock', checked as boolean)
              }
            />
            <Label 
              htmlFor="in-stock"
              className="ml-2 text-sm font-normal cursor-pointer"
            >
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="on-sale"
              checked={filters.onSale}
              onCheckedChange={(checked) => 
                handleCheckboxChange('onSale', checked as boolean)
              }
            />
            <Label 
              htmlFor="on-sale"
              className="ml-2 text-sm font-normal cursor-pointer"
            >
              On Sale
            </Label>
          </div>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={clearFilters}
      >
        Clear Filters
      </Button>
    </div>
  );
}
