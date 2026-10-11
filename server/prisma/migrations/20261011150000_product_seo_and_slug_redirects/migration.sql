-- AlterTable
ALTER TABLE "categories" ADD COLUMN "seoTitle" TEXT,
ADD COLUMN "metaDescription" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN "seoTitle" TEXT,
ADD COLUMN "metaDescription" TEXT,
ADD COLUMN "canonicalUrl" TEXT;

-- CreateTable
CREATE TABLE "product_slug_redirects" (
    "id" TEXT NOT NULL,
    "sourceSlug" TEXT NOT NULL,
    "targetSlug" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_slug_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_redirects_sourceSlug_key" ON "product_slug_redirects"("sourceSlug");

-- CreateIndex
CREATE INDEX "product_slug_redirects_sourceSlug_idx" ON "product_slug_redirects"("sourceSlug");

-- CreateIndex
CREATE INDEX "product_slug_redirects_productId_idx" ON "product_slug_redirects"("productId");

-- AddForeignKey
ALTER TABLE "product_slug_redirects" ADD CONSTRAINT "product_slug_redirects_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
