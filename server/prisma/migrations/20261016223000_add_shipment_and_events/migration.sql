-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ShipmentStatus') THEN
        CREATE TYPE "ShipmentStatus" AS ENUM (
            'PENDING',
            'IN_REVIEW',
            'IN_TRANSIT',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'PARTIAL_DELIVERED',
            'CANCELLED',
            'ON_HOLD',
            'RETURNED',
            'UNKNOWN'
        );
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "shipments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'STEADFAST',
    "consignmentId" TEXT,
    "trackingCode" TEXT,
    "providerInvoice" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "providerStatus" TEXT,
    "codAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "deliveryCharge" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "returnCharge" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "trackingUrl" TEXT,
    "recipientName" TEXT,
    "recipientPhone" TEXT,
    "recipientAddress" TEXT,
    "note" TEXT,
    "metadata" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "shipment_events" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'SYSTEM',
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "shipments_provider_consignmentId_key" ON "shipments"("provider", "consignmentId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "shipments_provider_trackingCode_key" ON "shipments"("provider", "trackingCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "shipments_orderId_idx" ON "shipments"("orderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "shipments_provider_providerInvoice_idx" ON "shipments"("provider", "providerInvoice");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "shipment_events_shipmentId_createdAt_idx" ON "shipment_events"("shipmentId", "createdAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'shipments_orderId_fkey'
    ) THEN
        ALTER TABLE "shipments" ADD CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'shipment_events_shipmentId_fkey'
    ) THEN
        ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
