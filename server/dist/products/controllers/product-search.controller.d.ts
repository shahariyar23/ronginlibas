import { ProductQueryDto } from '../dto/product-query.dto.js';
import { ProductsService } from '../services/products.service.js';
export declare class ProductSearchController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    searchProducts(query: ProductQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
}
