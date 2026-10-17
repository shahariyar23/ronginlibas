import { ShipmentStatus } from '@prisma/client';
export declare function normalizeSteadfastStatus(rawStatus?: string | null): ShipmentStatus;
export declare function isDeliveryConfirmed(status: ShipmentStatus | string): boolean;
export declare function isReturnOrCancelled(status: ShipmentStatus | string): boolean;
export declare function getCustomerSafeShipmentStatus(status: ShipmentStatus | string): string;
