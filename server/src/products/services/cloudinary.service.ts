import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

const PRODUCT_IMAGE_FOLDER = 'rongin-libas/products';
const REVIEW_IMAGE_FOLDER = 'rongin-libas/reviews';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {}

  async uploadProductImage(
    buffer: Buffer,
  ): Promise<Pick<UploadApiResponse, 'secure_url' | 'public_id'>> {
    this.configure();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: PRODUCT_IMAGE_FOLDER, resource_type: 'image' },
        (error, result) => {
          if (error) {
            reject(new ServiceUnavailableException('Cloudinary image upload failed'));
            return;
          }
          if (!result?.secure_url || !result.public_id) {
            reject(new InternalServerErrorException('Cloudinary returned an incomplete image result'));
            return;
          }
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        },
      );
      stream.end(buffer);
    });
  }

  async uploadReviewImage(
    buffer: Buffer,
  ): Promise<Pick<UploadApiResponse, 'secure_url' | 'public_id'>> {
    this.configure();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: REVIEW_IMAGE_FOLDER, resource_type: 'image' },
        (error, result) => {
          if (error) {
            reject(new ServiceUnavailableException('Cloudinary review image upload failed'));
            return;
          }
          if (!result?.secure_url || !result.public_id) {
            reject(new InternalServerErrorException('Cloudinary returned an incomplete image result'));
            return;
          }
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        },
      );
      stream.end(buffer);
    });
  }

  async destroyProductImage(publicId: string): Promise<void> {
    if (!publicId.startsWith(`${PRODUCT_IMAGE_FOLDER}/`)) {
      throw new InternalServerErrorException('Refusing to delete an image outside the product image folder');
    }

    this.configure();
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
        resource_type: 'image',
      });
      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new ServiceUnavailableException('Cloudinary did not confirm image deletion');
      }
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('Cloudinary image deletion failed');
    }
  }

  private configure(): void {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException('Cloudinary is not configured on the server');
    }
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  }
}
