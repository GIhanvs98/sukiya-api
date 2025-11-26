import { PrismaClient } from '@prisma/client';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Prisma client with connection pooling for serverless
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Optimize for serverless environments
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Native MongoDB client for write operations (avoids replica set requirement)
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  // Return existing connection if available
  if (mongoDb && mongoClient) {
    try {
      // Ping to check if connection is still alive
      await mongoDb.admin().ping();
      return mongoDb;
    } catch (error) {
      // Connection is dead, reset and reconnect
      console.warn('MongoDB connection lost, reconnecting...');
      mongoClient = null;
      mongoDb = null;
    }
  }
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }
  
  // Extract database name from connection string
  let dbName = 'sukiyarestaurant';
  try {
    const url = new URL(process.env.DATABASE_URL.replace('mongodb://', 'http://'));
    dbName = url.pathname.slice(1) || dbName;
  } catch {
    // If URL parsing fails, try to extract from connection string directly
    const match = process.env.DATABASE_URL.match(/\/([^?]+)/);
    if (match) {
      dbName = match[1];
    }
  }
  
  // Remove replica set requirement from connection string
  const cleanUrl = process.env.DATABASE_URL
    .replace(/[?&]replicaSet=[^&]*/g, '')
    .replace(/[?&]retryWrites=[^&]*/g, '')
    .replace(/[?&]w=[^&]*/g, '');
  
  try {
    mongoClient = new MongoClient(cleanUrl, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second connection timeout
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db(dbName);
    
    console.log('✅ Connected to MongoDB via native driver');
    return mongoDb;
  } catch (error: any) {
    // Reset on connection failure
    mongoClient = null;
    mongoDb = null;
    console.error('❌ Failed to connect to MongoDB:', error?.message || error);
    throw new Error(`MongoDB connection failed: ${error?.message || 'Unknown error'}`);
  }
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MongoDB via Prisma (read operations)');
    
    // Also connect native client for writes
    await getMongoDb();
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    if (mongoClient) {
      await mongoClient.close();
      mongoClient = null;
      mongoDb = null;
    }
    console.log('✅ Disconnected from database');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
    throw error;
  }
}

process.on('beforeExit', async () => {
  await disconnectDatabase();
});
