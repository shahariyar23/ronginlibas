import React from 'react';
import { ProductFormSkeleton } from '@/components/common/Skeleton';

export default function Loading() {
  return <ProductFormSkeleton isEdit={false} />;
}
