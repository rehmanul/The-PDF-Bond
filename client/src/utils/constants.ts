// Navigation links with sub-menu items
export const navLinks = [
  {
    name: "Home",
    path: "/",
    submenu: [],
  },
  {
    name: "Shop",
    path: "/products",
    submenu: [
      {
        name: "All Products",
        path: "/products",
      },
      {
        name: "Indoor Plants",
        path: "/products/category/indoor-plants",
      },
      {
        name: "Outdoor Plants",
        path: "/products/category/outdoor-plants",
      },
      {
        name: "Garden Tools",
        path: "/products/category/tools",
      },
      {
        name: "Soil & Fertilizers",
        path: "/products/category/soil-fertilizers",
      },
      {
        name: "Seeds & Bulbs",
        path: "/products/category/seeds-bulbs",
      },
    ],
  },
  {
    name: "Blog",
    path: "/blog",
    submenu: [
      {
        name: "All Articles",
        path: "/blog",
      },
      {
        name: "Plant Care Guides",
        path: "/blog/category/plant-care",
      },
      {
        name: "Gardening Tips",
        path: "/blog/category/gardening-tips",
      },
      {
        name: "DIY Projects",
        path: "/blog/category/diy-projects",
      },
    ],
  },
  {
    name: "About",
    path: "/about",
    submenu: [],
  },
];

// Footer quick links
export const footerQuickLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/products" },
  { name: "Blog", path: "/blog" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "FAQ", path: "/faq" },
];

// Footer category links
export const footerCategoryLinks = [
  { name: "Indoor Plants", path: "/products/category/indoor-plants" },
  { name: "Outdoor Plants", path: "/products/category/outdoor-plants" },
  { name: "Garden Tools", path: "/products/category/tools" },
  { name: "Soil & Fertilizers", path: "/products/category/soil-fertilizers" },
  { name: "Seeds & Bulbs", path: "/products/category/seeds-bulbs" },
  { name: "Planters & Pots", path: "/products/category/planters" },
];

// Company info
export const companyInfo = {
  address: "123 Garden Way, Plantville, CA 94567",
  phone: "(800) 555-1234",
  email: "info@okkyno.com",
  hours: "Mon-Fri: 9am - 5pm",
};

// Social media links
export const socialLinks = [
  { name: "Facebook", url: "https://facebook.com/okkyno", icon: "facebook" },
  { name: "Instagram", url: "https://instagram.com/okkyno", icon: "instagram" },
  { name: "Pinterest", url: "https://pinterest.com/okkyno", icon: "pinterest" },
  { name: "YouTube", url: "https://youtube.com/okkyno", icon: "youtube" },
];

// Legal links
export const legalLinks = [
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Terms of Service", path: "/terms-of-service" },
  { name: "Shipping Policy", path: "/shipping-policy" },
  { name: "Return Policy", path: "/return-policy" },
];

// Order status options
export const orderStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// Payment methods
export const paymentMethods = [
  "credit_card", 
  "paypal", 
  "bank_transfer"
];

// Product sorting options
export const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
  { label: "Name: Z to A", value: "name_desc" },
  { label: "Best Selling", value: "best_selling" },
];

// Blog post categories
export const blogCategories = [
  "plant-care",
  "gardening-tips",
  "diy-projects",
  "sustainable-gardening",
  "urban-gardening",
  "seasonal-guides",
];

// Shipping methods
export const shippingMethods = [
  { id: "standard", name: "Standard Shipping", price: 5.99, estimatedDays: "3-5" },
  { id: "express", name: "Express Shipping", price: 12.99, estimatedDays: "1-2" },
  { id: "free", name: "Free Shipping", price: 0, estimatedDays: "5-7", minOrder: 75 },
];

// Site settings
export const siteSettings = {
  name: "Okkyno",
  description: "Expert gardening solutions for enthusiasts and beginners. Quality plants, tools, and advice to help your garden thrive.",
  contact: {
    email: "info@okkyno.com",
    phone: "(800) 555-1234",
    address: "123 Garden Way, Plantville, CA 94567",
  },
  social: {
    facebook: "https://facebook.com/okkyno",
    instagram: "https://instagram.com/okkyno",
    twitter: "https://twitter.com/okkyno",
    pinterest: "https://pinterest.com/okkyno",
  },
};