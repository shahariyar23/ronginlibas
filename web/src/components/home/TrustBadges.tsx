import React from 'react';
import { Layers, Scissors, Wind, ShieldCheck, Truck } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: Layers,
      title: 'Premium Fabric',
      sub: 'Giza & Mercerized Cottons',
    },
    {
      icon: Scissors,
      title: 'Modern Cut',
      sub: 'Tailored Bangladeshi Silhouette',
    },
    {
      icon: Wind,
      title: 'Daily Comfort',
      sub: 'Breathable Natural Weaves',
    },
    {
      icon: ShieldCheck,
      title: 'Trusted Brand',
      sub: 'Open-Box Parcel Inspection',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      sub: '48hr Express Dispatch',
    },
  ];

  return (
    <section className="w-full bg-[#f0eee7] py-6 border-b border-[#deddd3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 items-center">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-white border border-[#deddd3] flex items-center justify-center text-[#073a2d] flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#073a2d]" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-[#073a2d]">
                    {b.title}
                  </h4>
                  <p className="font-sans text-[11px] text-[#69726d] leading-tight">
                    {b.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
