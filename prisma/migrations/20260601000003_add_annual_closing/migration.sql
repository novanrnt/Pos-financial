-- CreateTable
CREATE TABLE IF NOT EXISTS "AnnualClosing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalIncome" DECIMAL(18,2) NOT NULL,
    "totalExpense" DECIMAL(18,2) NOT NULL,
    "netIncome" DECIMAL(18,2) NOT NULL,
    "totalAssets" DECIMAL(18,2) NOT NULL,
    "totalLiabilities" DECIMAL(18,2) NOT NULL,
    "taxPaid" DECIMAL(18,2) NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualClosing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AnnualClosing_userId_year_key" ON "AnnualClosing"("userId", "year");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnnualClosing_userId_idx" ON "AnnualClosing"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnnualClosing_year_idx" ON "AnnualClosing"("year");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'AnnualClosing_userId_fkey'
    ) THEN
        ALTER TABLE "AnnualClosing"
        ADD CONSTRAINT "AnnualClosing_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
