import { Router } from 'express';
import { prisma } from '../config/database';
import { ObjectId } from 'mongodb';

const router = Router();

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend format
    const transformedOrders = orders.map((order) => ({
      _id: order.id,
      orderId: order.orderId,
      userId: order.userId,
      displayName: order.displayName,
      tableNumber: order.tableNumber,
      items: order.items.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    if (!status || !['Received', 'Preparing', 'Ready', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    // Transform to match frontend format
    const transformedOrder = {
      _id: order.id,
      orderId: order.orderId,
      userId: order.userId,
      displayName: order.displayName,
      tableNumber: order.tableNumber,
      items: order.items.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    res.json(transformedOrder);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;


