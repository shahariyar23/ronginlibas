import React from 'react';
import { TablePageSkeleton } from '@/components/common/Skeleton';

export default function Loading() {
  return (
    <TablePageSkeleton
      title="Atelier Orders & Fulfillment"
      showAddButton={false}
      rowCount={8}
    />
  );
}
