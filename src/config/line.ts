import { Client, MiddlewareConfig } from '@line/bot-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const lineConfig: MiddlewareConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

// Lazy initialization of LINE client to avoid errors when tokens are missing
let _lineClient: Client | null = null;

export function getLineClient(): Client | null {
  if (_lineClient) {
    return _lineClient;
  }
  
  if (process.env.LINE_CHANNEL_ACCESS_TOKEN && process.env.LINE_CHANNEL_SECRET) {
    try {
      _lineClient = new Client(lineConfig);
      return _lineClient;
    } catch (error) {
      console.warn('Failed to initialize LINE client:', error);
      return null;
    }
  }
  
  return null;
}

export function validateLineConfig(): void {
  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set in environment variables');
  }
  if (!process.env.LINE_CHANNEL_SECRET) {
    throw new Error('LINE_CHANNEL_SECRET is not set in environment variables');
  }
}

export async function sendPushMessage(
  userId: string,
  message: string
): Promise<void> {
  const client = getLineClient();
  if (!client) {
    console.warn('LINE client not configured. Skipping push message.');
    return;
  }
  try {
    await client.pushMessage(userId, {
      type: 'text',
      text: message,
    });
    console.log(`Push message sent to userId: ${userId}`);
  } catch (error) {
    console.error('Error sending push message:', error);
    throw error;
  }
}

export async function sendOrderConfirmation(
  userId: string,
  orderId: string,
  tableNumber: string
): Promise<void> {
  const messageEn = `🍱 Thank you. Your order from Table ${tableNumber} has been received. Order ID: ${orderId}. We will notify you when it is ready.`;
  const messageJp = `🍱 ご注文ありがとうございます。テーブル ${tableNumber} のご注文を受け付けました。注文番号: ${orderId}。準備ができ次第お知らせします。`;
  
  const message = `${messageEn}\n\n${messageJp}`;
  
  await sendPushMessage(userId, message);
}
