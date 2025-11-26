import app from '../src/server';
import { prisma, getMongoDb } from '../src/config/database';

// Vercel serverless function handler
// Ensure database connection is available per request
export default async function handler(req: any, res: any) {
  // Set timeout for serverless function (Vercel has 10s timeout for Hobby, 60s for Pro)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ 
        error: 'Gateway Timeout',
        message: 'Request took too long to process'
      });
    }
  }, 25000); // 25 seconds timeout

  try {
    // Ensure Prisma is connected
    // In serverless, connections are reused across invocations
    try {
      // Try to connect, but don't fail if already connected
      await prisma.$connect().catch(() => {
        // Ignore connection errors if already connected
      });
    } catch (error) {
      console.error('Prisma connection error:', error);
      // Continue anyway - some routes might work without Prisma
    }
    
    // Ensure MongoDB native client is connected (for routes that need it)
    // This is lazy-loaded, so it won't fail if not needed
    try {
      await getMongoDb().catch((error) => {
        // Log but don't fail - routes will handle their own connection needs
        console.warn('MongoDB native client connection warning:', error?.message || error);
      });
    } catch (error) {
      // Silently continue - routes will connect when needed
      console.warn('MongoDB connection attempt failed:', error?.message || error);
    }
    
    // Pass request to Express app
    // Express will handle the request and response
    app(req, res, () => {
      // If Express doesn't handle the route, clear timeout
      clearTimeout(timeout);
      if (!res.headersSent) {
        res.status(404).json({ error: 'Route not found' });
      }
    });
    
    // Clear timeout when response is finished
    res.on('finish', () => {
      clearTimeout(timeout);
    });
    
  } catch (error: any) {
    clearTimeout(timeout);
    console.error('Vercel handler error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'An error occurred processing your request',
        // Only show details in development
        ...(process.env.NODE_ENV === 'development' && {
          details: error?.message,
          type: error?.name
        })
      });
    }
  }
}
