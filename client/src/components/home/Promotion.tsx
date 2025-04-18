import { Link } from "wouter";

export default function Promotion() {
  return (
    <section className="py-16 bg-neutral relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1599685315640-4273badc0234?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Garden Transformation" 
              className="rounded-lg shadow-lg w-full" 
              width="600" 
              height="400"
            />
            <div className="absolute -bottom-4 right-4 bg-white p-2 rounded-lg shadow-lg transform rotate-3 hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" 
                alt="Garden Detail" 
                className="rounded w-24 h-24 object-cover"
              />
            </div>
            <div className="absolute -top-4 -left-4 bg-white p-2 rounded-lg shadow-lg transform -rotate-6 hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1586952205463-96136c9777b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" 
                alt="Garden Detail" 
                className="rounded w-24 h-24 object-cover"
              />
            </div>
          </div>
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Limited Time Offer</span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark font-heading mt-2 mb-6">Transform Your Garden This Season</h2>
            <p className="text-gray-600 mb-8">
              Create the garden of your dreams with our expert-curated collection of premium plants, tools, and accessories. For a limited time, enjoy special discounts on all seasonal items.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-success mt-1 mr-3"></i>
                <span>Free garden planning consultation with orders over $100</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-success mt-1 mr-3"></i>
                <span>Exclusive access to rare plant varieties</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-success mt-1 mr-3"></i>
                <span>30-day plant health guarantee</span>
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop" className="px-6 py-3 bg-secondary hover:bg-yellow-500 text-dark font-semibold rounded-full transition shadow-md text-center">
                Shop the Sale
              </Link>
              <a href="#" className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-full transition text-center">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
