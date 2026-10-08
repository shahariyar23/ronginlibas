import { adminApi } from '@/lib/api';

export interface ProductImageDraft {
  url: string;
  publicId?: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  file?: File;
}

export async function uploadPendingProductImages(images: ProductImageDraft[]) {
  const savedImages: ProductImageDraft[] = [];
  const uploadedPublicIds: string[] = [];
  try {
    for (const image of images) {
      const file =
        image.file ??
        (image.url.startsWith('data:')
          ? new File([await (await fetch(image.url)).blob()], 'product-image')
          : undefined);
      if (!file) {
        savedImages.push(image);
        continue;
      }
      const result = await adminApi.products.uploadImage(file);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Product image upload failed');
      }
      uploadedPublicIds.push(result.data.publicId);
      savedImages.push({
        ...image,
        url: result.data.url,
        publicId: result.data.publicId,
        file: undefined,
      });
    }
    return { images: savedImages, uploadedPublicIds };
  } catch (error) {
    const cleanup = await Promise.all(
      uploadedPublicIds.map((publicId) => adminApi.products.destroyImage(publicId)),
    );
    const cleanupError = cleanup.find((result) => !result.success)?.error;
    if (cleanupError) {
      throw new AggregateError(
        [error, new Error(`Failed to clean up an uploaded image: ${cleanupError}`)],
        'Product image upload failed and an uploaded asset could not be cleaned up',
      );
    }
    throw error;
  }
}

export async function cleanupUploadedProductImages(publicIds: string[]) {
  const results = await Promise.all(
    publicIds.map((publicId) => adminApi.products.destroyImage(publicId)),
  );
  const failed = results.filter((result) => !result.success);
  if (failed.length) {
    throw new Error(
      `Product save failed and ${failed.length} uploaded image(s) could not be cleaned up: ${failed
        .map((result) => result.error)
        .filter(Boolean)
        .join('; ')}`,
    );
  }
}
