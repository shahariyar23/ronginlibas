CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE');

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "phone" DROP NOT NULL,
ADD COLUMN "photoUrl" TEXT;

ALTER TABLE "customer_archives" ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "auth_identities" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_identities_customerId_idx" ON "auth_identities"("customerId");
CREATE UNIQUE INDEX "auth_identities_provider_providerUserId_key" ON "auth_identities"("provider", "providerUserId");

-- AddForeignKey
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
