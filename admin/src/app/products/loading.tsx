import React from 'react';
import { TablePageSkeleton } from '@/components/common/Skeleton';

export default function Loading() {
  return (
    <TablePageSkeleton
      title="Atelier Products Catalogue"
      showAddButton={true}
      rowCount={8}
    />
  );
}
