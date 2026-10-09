import React, { Suspense } from 'react';
import { ShopContent } from './ShopContent';
import { LogoLoader } from '@/components/common/LogoLoader';

export const metadata = {
  title: "Men's Collection | Rongin Libas — Bespoke Panjabis & Sartorial Menswear",
  description:
    'Browse handcrafted Bangladeshi panjabis, mercerized Egyptian cotton polos, and tailored trousers from the Rongin Libas atelier.',
};

export default function ShopPage() {
  return (
    <Suspense fallback={<LogoLoader />}>
      <ShopContent />
    </Suspense>
  );
}
