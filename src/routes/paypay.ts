import { Router } from 'express';

const router = Router();

// GET /api/paypay/qr/:orderId
// Generates a QR that points to the frontend payment page for this order.
// The frontend base URL can be configured via FRONTEND_BASE_URL (.env).
router.get('/qr/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const normalizedBase = frontendBase.endsWith('/') ? frontendBase.slice(0, -1) : frontendBase;
    const paymentUrl = `${normalizedBase}/payment/${encodeURIComponent(orderId)}`;

    // Use public QR generator to return a QR image URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`;

    res.json({
      orderId,
      paymentUrl,
      qrUrl,
      provider: 'qrserver.com',
    });
  } catch (error: any) {
    console.error('Error generating PayPay QR:', error);
    res.status(500).json({
      error: 'Failed to generate PayPay QR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

