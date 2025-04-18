import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  readonly = false,
  onChange,
  className
}: RatingProps) {
  const handleClick = (newValue: number) => {
    if (readonly) return;
    onChange?.(newValue);
  };

  // Generate array of stars
  const stars = Array.from({ length: max }, (_, i) => {
    const starValue = i + 1;
    const isHalfStar = value > i && value < i + 1;
    const isFullStar = value >= i + 1;

    return (
      <div 
        key={i} 
        className={cn(
          "cursor-default inline-flex",
          !readonly && "cursor-pointer"
        )}
        onClick={() => handleClick(starValue)}
      >
        {isFullStar ? (
          <Star className="h-4 w-4 fill-secondary text-secondary" />
        ) : isHalfStar ? (
          <StarHalf className="h-4 w-4 fill-secondary text-secondary" />
        ) : (
          <Star className="h-4 w-4 text-gray-300" />
        )}
      </div>
    );
  });

  return (
    <div className={cn("flex", className)}>
      {stars}
    </div>
  );
}
