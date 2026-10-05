import React from 'react';
import { Sparkles, Compass, CheckCircle2, RotateCcw, HeartHandshake } from 'lucide-react';

export const CraftStory: React.FC = () => {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Ancestral Bengal Weaves',
      desc: 'Partnering directly with master weavers in Rajshahi, Tangail, and Narayanganj to preserve authentic jacquard and muslin craftsmanship.',
    },
    {
      icon: Compass,
      title: 'Architectural Tailoring',
      desc: 'Cut with razor-sharp 0px borders, reinforced plackets, and hand-finished seams designed to drape cleanly on South Asian silhouettes.',
    },
    {
      icon: CheckCircle2,
      title: 'Open-Box Parcel Trust',
      desc: 'Verify the weave, touch the cotton, and inspect your order before cash handover. We champion absolute transparency across Bangladesh.',
    },
    {
      icon: RotateCcw,
      title: 'Hassle-Free 7-Day Exchange',
      desc: 'Need a different collar size or chest measurement? Our dedicated concierge arranges doorstep exchange without friction.',
    },
  ];

  return (
    <section className="w-full py-24 bg-[#fbf9f2] border-t border-[#deddd3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#c79a45] font-semibold block mb-2">
            OUR SARTORIAL COMMITMENT
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#073a2d]">
            WHY RONGIN LIBAS
          </h2>
          <p className="font-sans text-sm text-[#69726d] mt-2">
            Every thread is an intentional statement of identity, heritage, and quiet luxury.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 bg-white border border-[#deddd3] relative group hover:border-[#073a2d] transition-all hover:shadow-md"
              >
                <div className="w-12 h-12 bg-[#f0eee7] border border-[#deddd3] flex items-center justify-center text-[#073a2d] mb-5 group-hover:bg-[#073a2d] group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#073a2d] mb-2">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-[#69726d] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
