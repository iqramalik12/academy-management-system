import dotenv from 'dotenv';
dotenv.config();

import { connectDB, isMongoConnected } from '../config/db.ts';
import { store } from '../services/store.ts';

export async function runSeed() {
  console.log('🚀 [Seed] Initializing Academy Management System Database Seed...');
  const connected = await connectDB();

  if (connected) {
    await store.initMongoSync();
    console.log('✅ [Seed] Successfully initialized seed data into MongoDB.');
  } else {
    console.log('✅ [Seed] In-memory repository loaded with default initial demo data.');
  }

  console.log('\n================ DEMO CREDENTIALS ================');
  console.log('Admin:   admin@academy.com    / password123');
  console.log('Teacher: teacher@academy.com  / password123');
  console.log('Student: student@academy.com  / password123');
  console.log('==================================================\n');
}

// If executed directly
if (process.argv[1]?.includes('seedData')) {
  runSeed().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
