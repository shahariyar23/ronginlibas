import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { CloudinaryService } from '../services/cloudinary.service.js';

class DeleteProductImageDto {
  @IsString()
  @IsNotEmpty()
  publicId: string;
}

@ApiTags('Admin - Product Images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Controller('admin/products/images')
export class AdminProductImagesController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Upload a product image to Cloudinary' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)) {
          callback(new BadRequestException('Only JPEG, PNG, WEBP, and AVIF images are allowed'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file?: { buffer: Buffer; mimetype: string },
  ) {
    if (!file) throw new BadRequestException('An image file is required');
    const uploaded = await this.cloudinary.uploadProductImage(file.buffer);
    return {
      message: 'Product image uploaded successfully',
      data: { url: uploaded.secure_url, publicId: uploaded.public_id },
    };
  }

  @Delete('cleanup')
  @ApiBody({ type: DeleteProductImageDto })
  @ApiOperation({ summary: 'Delete an unassociated product image from Cloudinary' })
  async destroy(@Body() dto: DeleteProductImageDto) {
    await this.cloudinary.destroyProductImage(dto.publicId);
    return { message: 'Product image deleted successfully' };
  }
}
