import React, { Suspense } from 'react';
import { ShopContent } from './ShopContent';

export const metadata = {
  title: "Men's Collection | Rongin Libas — Bespoke Panjabis & Sartorial Menswear",
  description:
    'Browse handcrafted Bangladeshi panjabis, mercerized Egyptian cotton polos, and tailored trousers from the Rongin Libas atelier.',
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center font-serif text-xl">Loading Atelier Collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
