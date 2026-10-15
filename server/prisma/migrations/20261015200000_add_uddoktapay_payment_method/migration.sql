-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'UDDOKTAPAY';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "providerInvoiceId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "payments_providerInvoiceId_idx" ON "payments"("providerInvoiceId");
