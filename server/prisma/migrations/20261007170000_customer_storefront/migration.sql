ALTER TABLE "users"
ADD COLUMN "refreshTokenHash" TEXT;

ALTER TABLE "customers"
ADD COLUMN "refreshTokenHash" TEXT,
ADD COLUMN "resetTokenHash" TEXT,
ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "secondaryPhone" TEXT,
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "preferredSize" TEXT,
ADD COLUMN "preferredFit" TEXT,
ADD COLUMN "marketingConsent" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "addresses"
ADD COLUMN "fullName" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "area" TEXT,
ADD COLUMN "deliveryInstructions" TEXT;

ALTER TABLE "products"
ADD COLUMN "shortDescription" TEXT,
ADD COLUMN "fabricOrigin" TEXT,
ADD COLUMN "gsm" INTEGER,
ADD COLUMN "careInstructions" TEXT,
ADD COLUMN "isExpressAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "product_variants"
ADD COLUMN "sizeLabel" TEXT,
ADD COLUMN "measurements" JSONB;

ALTER TABLE "orders"
ALTER COLUMN "customerId" DROP NOT NULL,
ADD COLUMN "guestName" TEXT,
ADD COLUMN "guestEmail" TEXT,
ADD COLUMN "guestPhone" TEXT,
ADD COLUMN "trackingTokenHash" TEXT,
ADD COLUMN "courierName" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "trackingUrl" TEXT,
ADD COLUMN "estimatedDelivery" TIMESTAMP(3);

ALTER TABLE "orders"
DROP CONSTRAINT IF EXISTS "orders_customerId_fkey",
ADD CONSTRAINT "orders_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "customers"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order_items"
ADD COLUMN "size" TEXT,
ADD COLUMN "color" TEXT,
ADD COLUMN "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

CREATE INDEX "products_isActive_createdAt_idx" ON "products"("isActive", "createdAt");
CREATE INDEX "products_categoryId_isActive_idx" ON "products"("categoryId", "isActive");
CREATE INDEX "products_gender_isActive_idx" ON "products"("gender", "isActive");
CREATE INDEX "products_isFeatured_isActive_idx" ON "products"("isFeatured", "isActive");
CREATE INDEX "products_isBestSeller_isActive_idx" ON "products"("isBestSeller", "isActive");
CREATE INDEX "orders_customerId_createdAt_idx" ON "orders"("customerId", "createdAt");
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt");
CREATE INDEX "reviews_productId_status_createdAt_idx" ON "reviews"("productId", "status", "createdAt");
CREATE INDEX "reviews_customerId_productId_idx" ON "reviews"("customerId", "productId");

WITH ranked_defaults AS (
    SELECT "id", ROW_NUMBER() OVER (
        PARTITION BY "customerId" ORDER BY "createdAt" ASC, "id" ASC
    ) AS position
    FROM "addresses"
    WHERE "isDefault" = true
)
UPDATE "addresses" AS address
SET "isDefault" = false
FROM ranked_defaults
WHERE address."id" = ranked_defaults."id"
  AND ranked_defaults.position > 1;

CREATE UNIQUE INDEX "addresses_one_default_per_customer_idx"
ON "addresses"("customerId") WHERE "isDefault" = true;

CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "guestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "carts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "carts_identity_check" CHECK ("customerId" IS NOT NULL OR "guestId" IS NOT NULL)
);

CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_measurement_profiles" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "chest" DECIMAL(6,2),
    "shoulder" DECIMAL(6,2),
    "sleeveLength" DECIMAL(6,2),
    "collar" DECIMAL(6,2),
    "waist" DECIMAL(6,2),
    "trouserLength" DECIMAL(6,2),
    "garmentLength" DECIMAL(6,2),
    "tailoringNotes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customer_measurement_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_tracking_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "description" TEXT,
    "customerVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_tracking_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_relations" (
    "id" TEXT NOT NULL,
    "sourceProductId" TEXT NOT NULL,
    "targetProductId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'RELATED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_relations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "review_votes" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_votes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "carts_customerId_key" ON "carts"("customerId");
CREATE UNIQUE INDEX "carts_guestId_key" ON "carts"("guestId");
CREATE UNIQUE INDEX "cart_items_cartId_variantId_key" ON "cart_items"("cartId", "variantId");
CREATE UNIQUE INDEX "wishlist_items_customerId_productId_key" ON "wishlist_items"("customerId", "productId");
CREATE UNIQUE INDEX "customer_measurement_profiles_customerId_key" ON "customer_measurement_profiles"("customerId");
CREATE INDEX "order_tracking_events_orderId_createdAt_idx" ON "order_tracking_events"("orderId", "createdAt");
CREATE UNIQUE INDEX "product_relations_sourceProductId_targetProductId_relationType_key" ON "product_relations"("sourceProductId", "targetProductId", "relationType");
CREATE INDEX "product_relations_sourceProductId_relationType_sortOrder_idx" ON "product_relations"("sourceProductId", "relationType", "sortOrder");
CREATE UNIQUE INDEX "review_votes_reviewId_customerId_key" ON "review_votes"("reviewId", "customerId");
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

ALTER TABLE "carts"
ADD CONSTRAINT "carts_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "customers"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cart_items"
ADD CONSTRAINT "cart_items_cartId_fkey"
FOREIGN KEY ("cartId") REFERENCES "carts"("id")
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "cart_items_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "products"("id")
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "cart_items_variantId_fkey"
FOREIGN KEY ("variantId") REFERENCES "product_variants"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "wishlist_items"
ADD CONSTRAINT "wishlist_items_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "customers"("id")
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "wishlist_items_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "products"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customer_measurement_profiles"
ADD CONSTRAINT "customer_measurement_profiles_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "customers"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_tracking_events"
ADD CONSTRAINT "order_tracking_events_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "orders"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_relations"
ADD CONSTRAINT "product_relations_sourceProductId_fkey"
FOREIGN KEY ("sourceProductId") REFERENCES "products"("id")
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "product_relations_targetProductId_fkey"
FOREIGN KEY ("targetProductId") REFERENCES "products"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "review_votes"
ADD CONSTRAINT "review_votes_reviewId_fkey"
FOREIGN KEY ("reviewId") REFERENCES "reviews"("id")
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "review_votes_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "customers"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
