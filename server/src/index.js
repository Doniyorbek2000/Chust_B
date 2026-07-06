import { createApp } from './app.js';
import { config } from './config.js';
import './db/connection.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`✅ ChustMarket API ishga tushdi: http://localhost:${config.port}`);
});
