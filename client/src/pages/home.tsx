import HeroSection from "@/components/home/hero-section";
import CategoryShowcase from "@/components/home/category-showcase";
import FeaturedProducts from "@/components/home/featured-products";
import PromoSection from "@/components/home/promo-section";
import FeaturedBlogs from "@/components/home/featured-blogs";
import Testimonials from "@/components/home/testimonials";
import Newsletter from "@/components/home/newsletter";
import { Helmet } from 'react-helmet';

export default function HomePage() {
  return (
    <main>
      <Helmet>
        <title>Okkyno - Garden Plants, Tools & Expert Advice</title>
        <meta name="description" content="Expert gardening solutions for enthusiasts and beginners alike. Quality plants, tools, and advice to help your garden thrive." />
      </Helmet>
      
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <PromoSection />
      <FeaturedBlogs />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
