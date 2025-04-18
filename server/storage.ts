import { 
  User, InsertUser, users,
  Category, InsertCategory, categories,
  Product, InsertProduct, products,
  BlogPost, InsertBlogPost, blogPosts,
  Comment, InsertComment, comments,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems,
  Testimonial, InsertTestimonial, testimonials,
  CartItem, InsertCartItem, cartItems
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Product operations
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Blog operations
  getBlogPosts(limit?: number, offset?: number, publishedOnly?: boolean): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  
  // Comment operations
  getCommentsByBlogPost(blogPostId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Testimonial operations
  getTestimonials(approvedOnly?: boolean): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  approveTestimonial(id: number): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;
  
  // Cart operations
  getCartItems(sessionId: string): Promise<CartItem[]>;
  getCartItem(sessionId: string, productId: number): Promise<CartItem | undefined>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private blogPosts: Map<number, BlogPost>;
  private comments: Map<number, Comment>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private testimonials: Map<number, Testimonial>;
  private cartItems: Map<number, CartItem>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private productIdCounter: number;
  private blogPostIdCounter: number;
  private commentIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private testimonialIdCounter: number;
  private cartItemIdCounter: number;
  
  // Sample data for initial load
  private sampleCategories: InsertCategory[] = [
    { name: "Vegetables", slug: "vegetables", description: "Fresh vegetables for your garden", imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" },
    { name: "Indoor Plants", slug: "indoor-plants", description: "Beautiful plants for your home", imageUrl: "https://images.unsplash.com/photo-1599590984817-0c0aee0de8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" },
    { name: "Garden Tools", slug: "garden-tools", description: "Quality tools for gardening", imageUrl: "https://images.unsplash.com/photo-1589111118344-fe616859d7a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" },
    { name: "Flowers", slug: "flowers", description: "Colorful flowers for your garden", imageUrl: "https://images.unsplash.com/photo-1446071103084-c257b5f70672?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" },
    { name: "Pots & Planters", slug: "pots-planters", description: "Decorative pots for your plants", imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" },
    { name: "Seeds", slug: "seeds", description: "High-quality seeds for planting", imageUrl: "https://images.unsplash.com/photo-1574478155394-84eee6d97a8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" }
  ];
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.blogPosts = new Map();
    this.comments = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.testimonials = new Map();
    this.cartItems = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.blogPostIdCounter = 1;
    this.commentIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.testimonialIdCounter = 1;
    this.cartItemIdCounter = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "adminpassword", // In a real app, this would be hashed
      email: "admin@okkyno.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin"
    });
    
    // Create sample categories
    this.sampleCategories.forEach(category => this.createCategory(category));
    
    // Create sample products (just a few to start, more can be added)
    this.createProduct({
      name: "Cucumber 'Marketmore' Organic Seeds",
      slug: "cucumber-marketmore-organic-seeds",
      description: "Organic cucumber seeds that produce high yields of straight, dark green slicing cucumbers. Disease resistant and perfect for home gardens.",
      shortDescription: "Organic cucumber seeds for your garden",
      price: 6.99,
      comparePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      imageUrls: [],
      categoryId: 6, // Seeds category
      sku: "SEED-CUC-001",
      stock: 100,
      featured: true,
      rating: 4.5,
      reviewCount: 42
    });
    
    this.createProduct({
      name: "Premium Pruning Shears",
      slug: "premium-pruning-shears",
      description: "Professional-grade pruning shears with ergonomic handles. Sharp, durable stainless steel blades that stay sharp through heavy use.",
      shortDescription: "Professional-grade pruning shears for your garden",
      price: 24.99,
      comparePrice: 32.99,
      imageUrl: "https://images.unsplash.com/photo-1589111118344-fe616859d7a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      imageUrls: [],
      categoryId: 3, // Garden Tools category
      sku: "TOOL-PRU-001",
      stock: 75,
      featured: true,
      rating: 5.0,
      reviewCount: 128
    });
    
    this.createProduct({
      name: "Monstera Deliciosa Plant",
      slug: "monstera-deliciosa-plant",
      description: "Popular, easy-to-grow houseplant with distinctive split leaves. Great for adding a tropical feel to any room. Prefers indirect light.",
      shortDescription: "Popular houseplant with distinctive split leaves",
      price: 39.99,
      comparePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1575224526242-5f04e45d14bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      imageUrls: [],
      categoryId: 2, // Indoor Plants category
      sku: "PLANT-IND-001",
      stock: 30,
      featured: true,
      rating: 4.0,
      reviewCount: 76
    });
    
    this.createProduct({
      name: "Ceramic Plant Pot - White",
      slug: "ceramic-plant-pot-white",
      description: "Elegant white ceramic plant pot with drainage hole and saucer. Suitable for indoor use. Perfect for small to medium plants.",
      shortDescription: "Elegant white ceramic pot for indoor plants",
      price: 18.99,
      comparePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1572688484438-313a6e50c333?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      imageUrls: [],
      categoryId: 5, // Pots & Planters category
      sku: "POT-CER-001",
      stock: 50,
      featured: true,
      rating: 4.5,
      reviewCount: 54
    });
    
    // Create sample blog posts
    this.createBlogPost({
      title: "How to Start a Vegetable Garden: Complete Guide for Beginners",
      slug: "how-to-start-vegetable-garden-guide-beginners",
      content: `<p>Starting a vegetable garden can be a rewarding experience that provides fresh produce and a connection to the growing process. This guide will walk you through everything you need to know to get started.</p>
      <h2>Choosing the Right Location</h2>
      <p>Most vegetables need at least 6-8 hours of direct sunlight daily. Choose a spot in your yard that gets plenty of sun and has good drainage. Avoid areas that are too windy or prone to flooding.</p>
      <h2>Planning Your Garden</h2>
      <p>Start small with just a few types of vegetables. Consider what your family enjoys eating and what grows well in your climate. Draw a simple layout of your garden beds.</p>
      <h2>Preparing the Soil</h2>
      <p>Good soil is the foundation of a successful garden. Test your soil to determine its pH and nutrient levels. Add compost or other organic matter to improve soil structure and fertility.</p>
      <h2>Planting</h2>
      <p>Follow the planting guidelines for each type of vegetable. Some plants, like tomatoes and peppers, are best started indoors and transplanted, while others, like carrots and beans, can be directly sown in the garden.</p>
      <h2>Watering and Maintenance</h2>
      <p>Most vegetables need about 1 inch of water per week. Water deeply but infrequently to encourage deep root growth. Mulch around plants to retain moisture and suppress weeds.</p>
      <h2>Harvesting</h2>
      <p>Harvest vegetables at their peak of ripeness for the best flavor. Regular harvesting often encourages plants to produce more.</p>
      <p>With a little planning and care, you'll be enjoying fresh vegetables from your garden in no time!</p>`,
      excerpt: "Learn everything you need to know about starting your first vegetable garden, from planning and soil preparation to harvesting.",
      imageUrl: "https://images.unsplash.com/photo-1527069438729-2eb562e7c9e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      authorId: 1,
      published: true
    });
    
    this.createBlogPost({
      title: "10 Low-Maintenance Indoor Plants That Purify Your Air",
      slug: "10-low-maintenance-indoor-plants-purify-air",
      content: `<p>Indoor plants not only add beauty to your home but can also improve air quality. Here are 10 easy-to-care-for plants that help purify the air.</p>
      <h2>1. Snake Plant (Sansevieria trifasciata)</h2>
      <p>Also known as mother-in-law's tongue, this plant is nearly indestructible. It thrives in low light and doesn't need frequent watering.</p>
      <h2>2. Spider Plant (Chlorophytum comosum)</h2>
      <p>A classic houseplant that produces baby plants you can propagate. It's non-toxic to pets and very forgiving of neglect.</p>
      <h2>3. Peace Lily (Spathiphyllum)</h2>
      <p>With elegant white flowers, peace lilies thrive in low light and help remove toxins like ammonia and formaldehyde.</p>
      <h2>4. Pothos (Epipremnum aureum)</h2>
      <p>An excellent trailing plant for beginners. It can grow in water or soil and adapts to various light conditions.</p>
      <h2>5. Rubber Plant (Ficus elastica)</h2>
      <p>This plant has thick, glossy leaves and can grow into an impressive indoor tree with minimal care.</p>
      <h2>6. ZZ Plant (Zamioculcas zamiifolia)</h2>
      <p>Extremely drought-tolerant with glossy leaves, the ZZ plant rarely needs watering and can survive in low light.</p>
      <h2>7. Aloe Vera</h2>
      <p>Beyond air purification, aloe provides medicinal gel for burns and cuts. It needs bright light but infrequent watering.</p>
      <h2>8. Chinese Evergreen (Aglaonema)</h2>
      <p>Available in various patterns and colors, these plants tolerate low light and irregular watering.</p>
      <h2>9. Boston Fern (Nephrolepis exaltata)</h2>
      <p>One of the best air-purifying plants, Boston ferns remove formaldehyde. They prefer humidity and indirect light.</p>
      <h2>10. Dracaena</h2>
      <p>With many varieties available, dracaenas are easy to grow and effective at removing toxins from the air.</p>
      <p>These plants will not only beautify your home but also contribute to a healthier living environment!</p>`,
      excerpt: "Discover beautiful houseplants that not only look great but also help clean the air in your home while requiring minimal care.",
      imageUrl: "https://images.unsplash.com/photo-1603436326446-e8beaa0c2956?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      authorId: 1,
      published: true
    });
    
    this.createBlogPost({
      title: "The Ultimate Guide to Garden Soil Preparation and Amendments",
      slug: "ultimate-guide-garden-soil-preparation-amendments",
      content: `<p>Good soil is the foundation of a successful garden. This guide will help you understand, test, and improve your garden soil.</p>
      <h2>Understanding Soil Types</h2>
      <p>Soils generally fall into three categories: sandy, clay, and loam. Sandy soil drains quickly but doesn't hold nutrients well. Clay soil holds nutrients but can become waterlogged and compacted. Loam, a mix of sand, silt, and clay, is ideal for most garden plants.</p>
      <h2>Testing Your Soil</h2>
      <p>Before amending your soil, it's important to know what you're working with. A basic soil test will tell you the pH level and nutrient content. You can purchase a DIY kit or send a sample to your local extension office for a more detailed analysis.</p>
      <h2>Adjusting Soil pH</h2>
      <p>Most plants prefer a slightly acidic to neutral pH (6.0-7.0). To raise pH (make soil less acidic), add garden lime. To lower pH (make soil more acidic), add sulfur or organic materials like pine needles or coffee grounds.</p>
      <h2>Adding Organic Matter</h2>
      <p>Compost is the gardener's best friend. It improves soil structure, adds nutrients, and supports beneficial soil organisms. Aim to add a 2-3 inch layer of compost to your garden beds annually.</p>
      <h2>Other Soil Amendments</h2>
      <p><strong>For Sandy Soil:</strong> Add compost, coconut coir, or aged manure to improve water and nutrient retention.</p>
      <p><strong>For Clay Soil:</strong> Add compost, coarse sand, or gypsum to improve drainage and prevent compaction.</p>
      <p><strong>For Nutrient Deficiencies:</strong> Based on your soil test, you might need to add specific amendments like bone meal (for phosphorus) or greensand (for potassium).</p>
      <h2>When to Amend Soil</h2>
      <p>The best time to amend soil is in fall or early spring before planting. This gives amendments time to integrate into the soil.</p>
      <h2>Mulching</h2>
      <p>After planting, apply a 2-3 inch layer of mulch (like straw, wood chips, or shredded leaves) to conserve moisture, suppress weeds, and gradually add organic matter as it breaks down.</p>
      <p>Remember, building good soil is an ongoing process. With regular additions of organic matter and appropriate amendments, your garden soil will improve year after year.</p>`,
      excerpt: "Learn how to test, amend, and prepare your soil for optimal plant growth and a thriving garden this season.",
      imageUrl: "https://images.unsplash.com/photo-1601113286329-138a19a0db5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      authorId: 1,
      published: true
    });
    
    // Create sample testimonials
    this.createTestimonial({
      content: "I've been buying plants from Okkyno for over a year now and I'm always impressed with the quality. The tomato seedlings I purchased last spring produced the best harvest I've ever had!",
      rating: 5,
      customerName: "Sarah Johnson",
      customerTitle: "Home Gardener",
      customerImage: "https://randomuser.me/api/portraits/women/45.jpg"
    });
    
    this.createTestimonial({
      content: "The gardening tools I purchased from Okkyno are exceptional quality. The ergonomic design makes gardening much easier on my wrists and the customer service was fantastic when I had questions.",
      rating: 5,
      customerName: "Michael Chen",
      customerTitle: "Landscape Designer",
      customerImage: "https://randomuser.me/api/portraits/men/32.jpg"
    });
    
    this.createTestimonial({
      content: "As someone new to gardening, I really appreciate the detailed care instructions that come with every plant. The blog articles have also been incredibly helpful. My indoor garden is thriving thanks to Okkyno!",
      rating: 4,
      customerName: "Emily Rodriguez",
      customerTitle: "Indoor Plant Enthusiast",
      customerImage: "https://randomuser.me/api/portraits/women/68.jpg"
    });
    
    // Set all testimonials to approved
    this.testimonials.forEach((testimonial, id) => {
      this.approveTestimonial(id);
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const newUser: User = { ...user, id, createdAt: now };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const category = await this.getCategory(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Product operations
  async getProducts(limit?: number, offset = 0): Promise<Product[]> {
    const products = Array.from(this.products.values());
    if (limit) {
      return products.slice(offset, offset + limit);
    }
    return products;
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }
  
  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const featuredProducts = Array.from(this.products.values()).filter(
      (product) => product.featured
    );
    if (limit) {
      return featuredProducts.slice(0, limit);
    }
    return featuredProducts;
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug
    );
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        (product.description && product.description.toLowerCase().includes(lowercaseQuery)) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(lowercaseQuery))
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const newProduct: Product = { 
      ...product, 
      id, 
      createdAt: now,
      imageUrls: product.imageUrls || []
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Blog operations
  async getBlogPosts(limit?: number, offset = 0, publishedOnly = true): Promise<BlogPost[]> {
    let posts = Array.from(this.blogPosts.values());
    
    if (publishedOnly) {
      posts = posts.filter(post => post.published);
    }
    
    // Sort by creation date, newest first
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (limit) {
      return posts.slice(offset, offset + limit);
    }
    return posts;
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      (post) => post.slug === slug
    );
  }
  
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostIdCounter++;
    const now = new Date();
    const newPost: BlogPost = { 
      ...post, 
      id, 
      commentCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.blogPosts.set(id, newPost);
    return newPost;
  }
  
  async updateBlogPost(id: number, postData: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const post = await this.getBlogPost(id);
    if (!post) return undefined;
    
    const updatedPost = { 
      ...post, 
      ...postData,
      updatedAt: new Date()
    };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPosts.delete(id);
  }
  
  // Comment operations
  async getCommentsByBlogPost(blogPostId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.blogPostId === blogPostId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    const newComment: Comment = { ...comment, id, createdAt: now };
    this.comments.set(id, newComment);
    
    // Update blog post comment count
    const post = await this.getBlogPost(comment.blogPostId);
    if (post) {
      await this.updateBlogPost(post.id, { commentCount: post.commentCount + 1 });
    }
    
    return newComment;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;
    
    // Update blog post comment count
    const post = await this.getBlogPost(comment.blogPostId);
    if (post) {
      await this.updateBlogPost(post.id, { commentCount: post.commentCount - 1 });
    }
    
    return this.comments.delete(id);
  }
  
  // Order operations
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const newOrder: Order = { ...order, id, createdAt: now };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }
  
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }
  
  // Testimonial operations
  async getTestimonials(approvedOnly = true): Promise<Testimonial[]> {
    let testimonials = Array.from(this.testimonials.values());
    
    if (approvedOnly) {
      testimonials = testimonials.filter(testimonial => testimonial.approved);
    }
    
    return testimonials;
  }
  
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialIdCounter++;
    const now = new Date();
    const newTestimonial: Testimonial = { 
      ...testimonial, 
      id, 
      approved: false,
      createdAt: now
    };
    this.testimonials.set(id, newTestimonial);
    return newTestimonial;
  }
  
  async approveTestimonial(id: number): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;
    
    const updatedTestimonial = { ...testimonial, approved: true };
    this.testimonials.set(id, updatedTestimonial);
    return updatedTestimonial;
  }
  
  async deleteTestimonial(id: number): Promise<boolean> {
    return this.testimonials.delete(id);
  }
  
  // Cart operations
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId
    );
  }
  
  async getCartItem(sessionId: string, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.sessionId === sessionId && item.productId === productId
    );
  }
  
  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await this.getCartItem(item.sessionId, item.productId);
    
    if (existingItem) {
      // Update quantity of existing item
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + item.quantity) as Promise<CartItem>;
    }
    
    // Create new item
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const newItem: CartItem = { ...item, id, createdAt: now };
    this.cartItems.set(id, newItem);
    return newItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }
    
    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(sessionId: string): Promise<boolean> {
    const cartItems = await this.getCartItems(sessionId);
    let success = true;
    
    for (const item of cartItems) {
      if (!this.cartItems.delete(item.id)) {
        success = false;
      }
    }
    
    return success;
  }
}

export const storage = new MemStorage();
