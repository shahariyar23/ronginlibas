'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Check, Mail } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Welcome to the Rongin Libas VIP Guild!', {
      description: 'Your 15% launch voucher code is RONGINLAUNCH',
    });
  };

  return (
    <section className="w-full py-24 bg-[#00231a] text-[#fbf9f2] border-t border-[#073a2d]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="font-sans text-xs uppercase tracking-[0.3em] text-[#c79a45] font-semibold block">
          THE VIP ATELIER
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#fbf9f2]">
          BE THE FIRST TO KNOW
        </h2>
        <p className="font-sans text-sm sm:text-base text-[#c0c8c3] max-w-lg mx-auto font-light leading-relaxed">
          Gain private access to limited festive drops, bespoke panjabi capsules, and sartorial journal essays.
        </p>

        {subscribed ? (
          <div className="p-4 bg-[#073a2d] border border-[#c79a45]/40 text-[#fbf9f2] max-w-md mx-auto flex items-center justify-center gap-3">
            <Check className="w-5 h-5 text-[#c79a45]" />
            <span className="font-sans text-xs uppercase tracking-wider font-semibold">
              Thank you. Use code <strong>RONGINLAUNCH</strong> for 15% off.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white/10 border-white/20 text-[#fbf9f2] placeholder:text-[#c0c8c3] rounded-none focus-visible:ring-[#c79a45] text-xs font-sans"
            />
            <Button
              type="submit"
              className="h-12 px-8 bg-[#c79a45] hover:bg-[#b08535] text-[#073a2d] font-sans font-bold uppercase tracking-wider text-xs whitespace-nowrap shadow-md"
            >
              Join Atelier
            </Button>
          </form>
        )}

        <p className="text-[11px] font-sans text-[#717975]">
          We respect your peace. Unsubscribe anytime with one click.
        </p>
      </div>
    </section>
  );
};
