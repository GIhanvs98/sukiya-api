import { Router } from 'express';
import { prisma, getMongoDb } from '../config/database';
import { ObjectId } from 'mongodb';

const router = Router();

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    // Use native MongoDB driver for more reliable querying
    const db = await getMongoDb();
    
    // Fetch orders
    const orders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch all order items
    const orderItemsMap = new Map();
    if (orders.length > 0) {
      const orderIds = orders.map(order => order._id);
      const orderItems = await db.collection('order_items')
        .find({ orderId: { $in: orderIds } })
        .toArray();
      
      // Group items by orderId
      orderItems.forEach(item => {
        const orderIdStr = item.orderId.toString();
        if (!orderItemsMap.has(orderIdStr)) {
          orderItemsMap.set(orderIdStr, []);
        }
        orderItemsMap.get(orderIdStr).push(item);
      });
    }

    // Transform to match frontend format
    const transformedOrders = orders.map((order) => {
      const orderIdStr = order._id.toString();
      const items = (orderItemsMap.get(orderIdStr) || []).map((item: any) => ({
        itemId: item.itemId.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      return {
        _id: order._id.toString(),
        id: order._id.toString(),
        orderId: order.orderId,
        userId: order.userId,
        displayName: order.displayName,
        tableNumber: order.tableNumber,
        items: items,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date(order.createdAt).toISOString(),
        updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : new Date(order.updatedAt).toISOString(),
      };
    });

    res.json(transformedOrders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
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

    // Use native MongoDB driver for writes (no replica set required)
    const db = await getMongoDb();
    const orderObjectId = new ObjectId(id);
    
    const result = await db.collection('orders').findOneAndUpdate(
      { _id: orderObjectId },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Fetch order items using native MongoDB driver
    const orderItems = await db.collection('order_items').find({
      orderId: orderObjectId
    }).toArray();

    // Transform to match frontend format
    const transformedOrder = {
      _id: result._id.toString(),
      id: result._id.toString(), // Include both id and _id for consistency
      orderId: result.orderId,
      userId: result.userId,
      displayName: result.displayName,
      tableNumber: result.tableNumber,
      items: orderItems.map((item) => ({
        itemId: item.itemId.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: result.total,
      status: result.status,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };

    res.json(transformedOrder);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      error: 'Failed to update order status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;




