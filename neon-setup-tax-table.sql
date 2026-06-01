-- Direct SQL to create TaxSettings table in Neon
-- Copy and paste this into your Neon SQL editor at https://console.neon.tech

-- Drop if exists (cleanup from failed migration)
DROP TABLE IF EXISTS "TaxSettings" CASCADE;

-- Create TaxSettings table
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

-- Create indexes
CREATE UNIQUE INDEX "TaxSettings_userId_taxYear_key" ON "TaxSettings"("userId", "taxYear");
CREATE INDEX "TaxSettings_userId_idx" ON "TaxSettings"("userId");

-- Verify table was created
SELECT 'TaxSettings table created successfully' as status;
