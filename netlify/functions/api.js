// Netlify Function Handler using ES modules
import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';

// Debug logger for Netlify Functions
const log = (message, data) => {
  console.log(`[Netlify Function]: ${message}`, data ? JSON.stringify(data) : '');
};

// Create Express app for Netlify Functions
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
}));

// Request logging middleware
app.use((req, res, next) => {
  log(`${req.method} ${req.path}`);
  next();
});

// API Routes
const apiRouter = express.Router();

// Categories endpoint
apiRouter.get("/categories", (req, res) => {
  log('Serving categories');
  res.json([
    { id: 1, name: "Gardening Tools", slug: "gardening-tools" },
    { id: 2, name: "Plants", slug: "plants" },
    { id: 3, name: "Seeds", slug: "seeds" }
  ]);
});

// Products endpoint
apiRouter.get("/products", (req, res) => {
  log('Serving products with query params', req.query);
  
  // Demo product data
  const products = [
    { 
      id: 1, 
      name: "Garden Trowel", 
      slug: "garden-trowel",
      description: "Perfect for planting and transplanting",
      price: 12.99,
      imageUrl: "https://example.com/trowel.jpg",
      categoryId: 1,
      inStock: true,
      onSale: true,
      rating: 4.5
    },
    { 
      id: 2, 
      name: "Pruning Shears", 
      slug: "pruning-shears",
      description: "Sharp and precise cutting",
      price: 18.99,
      imageUrl: "https://example.com/shears.jpg",
      categoryId: 1,
      inStock: true,
      onSale: false,
      rating: 4.2
    },
    { 
      id: 3, 
      name: "Garden Gloves", 
      slug: "garden-gloves",
      description: "Durable and comfortable",
      price: 9.99,
      imageUrl: "https://example.com/gloves.jpg",
      categoryId: 1,
      inStock: true,
      onSale: false,
      rating: 3.8
    }
  ];
  
  // Apply filters if any
  let filteredProducts = [...products];
  
  // Apply category filter
  if (req.query.categoryId) {
    const categoryId = Number(req.query.categoryId);
    filteredProducts = filteredProducts.filter(p => p.categoryId === categoryId);
  }
  
  // Apply price filters
  if (req.query.minPrice) {
    const minPrice = Number(req.query.minPrice);
    filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
  }
  
  if (req.query.maxPrice) {
    const maxPrice = Number(req.query.maxPrice);
    filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
  }
  
  // Apply rating filter
  if (req.query.rating) {
    const rating = Number(req.query.rating);
    filteredProducts = filteredProducts.filter(p => p.rating >= rating);
  }
  
  // Apply stock filter
  if (req.query.inStock) {
    const inStock = req.query.inStock === 'true';
    filteredProducts = filteredProducts.filter(p => p.inStock === inStock);
  }
  
  // Apply sale filter
  if (req.query.onSale) {
    const onSale = req.query.onSale === 'true';
    filteredProducts = filteredProducts.filter(p => p.onSale === onSale);
  }
  
  res.json(filteredProducts);
});

// Featured products endpoint
apiRouter.get("/products/featured", (req, res) => {
  log('Serving featured products');
  res.json([
    { 
      id: 1, 
      name: "Garden Trowel", 
      slug: "garden-trowel",
      description: "Perfect for planting and transplanting",
      price: 12.99,
      imageUrl: "https://example.com/trowel.jpg",
      categoryId: 1,
      inStock: true,
      onSale: true,
      rating: 4.5
    }
  ]);
});

// Product by ID endpoint
apiRouter.get("/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  log(`Serving product with ID ${productId}`);
  
  // Demo products lookup
  const products = {
    1: { 
      id: 1, 
      name: "Garden Trowel", 
      slug: "garden-trowel",
      description: "Perfect for planting and transplanting",
      price: 12.99,
      imageUrl: "https://example.com/trowel.jpg",
      categoryId: 1,
      inStock: true,
      onSale: true,
      rating: 4.5
    },
    2: { 
      id: 2, 
      name: "Pruning Shears", 
      slug: "pruning-shears",
      description: "Sharp and precise cutting",
      price: 18.99,
      imageUrl: "https://example.com/shears.jpg",
      categoryId: 1,
      inStock: true,
      onSale: false,
      rating: 4.2
    },
    3: { 
      id: 3, 
      name: "Garden Gloves", 
      slug: "garden-gloves",
      description: "Durable and comfortable",
      price: 9.99,
      imageUrl: "https://example.com/gloves.jpg",
      categoryId: 1,
      inStock: true,
      onSale: false,
      rating: 3.8
    }
  };
  
  if (products[productId]) {
    res.json(products[productId]);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Basic cart endpoint
apiRouter.get("/cart", (req, res) => {
  res.json({ items: [] });
});

// Basic blog endpoint
apiRouter.get("/blog", (req, res) => {
  res.json({ posts: [] });
});

// Basic testimonials endpoint
apiRouter.get("/testimonials", (req, res) => {
  res.json({ testimonials: [] });
});

// Basic user auth endpoint
apiRouter.get("/users/me", (req, res) => {
  res.json({ user: null });
});

// Mount API router
app.use("/api", apiRouter);

// Fallback route for API
app.use((req, res) => {
  log(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: "API endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  log(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ message: "Internal Server Error" });
});

// Create serverless handler
const serverlessHandler = serverless(app);

// Export the handler function
export const handler = async (event, context) => {
  log('Request received', { 
    path: event.path, 
    httpMethod: event.httpMethod, 
    queryStringParameters: event.queryStringParameters 
  });
  
  // Process the request through the serverless-http wrapper
  const result = await serverlessHandler(event, context);
  
  log('Response sent', { 
    statusCode: result.statusCode, 
    headers: result.headers 
  });
  
  return result;
};
