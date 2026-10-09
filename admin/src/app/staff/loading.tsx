import React from 'react';
import { TablePageSkeleton } from '@/components/common/Skeleton';

export default function Loading() {
  return (
    <TablePageSkeleton
      title="Staff & Role Governance"
      showAddButton={true}
      rowCount={6}
    />
  );
}
