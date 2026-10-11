'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';

interface PhoneCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const PhoneCompletionModal: React.FC<PhoneCompletionModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
}) => {
  const { user, updateProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user || user.hasPhone) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneNumber.replace(/[\s()\-]/g, '');
    if (!clean || clean.length < 10) {
      toast.error('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    setIsSubmitting(true);
    try {
      let formattedPhone = clean;
      if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1);
      if (formattedPhone.startsWith('880')) formattedPhone = formattedPhone.slice(3);
      if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.slice(1);
      const normalizedPhone = `+880${formattedPhone}`;

      const ok = await updateProfile({ phone: normalizedPhone });
      if (ok) {
        toast.success('Mobile number saved to your customer profile.');
        if (onCompleted) onCompleted();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#fbf9f2] border border-[#deddd3] max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#717975] hover:text-[#073a2d] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#073a2d]/10 text-[#073a2d] flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal">
            Complete Your Profile
          </h3>
          <p className="font-sans text-xs text-[#69726d] mt-1.5 leading-relaxed">
            Welcome to Rongin Libas. Please provide your mobile phone number so our atelier can send
            you order updates and delivery notifications.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
              Mobile Number
            </Label>
            <div className="relative">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="017XXXXXXXX"
                required
                className="bg-white border-[#deddd3] h-12 pl-10 focus:border-[#073a2d]"
              />
              <Phone className="w-4 h-4 text-[#717975] absolute left-3.5 top-4 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#69726d]">
            <ShieldCheck className="w-4 h-4 text-[#073a2d] shrink-0" />
            <span>Used only for order tracking and secure verification.</span>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 font-sans text-xs uppercase tracking-wider border-[#deddd3] hover:bg-[#f5f4ed]"
            >
              Skip For Now
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Saving..."
              disabled={isSubmitting}
              className="flex-1 bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider h-11"
            >
              Save Number
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
