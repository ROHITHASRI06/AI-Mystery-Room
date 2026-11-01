import mongoose from 'mongoose';

let diagnosticsRegistered = false;

function registerConnectionDiagnostics() {
  if (diagnosticsRegistered) return;
  diagnosticsRegistered = true;

  mongoose.connection.on('connected', () => console.info('MongoDB connection established.'));
  mongoose.connection.on('disconnected', () => console.error('MongoDB connection lost.'));
  mongoose.connection.on('reconnected', () => console.info('MongoDB connection restored.'));
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error.', {
      name: error?.name || 'Error',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
  });
}

export async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri?.trim()) {
    throw new Error('MONGODB_URI is not configured.');
  }

  registerConnectionDiagnostics();

  await mongoose.connect(uri);

  return mongoose.connection;
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
