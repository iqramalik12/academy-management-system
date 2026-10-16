import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('ℹ️ [Database] No MONGO_URI provided in environment. Utilizing active in-memory repository with pre-seeded data.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ [Database] Connected successfully to MongoDB:', mongoUri.split('@')[1] || 'Cluster');
    return true;
  } catch (error) {
    console.warn('⚠️ [Database] Could not connect to external MongoDB URI. Falling back seamlessly to active in-memory repository:', (error as Error).message);
    isConnected = false;
    return false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
