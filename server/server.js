import 'dotenv/config';
import { configureDnsServers } from './config/dns.js';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';

configureDnsServers();

const app = createApp();
const port = Number(process.env.PORT) || 5000;

try {
  await connectDatabase();
} catch (error) {
  console.warn(`MongoDB is not connected: ${error.message}`);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`AI Mystery Room API listening on port ${port}`);
});
