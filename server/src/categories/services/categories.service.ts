import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ProductsService } from '../../products/services/products.service.js';
import { ProductQueryDto } from '../../products/dto/product-query.dto.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';

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
        updatedAt: true,
        createdAt: true,
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

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Category not found: ${id}`);
    }

    let slug = dto.slug;
    if (dto.name && !slug) {
      slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (slug && slug !== existing.slug) {
      const conflict = await this.prisma.category.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Category with slug "${slug}" already exists`);
      }
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          name: dto.name !== undefined ? dto.name : undefined,
          slug: slug !== undefined ? slug : undefined,
          description: dto.description !== undefined ? dto.description : undefined,
          image: dto.image !== undefined ? dto.image : undefined,
          parentId: dto.parentId !== undefined ? dto.parentId : undefined,
          sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : undefined,
          isActive: dto.isActive !== undefined ? dto.isActive : undefined,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('A category with this slug already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });
    if (!existing) {
      throw new NotFoundException(`Category not found: ${id}`);
    }

    if (existing._count.products > 0) {
      throw new ConflictException(
        `Cannot delete category "${existing.name}" because ${existing._count.products} products belong to it. Please reassign the products first or mark this category as inactive.`,
      );
    }

    if (existing._count.children > 0) {
      throw new ConflictException(
        `Cannot delete category "${existing.name}" because it has ${existing._count.children} subcategories. Please remove subcategories first.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return {
      success: true,
      message: `Category "${existing.name}" deleted successfully`,
    };
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
