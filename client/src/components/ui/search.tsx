import { useState, useEffect, useRef } from "react";
import { useSearch } from "@/context/SearchContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";

interface SearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function Search({ 
  placeholder = "Search...", 
  className, 
  onSearch 
}: SearchProps) {
  const { searchQuery, setSearchQuery, performSearch, clearSearch } = useSearch();
  const [value, setValue] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(searchQuery);
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    } else {
      performSearch(value);
    }
  };

  const handleClear = () => {
    setValue("");
    clearSearch();
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pr-12"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-8 top-1/2 transform -translate-y-1/2 h-8 w-8"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
      >
        <SearchIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}
