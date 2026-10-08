import React from 'react';
import { TablePageSkeleton } from '@/components/common/Skeleton';

export default function Loading() {
  return (
    <TablePageSkeleton
      title="Promotional Atelier Coupons"
      showAddButton={true}
      rowCount={6}
    />
  );
}
