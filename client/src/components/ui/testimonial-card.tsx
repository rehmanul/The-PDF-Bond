import { Review } from "@shared/schema";
import StarRating from "./star-rating";

interface TestimonialCardProps {
  testimonial: Review;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="testimonial-card bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
      <div className="flex text-yellow-400 mb-4">
        <StarRating rating={testimonial.rating} />
      </div>
      <p className="text-gray-600 mb-6 italic">"{testimonial.comment}"</p>
      <div className="flex items-center">
        {testimonial.userImageUrl && (
          <img 
            src={`${testimonial.userImageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80`} 
            alt={testimonial.userName} 
            className="w-10 h-10 rounded-full mr-3"
          />
        )}
        <div>
          <h4 className="font-semibold text-dark">{testimonial.userName}</h4>
          <p className="text-xs text-gray-500">{testimonial.isVerified ? 'Verified Customer' : 'Customer'}</p>
        </div>
      </div>
    </div>
  );
}
