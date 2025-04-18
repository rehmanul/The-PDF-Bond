
// Simple server start script using ES Module syntax for compatibility with package.json type: module
import express from 'express';
import http from 'http';
import cors from 'cors';

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());

  // Basic logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.path.startsWith('/api')) {
        console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  try {
    // API endpoints
    const apiRouter = express.Router();

    // Basic health check endpoint
    apiRouter.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });

    // Get all categories
    apiRouter.get("/categories", async (req, res) => {
      res.json([
        { id: 1, name: "Electronics", image: "https://source.unsplash.com/random/300x300/?electronics" },
        { id: 2, name: "Clothing", image: "https://source.unsplash.com/random/300x300/?clothing" },
        { id: 3, name: "Home & Garden", image: "https://source.unsplash.com/random/300x300/?home" },
        { id: 4, name: "Sports", image: "https://source.unsplash.com/random/300x300/?sports" }
      ]);
    });

    // Get products with filters
    apiRouter.get("/products", async (req, res) => {
      res.json([
        { id: 1, name: "Product 1", price: 99.99, categoryId: 1, image: "https://source.unsplash.com/random/300x300/?electronics" },
        { id: 2, name: "Product 2", price: 49.99, categoryId: 2, image: "https://source.unsplash.com/random/300x300/?clothing" },
        { id: 3, name: "Product 3", price: 129.99, categoryId: 3, image: "https://source.unsplash.com/random/300x300/?home" }
      ]);
    });

    // Mount the API router
    app.use("/api", apiRouter);

    // Error handler
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error(err);
    });

    // Create server
    const httpServer = http.createServer(app);

    // Start the server
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
