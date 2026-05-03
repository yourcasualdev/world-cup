import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

let isConnected = false;

export const connectRedis = async () => {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
    console.log('📦 Redis bağlandı.');
  }
};

export const getCache = async (key: string) => {
  if (!isConnected) await connectRedis();
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const setCache = async (key: string, value: any, ttlInSeconds = 30) => {
  if (!isConnected) await connectRedis();
  await redisClient.setEx(key, ttlInSeconds, JSON.stringify(value));
};

export default redisClient;
