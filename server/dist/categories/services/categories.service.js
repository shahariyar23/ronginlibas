var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ProductsService } from '../../products/services/products.service.js';
let CategoriesService = class CategoriesService {
    prisma;
    productsService;
    constructor(prisma, productsService) {
        this.prisma = prisma;
        this.productsService = productsService;
    }
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
    async findBySlug(slug) {
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
        if (!category)
            throw new NotFoundException(`Category not found: ${slug}`);
        return category;
    }
    async findProductsBySlug(slug, query) {
        const category = await this.prisma.category.findFirst({
            where: { slug, isActive: true },
            select: { id: true },
        });
        if (!category)
            throw new NotFoundException(`Category not found: ${slug}`);
        return this.productsService.findAll(Object.assign({}, query, { category: slug }));
    }
    async create(dto) {
        const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existing = await this.prisma.category.findUnique({
            where: { slug },
            select: { id: true },
        });
        if (existing)
            throw new ConflictException('A category with this slug already exists');
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
        }
        catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictException('A category with this slug already exists');
            }
            throw error;
        }
    }
};
CategoriesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ProductsService])
], CategoriesService);
export { CategoriesService };
function isUniqueConstraintError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002');
}
//# sourceMappingURL=categories.service.js.map