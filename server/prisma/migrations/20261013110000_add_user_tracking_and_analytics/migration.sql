-- CreateTable
CREATE TABLE "analytics_visitors" (
    "id" TEXT NOT NULL,
    "visitorToken" TEXT NOT NULL,
    "customerId" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipHash" TEXT,

    CONSTRAINT "analytics_visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_sessions" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "landingPage" TEXT,
    "referrer" TEXT,
    "deviceType" TEXT,

    CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "productId" TEXT,
    "pagePath" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "engagementDuration" INTEGER,
    "properties" JSONB,
    "campaignSource" TEXT,
    "campaignMedium" TEXT,
    "campaignName" TEXT,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_consents" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_conversion_logs" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "responseCode" INTEGER,
    "responseBody" JSONB,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meta_conversion_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "analytics_visitors_visitorToken_key" ON "analytics_visitors"("visitorToken");

-- CreateIndex
CREATE INDEX "analytics_visitors_visitorToken_idx" ON "analytics_visitors"("visitorToken");

-- CreateIndex
CREATE INDEX "analytics_visitors_customerId_idx" ON "analytics_visitors"("customerId");

-- CreateIndex
CREATE INDEX "analytics_visitors_lastSeenAt_idx" ON "analytics_visitors"("lastSeenAt");

-- CreateIndex
CREATE INDEX "analytics_sessions_visitorId_startedAt_idx" ON "analytics_sessions"("visitorId", "startedAt");

-- CreateIndex
CREATE INDEX "analytics_sessions_lastActiveAt_idx" ON "analytics_sessions"("lastActiveAt");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_timestamp_idx" ON "analytics_events"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_visitorId_timestamp_idx" ON "analytics_events"("visitorId", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_productId_eventType_idx" ON "analytics_events"("productId", "eventType");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- CreateIndex
CREATE INDEX "analytics_consents_visitorId_idx" ON "analytics_consents"("visitorId");

-- CreateIndex
CREATE INDEX "meta_conversion_logs_status_createdAt_idx" ON "meta_conversion_logs"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "meta_conversion_logs_orderId_eventName_key" ON "meta_conversion_logs"("orderId", "eventName");

-- AddForeignKey
ALTER TABLE "analytics_visitors" ADD CONSTRAINT "analytics_visitors_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_sessions" ADD CONSTRAINT "analytics_sessions_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "analytics_visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "analytics_visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "analytics_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_consents" ADD CONSTRAINT "analytics_consents_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "analytics_visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
