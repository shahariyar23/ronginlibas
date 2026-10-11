'use client';

import React, { useState } from 'react';
import { submitDataDeletionRequestApi, DataDeletionResponse } from '@/lib/api';
import { Send, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const DataDeletionClient: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DataDeletionResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('Please provide the email address or phone number linked to your Rongin Libas account.');
      return;
    }

    try {
      setLoading(true);
      const isEmail = cleanIdentifier.includes('@');
      const res = await submitDataDeletionRequestApi({
        email: cleanIdentifier,
        phone: !isEmail ? cleanIdentifier : undefined,
        reason: reason.trim() || undefined,
      });

      if (res && res.confirmationCode) {
        setResult(res);
      } else {
        throw new Error(res?.message || 'Failed to submit request');
      }
    } catch (err: any) {
      setError(
        err?.message ||
          'We were unable to transmit your deletion request. Please contact atelier@ronginlibas.com directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!result?.confirmationCode) return;
    navigator.clipboard.writeText(result.confirmationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#deddd3] p-6 sm:p-8 shadow-xs">
      <div className="border-b border-[#deddd3] pb-4 mb-6">
        <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal">
          Submit Data &amp; Account Deletion Request
        </h2>
        <p className="font-sans text-xs text-[#69726d] mt-1.5 leading-relaxed">
          This public form is provided for patrons, guest purchasers, and social login users wishing to request data deletion without signing in.
        </p>
      </div>

      {result ? (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="p-4 bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif text-sm font-semibold text-emerald-950">
                Data Deletion Request Recorded Successfully
              </h3>
              <p className="font-sans text-xs text-emerald-800 leading-relaxed">
                {result.message}
              </p>
            </div>
          </div>

          <div className="p-5 bg-[#fbf9f2] border border-[#deddd3] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-sans text-[11px] uppercase tracking-wider text-[#717975] font-semibold">
                Official Confirmation &amp; Tracking Code
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 font-sans text-xs text-[#073a2d] hover:text-[#c79a45] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-[#073a2d] bg-white border border-[#deddd3] py-3 px-4 select-all">
              {result.confirmationCode}
            </div>
            <p className="font-sans text-xs text-[#404945] leading-relaxed">
              Please save this confirmation reference. Our compliance team verifies this identifier against our customer records and automatically decouples authentication profiles and personal data.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setResult(null);
                setIdentifier('');
                setReason('');
              }}
              className="text-xs font-sans uppercase tracking-wider text-[#073a2d] border-[#deddd3] hover:bg-[#f5f4ed]"
            >
              Submit Another Request
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="identifier"
              className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#404945] mb-1.5"
            >
              Account Email Address or Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
              placeholder="e.g. patron@example.com or +8801700000000"
              className="h-11 bg-[#fbf9f2] border-[#deddd3] focus:border-[#073a2d] font-sans text-xs"
            />
            <p className="font-sans text-[11px] text-[#717975] mt-1">
              Provide the exact email address or phone linked to your customer profile, or your registered social account email.
            </p>
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#404945] mb-1.5"
            >
              Reason or Additional Details (Optional)
            </label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              placeholder="e.g. Closing customer profile, no longer requiring account..."
              className="w-full bg-[#fbf9f2] border border-[#deddd3] rounded-md px-3 py-2 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d] resize-none"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              loading={loading}
              loadingText="Submitting Request..."
              disabled={loading}
              className="w-full sm:w-auto px-8 h-12 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] font-sans text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#c79a45]" />
              <span>Request Data &amp; Account Deletion</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
