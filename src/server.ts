import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database';
import { validateLineConfig } from './config/line';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running' });
});

async function startServer() {
  try {
    try {
      validateLineConfig();
      console.log('✅ LINE configuration validated');
    } catch (error) {
      console.warn('⚠️  LINE configuration not set. Push notifications will not work.');
      console.warn('   Set LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET in .env');
    }

    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Database: Connected to MongoDB`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await disconnectDatabase();
  process.exit(0);
});

startServer();

