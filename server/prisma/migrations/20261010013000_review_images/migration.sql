-- AlterTable
ALTER TABLE "reviews" ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
