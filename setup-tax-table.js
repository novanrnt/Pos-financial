#!/usr/bin/env node

/**
 * Direct database setup for TaxSettings table
 * Run with: node setup-tax-table.js
 */

const { PrismaClient } = require('@prisma/client');

async function setupTaxTable() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Setting up TaxSettings table...');
    
    // Drop existing table if it exists
    console.log('Dropping existing TaxSettings table if it exists...');
    await prisma.$executeRawUnsafe(`
      DROP TABLE IF EXISTS "TaxSettings" CASCADE;
    `);
    console.log('✅ Existing table dropped');
    
    // Create the TaxSettings table
    console.log('Creating TaxSettings table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "TaxSettings" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "taxYear" INTEGER NOT NULL,
        "ptkpStatus" TEXT NOT NULL,
        "calculationMethod" TEXT NOT NULL,
        "manualPph21Withheld" DECIMAL(18,2) NOT NULL DEFAULT 0,
        "manualCommissionTaxWithheld" DECIMAL(18,2) NOT NULL DEFAULT 0,
        "manualTaxPaid" DECIMAL(18,2) NOT NULL DEFAULT 0,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "TaxSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
      );
    `);
    console.log('✅ TaxSettings table created');
    
    // Create indexes
    console.log('Creating indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "TaxSettings_userId_taxYear_key" ON "TaxSettings"("userId", "taxYear");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX "TaxSettings_userId_idx" ON "TaxSettings"("userId");
    `);
    console.log('✅ Indexes created');
    
    // Verify table exists
    console.log('Verifying table creation...');
    const result = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'TaxSettings';
    `);
    
    if (result.length > 0) {
      console.log('✅ TaxSettings table verified in database');
      console.log('\n🎉 Tax feature setup complete! You can now use the tax page.\n');
    } else {
      console.error('❌ TaxSettings table not found after creation');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTaxTable();
