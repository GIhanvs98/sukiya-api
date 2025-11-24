# Sukiya Restaurant Backend API

Backend API for QR-to-order system using LINE Mini App (LIFF + Messaging API).

## Tech Stack

- **Node.js** with **Express**
- **MongoDB** with **Prisma ORM**
- **LINE Messaging API** for push notifications

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: MongoDB connection string
- `LINE_CHANNEL_ACCESS_TOKEN`: LINE Messaging API channel access token
- `LINE_CHANNEL_SECRET`: LINE Messaging API channel secret
- `PORT`: Server port (default: 3001)

### 3. Set Up MongoDB

Make sure MongoDB is running locally or use a cloud MongoDB instance (MongoDB Atlas).

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

### 6. Seed Database (Optional)

```bash
npm run seed
```

## Database Models

### MenuItem
- `id`: ObjectId (auto-generated)
- `nameEn`: English name
- `nameJp`: Japanese name
- `price`: Price in JPY
- `imageUrl`: Image URL
- `category`: Category (Main Course, Appetizer, Dessert, Drink, Side Dish)
- `isActive`: Soft delete flag
- `createdAt`, `updatedAt`: Timestamps

### Order
- `id`: ObjectId (auto-generated)
- `orderId`: Human-readable order ID (e.g., ORD12345)
- `userId`: LINE userId
- `displayName`: LINE displayName
- `tableNumber`: Table number from QR
- `items`: Array of OrderItem
- `total`: Total price
- `status`: OrderStatus enum (Received, Preparing, Ready, Completed)
- `createdAt`, `updatedAt`: Timestamps

### OrderItem
- `id`: ObjectId (auto-generated)
- `orderId`: Reference to Order
- `itemId`: Reference to MenuItem
- `name`: Snapshot of item name at time of order
- `quantity`: Quantity ordered
- `price`: Snapshot of price at time of order

## LINE Integration

The backend uses LINE Messaging API to send push notifications to users after they place an order.

### Functions

- `sendPushMessage(userId, message)`: Send a text message to a LINE user
- `sendOrderConfirmation(userId, orderId, tableNumber)`: Send bilingual order confirmation message

## Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run prisma:generate`: Generate Prisma Client
- `npm run prisma:migrate`: Run database migrations
- `npm run prisma:studio`: Open Prisma Studio (database GUI)
- `npm run seed`: Seed database with sample menu items

## Next Steps

1. Create Express server (`src/server.ts`)
2. Implement API routes:
   - `GET /menu` - Get menu items
   - `POST /orders` - Create order
   - `POST /notify` - Send LINE notification
   - Admin routes for order management

