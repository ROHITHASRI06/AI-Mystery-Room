import mongoose from 'mongoose';

export async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri?.trim()) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');
  return mongoose.connection;
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
