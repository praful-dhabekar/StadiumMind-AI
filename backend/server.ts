import { app } from './app';
import { config } from './config/env';

const PORT = config.port;
const HOST = '0.0.0.0'; // Bind to 0.0.0.0 for Cloud Run / Docker container accessibility

const server = app.listen(PORT, HOST, () => {
  console.log(`⚡ StadiumMind AI Copilot Cloud Backend running on http://${HOST}:${PORT} [Env: ${config.nodeEnv}]`);
});

/**
 * Graceful shutdown handler for Cloud Run instance termination signals.
 * Ensures existing requests complete cleanly before exiting container.
 */
function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    console.log('✅ HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });

  // Force exit if shutdown takes longer than 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully exiting process.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
