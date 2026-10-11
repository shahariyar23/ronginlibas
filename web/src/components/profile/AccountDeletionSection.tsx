'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';

export const AccountDeletionSection: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const ok = await deleteAccount(reason || 'Customer initiated deletion from profile settings');
      if (ok) {
        setIsOpen(false);
        router.push('/');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pt-8 border-t border-[#deddd3] space-y-4">
      <div>
        <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#ba1a1a] font-semibold block mb-1">
          Data Privacy & Rights
        </span>
        <h3 className="font-serif text-xl sm:text-2xl text-[#1b1c18] font-normal">
          Permanent Account &amp; Data Deletion
        </h3>
        <p className="font-sans text-xs text-[#69726d] mt-1 leading-relaxed">
          You can permanently delete your Rongin Libas customer profile and remove all associated personal data, saved addresses, custom tailoring measurements, and linked social identities (Google).
        </p>
      </div>

      <div className="p-4 bg-[#fdf8f8] border border-[#ba1a1a]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
          <div className="text-xs font-sans text-[#404945] leading-relaxed">
            <p className="font-semibold text-[#1b1c18]">Irreversible Deletion</p>
            <p className="text-[#69726d] mt-0.5">
              Review our{' '}
              <Link href="/data-deletion" className="text-[#073a2d] underline hover:text-[#0d4d3b]">
                Data Deletion Instructions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#073a2d] underline hover:text-[#0d4d3b]">
                Privacy Policy
              </Link>{' '}
              to understand how customer data is processed.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="border-[#ba1a1a]/40 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 hover:border-[#ba1a1a] font-sans text-xs uppercase tracking-wider h-10 px-4 shrink-0 gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete My Account</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-[#fbf9f2] border-[#deddd3]">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-[#ba1a1a]/10 text-[#ba1a1a] flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="font-serif text-xl sm:text-2xl text-center text-[#1b1c18]">
              Delete Customer Sanctuary Account?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs font-sans text-[#404945]">
            <p className="leading-relaxed">
              This action is <strong className="text-[#ba1a1a]">permanent and cannot be undone</strong>. The following data will be immediately purged:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#69726d]">
              <li>Your customer profile, name, phone, and email</li>
              <li>Connected Google social credentials</li>
              <li>Saved delivery residences and custom tailoring measurements</li>
              <li>Active shopping bag items and saved wishlist pieces</li>
            </ul>

            <div className="p-3 bg-white border border-[#deddd3] text-[11px] text-[#69726d]">
              <strong>Note on Historical Orders:</strong> Any completed order invoices are preserved as anonymized transaction snapshots for statutory tax and courier dispatch reconciliation.
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] uppercase tracking-wider text-[#717975] font-semibold">
                Reason for leaving (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Help us improve our atelier experience..."
                rows={2}
                className="w-full bg-white border border-[#deddd3] p-2.5 text-xs text-[#1b1c18] focus:border-[#073a2d] focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="flex-1 font-sans text-xs uppercase tracking-wider border-[#deddd3]"
              >
                Cancel &amp; Keep Account
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                loading={isDeleting}
                loadingText="Deleting..."
                disabled={isDeleting}
                className="flex-1 bg-[#ba1a1a] hover:bg-[#961515] text-white font-sans text-xs uppercase tracking-wider"
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
