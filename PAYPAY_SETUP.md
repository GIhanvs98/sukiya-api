# PayPay API Integration Setup

This document explains how to configure PayPay API for generating real payment QR codes.

## Overview

The PayPay integration allows the system to generate actual PayPay Dynamic QR codes that customers can scan to complete payments. If PayPay API is not configured, the system will fall back to generating a generic QR code that links to the payment page.

## Prerequisites

1. **PayPay Developer Account**: Register at [PayPay for Developers](https://developer.paypay.ne.jp/)
2. **API Credentials**: Obtain your API credentials from the PayPay developer dashboard:
   - API Key
   - API Secret
   - Merchant ID

## Environment Variables

Add the following environment variables to your `.env` file or deployment environment:

```env
# PayPay API Configuration (Required)
PAYPAY_API_KEY=your_api_key_here
PAYPAY_API_SECRET=your_api_secret_here

# PayPay Merchant ID (Optional - required for some account types)
PAYPAY_MERCHANT_ID=your_merchant_id_here

# Optional: Set to 'production' for production environment
# Leave unset or set to 'sandbox' for testing
PAYPAY_ENVIRONMENT=sandbox
```

### Environment Variable Details

- **PAYPAY_API_KEY** (Required): Your PayPay API Key (obtained from PayPay Developer Dashboard)
- **PAYPAY_API_SECRET** (Required): Your PayPay API Secret (obtained from PayPay Developer Dashboard)
- **PAYPAY_MERCHANT_ID** (Optional): Your PayPay Merchant ID (required for some PayPay account types, obtained from PayPay Developer Dashboard)
- **PAYPAY_ENVIRONMENT** (Optional): 
  - `sandbox` or unset: Uses PayPay sandbox API (for testing)
  - `production`: Uses PayPay production API (for live payments)

## API Endpoints

### GET `/api/paypay/qr/:orderId`

Generates a PayPay Dynamic QR code for the specified order.

**Request:**
```
GET /api/paypay/qr/ORD12345
```

**Response (PayPay API configured):**
```json
{
  "orderId": "ORD12345",
  "qrUrl": "https://paypay.ne.jp/qr/...",
  "codeId": "code_id_from_paypay",
  "amount": 1500,
  "currency": "JPY",
  "provider": "paypay"
}
```

**Response (Fallback - PayPay API not configured):**
```json
{
  "orderId": "ORD12345",
  "paymentUrl": "http://localhost:3000/payment/ORD12345",
  "qrUrl": "https://api.qrserver.com/v1/create-qr-code/...",
  "provider": "qrserver.com",
  "note": "PayPay API not configured, using fallback QR code"
}
```

## How It Works

1. **When PayPay API is configured:**
   - The system fetches the order details from the database
   - Creates a PayPay Dynamic QR code using the PayPay API
   - Returns the PayPay QR code URL that customers can scan

2. **When PayPay API is not configured:**
   - The system generates a generic QR code that links to the payment page
   - This allows the system to function even without PayPay API credentials
   - Useful for development and testing

## Testing

### Sandbox Testing

1. Set `PAYPAY_ENVIRONMENT=sandbox` (or leave unset)
2. Use sandbox API credentials from PayPay Developer Dashboard
3. Test QR code generation with test orders

### Production

1. Set `PAYPAY_ENVIRONMENT=production`
2. Use production API credentials from PayPay Developer Dashboard
3. Ensure all credentials are securely stored

## Error Handling

The system includes robust error handling:

- If PayPay API authentication fails, it falls back to the generic QR code
- If order is not found, returns 404 error
- If order is already paid, returns 400 error
- All errors are logged for debugging

## Security Notes

- **Never commit API credentials to version control**
- Store credentials in environment variables only
- Use different credentials for development and production
- Regularly rotate API secrets
- Monitor API usage in PayPay Developer Dashboard

## Support

For PayPay API issues:
- [PayPay Developer Documentation](https://developer.paypay.ne.jp/)
- [PayPay Integration Support](https://integration.paypay.ne.jp/)

