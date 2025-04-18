import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PromoSection() {
  return (
    <section className="py-12 bg-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-5">
              <div className="col-span-2 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1598902108854-10e335adac99?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                  alt="Indoor plants collection" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-3 p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-3">Indoor Plant Collection</h3>
                <p className="text-gray-600 mb-4">Perfect for beginners. Low-maintenance plants that thrive indoors.</p>
                <Link href="/category/indoor-plants">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded inline-block self-start">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-5">
              <div className="col-span-2 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1566842600175-97dca3c5ad8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                  alt="Garden tools collection" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-3 p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-3">Essential Garden Tools</h3>
                <p className="text-gray-600 mb-4">High-quality tools that make gardening easier and more enjoyable.</p>
                <Link href="/category/garden-tools">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded inline-block self-start">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
