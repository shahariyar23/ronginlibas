import React from 'react';
import { TablePageSkeleton } from '@/components/common/Skeleton';

export default function Loading() {
  return (
    <TablePageSkeleton
      title="Patron Editorial Reviews & Curation"
      showAddButton={false}
      rowCount={6}
    />
  );
}
