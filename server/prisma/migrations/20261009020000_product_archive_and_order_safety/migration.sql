-- 1. Add deletedAt to products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- 2. Create index on products(isActive, deletedAt)
CREATE INDEX IF NOT EXISTS "products_isActive_deletedAt_idx" ON "products"("isActive", "deletedAt");

-- 3. Make productId and variantId nullable on order_items
ALTER TABLE "order_items" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "order_items" ALTER COLUMN "variantId" DROP NOT NULL;

-- 4. Add productImage to order_items if not exists
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "productImage" TEXT;

-- 5. Drop old foreign key constraints on order_items and recreate with ON DELETE SET NULL
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_productId_fkey";
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_variantId_fkey";
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
