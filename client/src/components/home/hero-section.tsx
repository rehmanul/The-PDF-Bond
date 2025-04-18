import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-primary/90 to-primary relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
          alt="Garden background" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Grow Your Perfect Garden
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Expert advice, quality plants, and premium tools for gardeners of all levels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products">
              <Button 
                className="bg-[#f8b042] hover:bg-[#f8b042]/90 text-white font-bold py-3 px-6 rounded-lg text-center h-auto"
                size="lg"
              >
                Shop Plants
              </Button>
            </Link>
            <Link href="/blog">
              <Button 
                variant="outline"
                className="bg-white hover:bg-gray-100 text-primary font-bold py-3 px-6 rounded-lg text-center h-auto"
                size="lg"
              >
                Explore Our Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
