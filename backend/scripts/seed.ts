import dotenv from 'dotenv';
import path from 'path';
import { MockDataGenerator } from '../src/utils/mockDataGenerator';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
  console.log('Starting database seed...');
  
  try {
    const generator = new MockDataGenerator();
    
    // Generate 50 mock cases
    const caseIds = await generator.generateMultipleCases(50);
    
    console.log('\n✓ Database seeded successfully!');
    console.log(`Created ${caseIds.length} mock cases`);
    console.log('\nYou can now:');
    console.log('1. Start the backend: npm run dev');
    console.log('2. Start the frontend: cd ../frontend && npm run dev');
    console.log('3. Login with any email/password (mock auth)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();