import { Category, Product, BlogPost, Review } from '@shared/schema';

// Sample images for products from Unsplash
export const productImages = {
  gardenTools: [
    "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e",
    "https://images.unsplash.com/photo-1598521112314-a9addabd2a2a",
    "https://images.unsplash.com/photo-1624463240406-a73942f4760e",
    "https://images.unsplash.com/photo-1622380663201-42d554156d51",
    "https://images.unsplash.com/photo-1620857453330-a3f70342e4a0",
    "https://images.unsplash.com/photo-1621228698884-75a8ef0f26a0",
    "https://images.unsplash.com/photo-1593264025322-5451b0036ec5",
    "https://images.unsplash.com/photo-1590092794015-bce5431aadba"
  ],
  gardenPlants: [
    "https://images.unsplash.com/photo-1618377531907-42e7e7a54e69",
    "https://images.unsplash.com/photo-1592150621744-aca64f48394a",
    "https://images.unsplash.com/photo-1620127252536-03865ee514fe",
    "https://images.unsplash.com/photo-1463554050456-f2ed7d3fec09",
    "https://images.unsplash.com/photo-1512428813834-c702c7702b78",
    "https://images.unsplash.com/photo-1502394202744-021cfbb17454",
    "https://images.unsplash.com/photo-1521944521548-a8ed0caa8f38",
    "https://images.unsplash.com/photo-1508022152233-9254631e31d1"
  ],
  vegetableGardens: [
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae",
    "https://images.unsplash.com/photo-1595568389793-6abbc8c75fd1",
    "https://images.unsplash.com/photo-1596702874788-97f421c36fc0",
    "https://images.unsplash.com/photo-1471193945509-9ad0617afabf",
    "https://images.unsplash.com/photo-1595855759920-86582396756a",
    "https://images.unsplash.com/photo-1592154017223-9681ead47149",
    "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e",
    "https://images.unsplash.com/photo-1591386767153-987783380885"
  ],
  flowerGardens: [
    "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb",
    "https://images.unsplash.com/photo-1589129140837-67287c22521b",
    "https://images.unsplash.com/photo-1580710450215-211211b2d564",
    "https://images.unsplash.com/photo-1588599692593-12853197ef41",
    "https://images.unsplash.com/photo-1623910270677-3f8bb71e706c",
    "https://images.unsplash.com/photo-1613453692481-d436d5d25764",
    "https://images.unsplash.com/photo-1595351298075-0bc6d4c43f08",
    "https://images.unsplash.com/photo-1599659846650-e4757e3ce32d"
  ],
  gardenAccessories: [
    "https://images.unsplash.com/photo-1603436326446-135e3e08b9d1",
    "https://images.unsplash.com/photo-1614599669226-1f891bcd05ae",
    "https://images.unsplash.com/photo-1599685315640-4273badc0234",
    "https://images.unsplash.com/photo-1504194104404-433180773017",
    "https://images.unsplash.com/photo-1565071559227-20451626a6e4",
    "https://images.unsplash.com/photo-1599643253739-8a3cd75ab2bd",
    "https://images.unsplash.com/photo-1503532567106-ef2cc075be42",
    "https://images.unsplash.com/photo-1470093304386-4ea74aaef622"
  ]
};

// Blog post images
export const blogImages = [
  "https://images.unsplash.com/photo-1599685315640-4273badc0234",
  "https://images.unsplash.com/photo-1603436550349-9c8b27982854",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
  "https://images.unsplash.com/photo-1586952205463-96136c9777b8",
  "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e",
  "https://images.unsplash.com/photo-1605991637623-7a99d0485ed4",
  "https://images.unsplash.com/photo-1470058869958-2a77ade41c02"
];

// Author images
export const authorImages = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  "https://images.unsplash.com/photo-1542206395-9feb3edaa68d"
];

// Sample categories data
export const sampleCategories: Category[] = [
  {
    id: 1,
    name: "Garden Tools",
    slug: "garden-tools",
    description: "Essential tools for gardening success",
    imageUrl: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e",
    productCount: 120
  },
  {
    id: 2,
    name: "Indoor Plants",
    slug: "indoor-plants",
    description: "Beautiful plants for your home",
    imageUrl: "https://images.unsplash.com/photo-1618377531907-42e7e7a54e69",
    productCount: 85
  },
  {
    id: 3,
    name: "Vegetable Seeds",
    slug: "vegetable-seeds",
    description: "Grow your own fresh vegetables",
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae",
    productCount: 64
  },
  {
    id: 4,
    name: "Planters & Pots",
    slug: "planters-pots",
    description: "Stylish containers for your plants",
    imageUrl: "https://images.unsplash.com/photo-1603436326446-135e3e08b9d1",
    productCount: 96
  },
  {
    id: 5,
    name: "Soil & Fertilizers",
    slug: "soil-fertilizers",
    description: "Nutrient-rich soil and plant food",
    imageUrl: "https://images.unsplash.com/photo-1605991637623-7a99d0485ed4",
    productCount: 42
  },
  {
    id: 6,
    name: "Garden Decor",
    slug: "garden-decor",
    description: "Beautify your outdoor space",
    imageUrl: "https://images.unsplash.com/photo-1599685315640-4273badc0234",
    productCount: 78
  }
];

// Sample featured products
export const sampleFeaturedProducts: Product[] = [
  {
    id: 1,
    name: "Premium Garden Shears",
    slug: "premium-garden-shears",
    description: "High-quality stainless steel garden shears with comfortable grip handles, perfect for precise pruning and trimming of plants and shrubs.",
    price: 32.99,
    salePrice: 24.99,
    imageUrl: "https://images.unsplash.com/photo-1598521112314-a9addabd2a2a",
    categoryId: 1,
    inStock: true,
    isFeatured: true,
    isNew: false,
    isBestseller: false,
    isOrganic: false,
    rating: 4.5,
    reviewCount: 42,
    createdAt: new Date()
  },
  {
    id: 2,
    name: "Self-Watering Planter",
    slug: "self-watering-planter",
    description: "Modern self-watering planter that keeps your plants hydrated for up to two weeks. Ideal for busy plant parents and frequent travelers.",
    price: 18.95,
    salePrice: null,
    imageUrl: "https://images.unsplash.com/photo-1614599669226-1f891bcd05ae",
    categoryId: 4,
    inStock: true,
    isFeatured: true,
    isNew: true,
    isBestseller: false,
    isOrganic: false,
    rating: 5.0,
    reviewCount: 67,
    createdAt: new Date()
  },
  {
    id: 3,
    name: "Organic Tomato Seeds",
    slug: "organic-tomato-seeds",
    description: "Non-GMO, organic heirloom tomato seeds. Each packet contains 50 seeds with a high germination rate for a bountiful harvest.",
    price: 5.99,
    salePrice: null,
    imageUrl: "https://images.unsplash.com/photo-1595568389793-6abbc8c75fd1",
    categoryId: 3,
    inStock: true,
    isFeatured: true,
    isNew: false,
    isBestseller: false,
    isOrganic: true,
    rating: 4.0,
    reviewCount: 28,
    createdAt: new Date()
  },
  {
    id: 4,
    name: "Indoor Herb Garden Kit",
    slug: "indoor-herb-garden-kit",
    description: "Complete kit for growing fresh herbs indoors. Includes pots, soil, and seeds for basil, parsley, cilantro, and mint.",
    price: 34.99,
    salePrice: null,
    imageUrl: "https://images.unsplash.com/photo-1561069958-bcd856c2fa76",
    categoryId: 2,
    inStock: true,
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    isOrganic: false,
    rating: 4.5,
    reviewCount: 119,
    createdAt: new Date()
  }
];

// Sample blog posts
export const sampleBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Starting a Vegetable Garden: A Complete Guide for Beginners",
    slug: "starting-vegetable-garden-beginners-guide",
    content: "Full content here...",
    excerpt: "Learn how to plan, plant, and maintain your first vegetable garden with our comprehensive step-by-step guide.",
    imageUrl: "https://images.unsplash.com/photo-1599685315640-4273badc0234",
    category: "BEGINNERS GUIDE",
    authorName: "Sarah Johnson",
    authorImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    publishDate: new Date("2023-05-12"),
    isFeatured: true
  },
  {
    id: 2,
    title: "10 Common Houseplant Problems and How to Solve Them",
    slug: "common-houseplant-problems-solutions",
    content: "Full content here...",
    excerpt: "Troubleshoot yellowing leaves, pest infestations, and other common issues with our expert houseplant care tips.",
    imageUrl: "https://images.unsplash.com/photo-1603436550349-9c8b27982854",
    category: "PLANT CARE",
    authorName: "Michael Chen",
    authorImageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79",
    publishDate: new Date("2023-04-28"),
    isFeatured: true
  },
  {
    id: 3,
    title: "The Ultimate Guide to Composting: Turn Kitchen Waste into Garden Gold",
    slug: "ultimate-guide-composting",
    content: "Full content here...",
    excerpt: "Discover how to create nutrient-rich compost from household waste and transform your garden naturally.",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
    category: "SUSTAINABILITY",
    authorName: "Emma Wilson",
    authorImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    publishDate: new Date("2023-06-03"),
    isFeatured: true
  }
];

// Sample reviews/testimonials
export const sampleTestimonials: Review[] = [
  {
    id: 1,
    productId: 2,
    rating: 5,
    comment: "The self-watering planters I bought are amazing! My plants have never looked healthier, and I can finally go on vacation without worrying about them dying.",
    userName: "Jennifer P.",
    userImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    isVerified: true,
    createdAt: new Date()
  },
  {
    id: 2,
    productId: 3,
    rating: 5,
    comment: "I'm a beginner gardener and the guides on Okkyno have been invaluable. Their tomato seeds germinated quickly and the customer service team was so helpful when I had questions.",
    userName: "Robert T.",
    userImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    isVerified: true,
    createdAt: new Date()
  },
  {
    id: 3,
    productId: 1,
    rating: 4,
    comment: "The quality of gardening tools from Okkyno is outstanding. I've had my pruning shears for over a year now and they're still as sharp as day one. Definitely worth the investment!",
    userName: "Melissa K.",
    userImageUrl: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d",
    isVerified: true,
    createdAt: new Date()
  }
];
