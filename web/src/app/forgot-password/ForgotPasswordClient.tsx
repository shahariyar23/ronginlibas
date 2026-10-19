'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestForgotPassword } from '@/lib/api';
import { toast } from 'sonner';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const ForgotPasswordClient: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestForgotPassword(email.trim());
      setIsSent(true);
      setSentEmail(email.trim());
      toast.success(res.message || 'Password reset link sent to your email.');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Could not process password recovery.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!sentEmail || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await requestForgotPassword(sentEmail);
      toast.success(res.message || 'Password reset link re-sent.');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Could not resend reset link.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-6 sm:pt-10 pb-16 sm:pb-20 bg-[#fbf9f2]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 sm:mb-6 flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#717975]">
          <Link href="/" className="hover:text-[#073a2d] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/login" className="hover:text-[#073a2d] transition-colors">
            Sign In
          </Link>
          <span>/</span>
          <span className="text-[#073a2d] font-semibold">Forgot Password</span>
        </nav>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto bg-white border border-[#deddd3] shadow-xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Brand Dignity & Assurance (5 cols) */}
          <div className="lg:col-span-5 bg-[#073a2d] text-[#fbf9f2] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#c79a45]/10 blur-2xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-2 text-[#c79a45]">
                <KeyRound className="w-5 h-5" />
                <span className="font-sans text-xs uppercase tracking-widest font-bold">
                  Account Recovery
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-snug">
                Bengal Sartorial Dignity &amp; Account Security
              </h2>

              <p className="font-sans text-xs text-[#b0ecd3] leading-relaxed">
                Your Rongin Libas patron account safeguards your bespoke tailoring measurements,
                doorstep fitting records, and order history across Dhaka and all 64 districts.
              </p>

              <div className="pt-4 border-t border-[#1b6b54] space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#fbf9f2]">
                  <Sparkles className="w-4 h-4 text-[#c79a45] shrink-0" />
                  <span>Encrypted, single-use reset tokens</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#fbf9f2]">
                  <ShieldCheck className="w-4 h-4 text-[#c79a45] shrink-0" />
                  <span>Immediate session invalidation on reset</span>
                </div>
              </div>
            </div>

            <p className="font-serif italic text-[11px] text-[#b0ecd3]/80 pt-8 relative z-10 border-t border-[#1b6b54]/40 mt-8">
              &ldquo;Cloth Your Identity — Tailored with aristocratic presence.&rdquo;
            </p>
          </div>

          {/* Right Column: Recovery Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-md mx-auto w-full space-y-6">
              {!isSent ? (
                <>
                  {/* Upper Side: Back to Sign In Link */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#deddd3]/60">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider text-[#073a2d] hover:text-[#c79a45] font-semibold transition-colors group"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                      <span>Back to Sign In</span>
                    </Link>
                    <span className="font-sans text-[11px] uppercase tracking-widest text-[#c79a45] font-bold">
                      Patron Security
                    </span>
                  </div>

                  <div className="text-center sm:text-left space-y-2">
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal leading-tight">
                      Forgot Your Password?
                    </h1>
                    <p className="font-sans text-xs text-[#69726d] leading-relaxed">
                      Enter the email address registered with your patron sanctuary. We will dispatch
                      a secure link to reset your credentials.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="email"
                        className="font-sans text-xs uppercase tracking-wider text-[#404945] font-semibold"
                      >
                        Registered Email Address
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@domain.com"
                          required
                          autoComplete="email"
                          className="bg-[#fbf9f2] border-[#deddd3] h-12 pl-10 focus:border-[#073a2d] text-sm"
                        />
                        <Mail className="w-4 h-4 text-[#717975] absolute left-3.5 top-4 pointer-events-none" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest font-bold h-12 shadow-sm cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching Recovery Link...</span>
                        </div>
                      ) : (
                        <span>Send Password Reset Link</span>
                      )}
                    </Button>
                  </form>

                  {/* Bottom Side: Alternative Back to Sign In */}
                  <div className="pt-4 border-t border-[#deddd3] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <span className="font-sans text-[#69726d]">
                      Remember your password?
                    </span>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1 font-sans font-semibold text-[#073a2d] hover:text-[#c79a45] transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </Link>
                  </div>
                </>
              ) : (
                /* Success State */
                <div className="text-center space-y-5 py-4">
                  <div className="w-14 h-14 rounded-full bg-[#e8f3ef] text-[#073a2d] flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8 text-[#073a2d]" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl text-[#073a2d] font-normal">
                      Recovery Link Dispatched
                    </h2>
                    <p className="font-sans text-xs text-[#69726d] leading-relaxed">
                      We have sent password reset instructions to:
                    </p>
                    <p className="font-mono text-xs font-bold text-[#073a2d] bg-[#f5f4ed] py-2 px-3 border border-[#deddd3] inline-block">
                      {sentEmail}
                    </p>
                    <p className="font-sans text-xs text-[#717975] pt-1">
                      Please check your inbox (and spam or promotions folder). The link will expire
                      in 1 hour for your security.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#deddd3]">
                    <Button
                      type="button"
                      onClick={() => router.push('/login')}
                      className="w-full bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest font-bold h-12 shadow-sm cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      <span>Return to Sign In</span>
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 text-xs font-sans text-[#717975]">
                      <span>Did not receive the email?</span>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isSubmitting}
                        className="text-[#c79a45] font-semibold hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? 'Resending...' : 'Click here to resend'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges Footer below card */}
        <div className="max-w-4xl mx-auto mt-8 border-t border-[#deddd3] pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-[#073a2d]" />
              <span className="font-sans text-xs text-[#404945]">Inside Dhaka 48h Transit</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#073a2d]" />
              <span className="font-sans text-xs text-[#404945]">Open-Box Inspection Privilege</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#073a2d]" />
              <span className="font-sans text-xs text-[#404945]">2-Day Doorstep Size Exchange</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#073a2d]" />
              <span className="font-sans text-xs text-[#404945]">Dhaka Master Cutter Atelier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
