import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-green-50 to-green-100 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-900 mb-4">
              Grow Your Garden <span className="text-green-600">With Confidence</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg">
              Expert gardening solutions for enthusiasts and beginners. Quality plants, tools, and advice to help your garden thrive year-round.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 text-lg">
                <Link href="/blog">Read Our Blog</Link>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="relative rounded-lg overflow-hidden shadow-xl h-[400px] md:h-[500px] bg-green-200 flex items-center justify-center">
              {/* This would ideally be a real image */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')] bg-cover bg-center opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-block bg-green-600 px-3 py-1 rounded-full text-sm font-medium mb-2">Featured</span>
                <h3 className="text-2xl font-bold mb-1">Urban Garden Collection</h3>
                <p className="opacity-90">Perfect solutions for limited spaces</p>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl font-bold">
                  4.9
                </div>
                <div>
                  <div className="flex text-yellow-400 text-sm mb-1">
                    ★★★★★
                  </div>
                  <p className="text-xs text-gray-500">Based on 2,300+ reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-16">
        <div className="bg-white rounded-lg shadow-lg p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: "🚚", title: "Free Shipping", desc: "On orders over $75" },
            { icon: "🌱", title: "Plant Guarantee", desc: "30-day guarantee" },
            { icon: "💬", title: "Expert Advice", desc: "Garden consultations" },
            { icon: "🔒", title: "Secure Payment", desc: "100% secure checkout" }
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}