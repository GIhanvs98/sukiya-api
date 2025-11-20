import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma, getMongoDb } from '../config/database';
import { ObjectId } from 'mongodb';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate required fields
    if (!userId || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields: !userId ? ['userId'] : ['password']
      });
    }

    // Find user by userId using native MongoDB driver to get password field
    const db = await getMongoDb();
    const user = await db.collection('users').findOne({
      userId: userId.trim()
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Check if user has admin role
    if (user.role !== 'Admin' && user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied. Admin or Manager role required' });
    }

    // Check if user has a password set
    if (!user.password) {
      return res.status(401).json({ 
        error: 'Password not set for this account. Please set a password first.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.userId,
        id: user.id,
        role: user.role,
        displayName: user.displayName
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password) and token
    res.json({
      token,
      user: {
        _id: user._id.toString(),
        id: user._id.toString(),
        userId: user.userId,
        displayName: user.displayName,
        email: user.email || undefined,
        phone: user.phone || undefined,
        role: user.role.toLowerCase(),
        isActive: user.isActive,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : new Date(user.createdAt).toISOString(),
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : new Date(user.updatedAt).toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      error: 'Failed to authenticate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/verify - Verify token
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      res.json({
        valid: true,
        user: {
          _id: user.id,
          id: user.id,
          userId: user.userId,
          displayName: user.displayName,
          email: user.email,
          phone: user.phone,
          role: user.role.toLowerCase(),
          isActive: user.isActive,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      });
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error: any) {
    console.error('Error verifying token:', error);
    res.status(500).json({ 
      error: 'Failed to verify token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/set-password - Set password for admin user (for initial setup)
router.post('/set-password', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields: !userId ? ['userId'] : ['password']
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { userId: userId.trim() },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has admin role
    if (user.role !== 'Admin' && user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied. Admin or Manager role required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password using native MongoDB driver
    const db = await getMongoDb();
    await db.collection('users').updateOne(
      { _id: new ObjectId(user.id) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    res.json({ message: 'Password set successfully' });
  } catch (error: any) {
    console.error('Error setting password:', error);
    res.status(500).json({ 
      error: 'Failed to set password',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

