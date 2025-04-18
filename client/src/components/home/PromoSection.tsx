import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PromoSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* First promo card */}
          <div className="relative h-[400px] overflow-hidden rounded-xl group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2671&q=80')] bg-cover bg-center group-hover:scale-105 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <span className="text-white/90 text-sm font-medium mb-2">NEW COLLECTION</span>
              <h3 className="text-white text-3xl font-bold mb-3">Indoor Garden Essentials</h3>
              <p className="text-white/80 mb-6 max-w-md">
                Everything you need to create a thriving indoor garden oasis, from compact planters to specialized grow lights.
              </p>
              <Button asChild className="w-fit bg-white text-green-800 hover:bg-green-50">
                <Link href="/products/category/indoor-gardening">Shop Indoor Plants</Link>
              </Button>
            </div>
          </div>
          
          {/* Second promo card */}
          <div className="relative h-[400px] overflow-hidden rounded-xl group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548407260-da850faa41e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80')] bg-cover bg-center group-hover:scale-105 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <span className="text-white/90 text-sm font-medium mb-2">GARDENER'S CHOICE</span>
              <h3 className="text-white text-3xl font-bold mb-3">Seasonal Gardening Tools</h3>
              <p className="text-white/80 mb-6 max-w-md">
                Professional-grade gardening tools designed for durability and performance across all seasons.
              </p>
              <Button asChild className="w-fit bg-white text-green-800 hover:bg-green-50">
                <Link href="/products/category/tools">Explore Tools</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wide promo banner */}
        <div className="mt-8 relative h-[300px] overflow-hidden rounded-xl group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80')] bg-cover bg-center group-hover:scale-105 transition-transform duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-900/50"></div>
          <div className="absolute inset-0 p-8 flex flex-col justify-center lg:pl-16">
            <div className="max-w-2xl">
              <span className="text-green-300 text-sm font-bold mb-2 inline-block">LIMITED TIME OFFER</span>
              <h3 className="text-white text-3xl md:text-4xl font-bold mb-3">
                Garden Transformation Sale
              </h3>
              <p className="text-white/80 text-lg mb-6">
                Take 20% off all plants and planters. Use code <span className="font-bold">GARDEN20</span> at checkout.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-white text-green-800 hover:bg-green-50">
                  <Link href="/products/category/plants">Shop Plants</Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/products/category/planters">Shop Planters</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}