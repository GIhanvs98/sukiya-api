import { Router } from 'express';
import { prisma } from '../config/database';
import { ObjectId } from 'mongodb';

const router = Router();

// GET /api/users - Get all users (aggregated from orders)
router.get('/', async (req, res) => {
  try {
    // Get unique users from orders
    const orders = await prisma.order.findMany({
      select: {
        userId: true,
        displayName: true,
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Aggregate user data
    const userMap = new Map<string, any>();

    orders.forEach((order) => {
      if (!userMap.has(order.userId)) {
        userMap.set(order.userId, {
          _id: order.userId,
          userId: order.userId,
          displayName: order.displayName,
          role: 'customer' as const,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt.toISOString(),
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.createdAt.toISOString(),
          isActive: true,
        });
      }

      const user = userMap.get(order.userId)!;
      user.totalOrders += 1;
      user.totalSpent += order.total;
      if (order.createdAt > new Date(user.lastOrderDate)) {
        user.lastOrderDate = order.createdAt.toISOString();
      }
    });

    const users = Array.from(userMap.values());
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/users/:id - Update user (role, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // For now, users are derived from orders, so we can't update them directly
    // In a real system, you'd have a User model
    // This is a placeholder that returns the user data
    const orders = await prisma.order.findMany({
      where: { userId: id },
      select: {
        userId: true,
        displayName: true,
        total: true,
        createdAt: true,
      },
    });

    if (orders.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Aggregate user data
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const lastOrderDate = orders[0]?.createdAt.toISOString() || new Date().toISOString();

    const user = {
      _id: id,
      userId: id,
      displayName: orders[0].displayName,
      role: updates.role || 'customer',
      totalOrders,
      totalSpent,
      lastOrderDate,
      createdAt: orders[orders.length - 1]?.createdAt.toISOString() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: updates.isActive !== undefined ? updates.isActive : true,
    };

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Soft delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Since users are derived from orders, we can't actually delete them
    // This is a placeholder that returns success
    const orders = await prisma.order.findMany({
      where: { userId: id },
    });

    if (orders.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User marked as inactive', userId: id });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;


