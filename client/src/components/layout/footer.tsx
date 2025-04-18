import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Okkyno</h3>
            <p className="text-gray-400 mb-4">
              Expert gardening solutions for enthusiasts and beginners alike. Quality plants, tools, and advice to help your garden thrive.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Pinterest">
                <i className="fab fa-pinterest-p"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/vegetables" className="text-gray-400 hover:text-white transition">
                  Vegetables
                </Link>
              </li>
              <li>
                <Link href="/category/herbs" className="text-gray-400 hover:text-white transition">
                  Herbs
                </Link>
              </li>
              <li>
                <Link href="/category/indoor-plants" className="text-gray-400 hover:text-white transition">
                  Indoor Plants
                </Link>
              </li>
              <li>
                <Link href="/category/garden-tools" className="text-gray-400 hover:text-white transition">
                  Garden Tools
                </Link>
              </li>
              <li>
                <Link href="/category/pots-planters" className="text-gray-400 hover:text-white transition">
                  Pots & Planters
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt text-primary mt-1 mr-3"></i>
                <span className="text-gray-400">123 Garden Street, Plantville, PL 12345</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone text-primary mr-3"></i>
                <a href="tel:+18005551234" className="text-gray-400 hover:text-white transition">(800) 555-1234</a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope text-primary mr-3"></i>
                <a href="mailto:info@okkyno.com" className="text-gray-400 hover:text-white transition">info@okkyno.com</a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-clock text-primary mr-3"></i>
                <span className="text-gray-400">Mon-Fri: 9am-5pm, Sat: 10am-4pm</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} Okkyno. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white text-sm transition">
                Terms of Service
              </Link>
              <Link href="/shipping-returns" className="text-gray-400 hover:text-white text-sm transition">
                Shipping & Returns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
