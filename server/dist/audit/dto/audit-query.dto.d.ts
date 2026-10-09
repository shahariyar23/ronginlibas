import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export declare class AuditQueryDto extends PaginationQueryDto {
    module?: string;
    action?: string;
    actorId?: string;
    actor?: string;
    from?: string;
    to?: string;
}
