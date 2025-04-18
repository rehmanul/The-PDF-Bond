import { Link } from "wouter";
import { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/shop/${category.slug}`}>
      <div className="group bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-md text-center">
        <div className="h-36 overflow-hidden">
          <img 
            src={`${category.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80`} 
            alt={category.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-dark group-hover:text-primary transition">{category.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{category.productCount} Products</p>
        </div>
      </div>
    </Link>
  );
}
