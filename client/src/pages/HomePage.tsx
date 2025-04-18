import HeroSection from "@/components/home/HeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoSection from "@/components/home/PromoSection";
import FeaturedBlogs from "@/components/home/FeaturedBlogs";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Okkyno - Garden Plants, Tools & Expert Advice</title>
        <meta 
          name="description" 
          content="Expert gardening solutions for enthusiasts and beginners. Quality plants, tools, and advice to help your garden thrive." 
        />
      </Helmet>
      
      <main>
        <HeroSection />
        <CategoryShowcase />
        <FeaturedProducts />
        <PromoSection />
        <FeaturedBlogs />
        <Testimonials />
        <Newsletter />
      </main>
    </>
  );
}
