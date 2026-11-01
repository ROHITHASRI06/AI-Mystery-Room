import 'dotenv/config';
import { configureDnsServers } from './config/dns.js';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';

configureDnsServers();

const app = createApp();
const port = Number(process.env.PORT) || 5000;

// Do not advertise a ready API when every case route will reject on database state.
// Let the hosting platform restart the process and retry the initial connection.
await connectDatabase();

app.listen(port, '0.0.0.0', () => {
  console.log(`AI Mystery Room API listening on port ${port}`);
});
