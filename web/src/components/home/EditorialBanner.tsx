import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export const EditorialBanner: React.FC = () => {
  return (
    <section className="w-full py-24 bg-[#073a2d] text-[#fbf9f2] relative overflow-hidden">
      {/* Background textile texture overlay */}
      <div
        className="absolute inset-0 opacity-10 bg-[radial-gradient(#c79a45_1px,transparent_1px)]"
        style={{ backgroundSize: '16px 16px' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <span className="font-sans text-xs uppercase tracking-[0.3em] text-[#c79a45] font-semibold block">
              THE EVERYDAY EDIT
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-[#fbf9f2]">
              Crisp morning meetings. <br />
              Dignified festive evenings.
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#c0c8c3] leading-relaxed max-w-xl font-light">
              We design garments that honor the tropical climate without conceding an ounce of sartorial prestige. From double-mercerized Egyptian cotton polos to handspun Rajshahi raw silk panjabis, each garment is tailored to feel effortless and look commanding.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/men/polos"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'h-12 px-8 bg-[#c79a45] hover:bg-[#b08535] text-[#073a2d] font-sans font-bold uppercase tracking-wider text-xs inline-flex items-center justify-center'
                )}
              >
                Shop Everyday Polos
              </Link>
              <Link
                href="/men/panjabi"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-12 px-8 bg-transparent text-[#fbf9f2] border-white/40 hover:border-white font-sans uppercase tracking-wider text-xs inline-flex items-center justify-center gap-2'
                )}
              >
                <span>Explore Heritage Panjabi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Image Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#c79a45]/30 shadow-2xl bg-[#00231a]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ"
                alt="Rongin Libas Atelier Tailoring"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00231a]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#c79a45] block">
                  Signature Cut
                </span>
                <p className="font-serif text-lg text-white">
                  Bespoke Emerald Jacquard Panjabi
                </p>
                <p className="font-sans text-xs text-[#c0c8c3] mt-0.5">৳5,850</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
