import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for development and production
app.use(cors({
  origin: true, // Allow frontend during development
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Base route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'TCH Health & Support Services API',
    description: 'Townsville clinical nursing, yard & home care, and agency staffing services backend.',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'online'
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred on the server.'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  TCH Health Backend API Server Running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Ready for requests from TCH_FE frontend.`);
  console.log(`====================================================`);
});

export default app;
