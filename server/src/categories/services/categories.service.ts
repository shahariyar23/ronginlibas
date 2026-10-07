import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ProductsService } from '../../products/services/products.service.js';
import { ProductQueryDto } from '../../products/dto/product-query.dto.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(isAdmin = false) {
    if (isAdmin) {
      return this.prisma.category.findMany({
        include: {
          children: true,
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
      });
    }
    return this.prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        parentId: true,
        sortOrder: true,
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, description: true, image: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        parentId: true,
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, description: true, image: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    if (!category) throw new NotFoundException(`Category not found: ${slug}`);
    return category;
  }

  async findProductsBySlug(slug: string, query: ProductQueryDto) {
    const category = await this.prisma.category.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });
    if (!category) throw new NotFoundException(`Category not found: ${slug}`);
    return this.productsService.findAll(Object.assign({}, query, { category: slug }));
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) throw new ConflictException('A category with this slug already exists');
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          image: dto.image,
          parentId: dto.parentId,
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('A category with this slug already exists');
      }
      throw error;
    }
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}
