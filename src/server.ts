import app from './app';
import { env, isDevelopment } from './config/env';
import { connectDatabase } from './config/database';
import { ensureAdminUser } from './utils/seedAdmin';
import { ensureInventory } from './utils/seedInventory';
import { seedProducts } from './utils/seedProducts';
import { verifyStartup } from './utils/verifyStartup';

const PORT = env.port;

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error:', error.name, error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

let server: ReturnType<typeof app.listen>;

const startServer = async () => {
  await connectDatabase();
  console.log('\n📋 Initializing required data...');
  await ensureAdminUser();
  await ensureInventory();
  await seedProducts();

  console.log('\n🔍 Verifying startup requirements...');
  await verifyStartup();

  server = app.listen(PORT, () => {
    console.log('\n🚀 Server started successfully!\n');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│  Hanuman Bhatta API Server                  │');
    console.log('└─────────────────────────────────────────────┘\n');
    console.log(`📍 Environment:     ${env.nodeEnv}`);
    console.log(`🌐 Server URL:      http://localhost:${PORT}`);
    console.log(`🔗 API Endpoint:    http://localhost:${PORT}/api/${env.apiVersion}`);
    console.log(`❤️  Health Check:    http://localhost:${PORT}/api/${env.apiVersion}/health`);
    console.log(`🏓 Ping Endpoint:   http://localhost:${PORT}/api/${env.apiVersion}/health/ping`);
    console.log(`🔐 Admin Login:     http://localhost:${PORT}/api/${env.apiVersion}/auth/login`);
    console.log(`\n🔧 CORS Origin:     ${env.corsOrigin}`);
    console.log(`\n⏰ Started at:      ${new Date().toLocaleString()}\n`);
    
    if (isDevelopment) {
      console.log('💡 Development mode - detailed logging enabled\n');
    }
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Reason:', reason.name, reason.message);
  console.error('Stack:', reason.stack);
  
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');

  if (server) {
    server.close(() => {
      console.log('✅ Process terminated!\n');
    });
  }
});

// Export for testing purposes
export { server };
