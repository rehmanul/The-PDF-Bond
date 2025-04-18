import { useQuery } from "@tanstack/react-query";
import { Testimonial } from "@shared/schema";
import { Card } from "@/components/ui/card";

export default function Testimonials() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });
  
  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex text-[#f8b042] mb-3">
                  {Array(5).fill(0).map((_, j) => (
                    <div key={j} className="h-4 w-4 bg-gray-200 animate-pulse mr-1"></div>
                  ))}
                </div>
                <div className="h-24 bg-gray-200 animate-pulse mb-4"></div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                  <div>
                    <div className="h-4 w-24 bg-gray-200 animate-pulse mb-1"></div>
                    <div className="h-3 w-16 bg-gray-200 animate-pulse"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials?.map((testimonial) => (
            <Card key={testimonial.id} className="p-6">
              <div className="flex text-[#f8b042] mb-3">
                {Array(testimonial.rating).fill(0).map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
                {Array(5 - testimonial.rating).fill(0).map((_, i) => (
                  <i key={i} className="far fa-star"></i>
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">{testimonial.content}</p>
              <div className="flex items-center">
                {testimonial.avatarUrl && (
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={testimonial.avatarUrl} 
                      alt={testimonial.customerName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">{testimonial.customerName}</h4>
                  {testimonial.customerTitle && (
                    <p className="text-sm text-gray-500">{testimonial.customerTitle}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
