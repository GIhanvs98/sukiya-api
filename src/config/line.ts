import { Client, MiddlewareConfig } from '@line/bot-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const lineConfig: MiddlewareConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

export const lineClient = new Client(lineConfig);

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
  try {
    await lineClient.pushMessage(userId, {
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
