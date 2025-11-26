import app from '../src/server';
import { prisma, getMongoDb } from '../src/config/database';

// Vercel serverless function handler
// Ensure database connection is available per request
export default async function handler(req: any, res: any) {
  try {
    // Ensure Prisma is connected (reuses connection if already connected)
    if (!prisma.$isConnected) {
      await prisma.$connect();
    }
    
    // Ensure MongoDB native client is connected (reuses connection if already connected)
    try {
      await getMongoDb();
    } catch (error) {
      // If connection fails, log but continue (some routes might not need native client)
      console.warn('MongoDB native client connection warning:', error);
    }
    
    // Pass request to Express app
    return app(req, res);
  } catch (error) {
    console.error('Vercel handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Failed to initialize database connection',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      });
    }
  }
}
