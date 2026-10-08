import { ServiceUnavailableException, InternalServerErrorException } from '@nestjs/common';
import { vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service.js';

describe('CloudinaryService', () => {
  it('reports missing Cloudinary credentials instead of pretending to upload', async () => {
    const config = { get: vi.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    const service = new CloudinaryService(config);

    await expect(service.uploadProductImage(Buffer.from('image'))).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('refuses to delete assets outside the managed product-image folder', async () => {
    const get = vi.fn();
    const config = { get } as unknown as ConfigService;
    const service = new CloudinaryService(config);

    await expect(service.destroyProductImage('unrelated/private-asset')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(get).not.toHaveBeenCalled();
  });
});
