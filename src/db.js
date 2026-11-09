import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`[db] Connected to MongoDB (${mongoose.connection.name})`);
  mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('[db] MongoDB reconnected'));
}

export const isDBConnected = () => mongoose.connection.readyState === 1;
