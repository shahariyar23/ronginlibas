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
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(isAdmin = false) {
        try {
            const where = isAdmin ? {} : { isActive: true };
            return await this.prisma.category.findMany({
                where,
                include: {
                    children: true,
                    _count: { select: { products: true } },
                },
                orderBy: { sortOrder: 'asc' },
            });
        }
        catch {
            return [
                { id: 'cat-1', name: 'Panjabi', slug: 'panjabi', description: 'Traditional Elegance & Ancestral Weaves', itemCount: 48 },
                { id: 'cat-2', name: 'Shirts', slug: 'shirts', description: 'Sartorial Precision & Egyptian Cotton', itemCount: 32 },
                { id: 'cat-3', name: 'Polos', slug: 'polos', description: 'Luxe Knitwear & Mercerized Piqué', itemCount: 20 },
                { id: 'cat-4', name: 'Trousers', slug: 'trousers', description: 'Modern Tailoring & Churidar Cuts', itemCount: 16 },
                { id: 'cat-5', name: 'T-Shirts', slug: 't-shirts', description: 'Heavyweight Architectural Cotton 260 GSM', itemCount: 12 },
                { id: 'cat-6', name: 'Casual Wear', slug: 'casual-wear', description: 'Linen sets and weekend lounge essentials', itemCount: 10 },
            ];
        }
    }
    async findBySlug(slug) {
        try {
            const category = await this.prisma.category.findUnique({
                where: { slug },
                include: {
                    children: true,
                    products: {
                        where: { isActive: true },
                        take: 20,
                        include: { images: true },
                    },
                },
            });
            if (!category)
                throw new NotFoundException(`Category not found: ${slug}`);
            return category;
        }
        catch (err) {
            if (err instanceof NotFoundException)
                throw err;
            return { id: 'cat-1', name: 'Panjabi', slug };
        }
    }
    async create(dto) {
        const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        try {
            const existing = await this.prisma.category.findUnique({ where: { slug } });
            if (existing) {
                throw new ConflictException('A category with this slug already exists');
            }
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
        catch (err) {
            if (err instanceof ConflictException)
                throw err;
            return { id: `cat-${Date.now()}`, name: dto.name, slug };
        }
    }
};
CategoriesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], CategoriesService);
export { CategoriesService };
//# sourceMappingURL=categories.service.js.map