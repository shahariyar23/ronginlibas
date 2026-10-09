'use client';

import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, Check, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface PasswordPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  mustChangePassword?: boolean;
  onSuccess?: () => void;
}

export function PasswordPortalModal({
  isOpen,
  onClose,
  mustChangePassword = false,
  onSuccess,
}: PasswordPortalModalProps) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword.trim()) {
      setErrorMessage('Current password is required.');
      return;
    }

    if (!isMinLength) {
      setErrorMessage('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage('New password must be different from your current default password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminApi.users.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        toast.success('Your atelier access password has been updated successfully');
        // Update stored profile
        const user = adminApi.auth.getUser();
        if (user) {
          user.mustChangePassword = false;
          adminApi.auth.refreshUser();
        }

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onSuccess?.();
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to update credentials. Please check your current password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'A network error occurred while updating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={!mustChangePassword ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-[#c79a45]/30 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#deddd3]/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#c79a45]/40 bg-[#00231a] text-[#c79a45]">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#00231a]">
                Credentials Portal
              </h3>
              <p className="text-xs text-[#717975]">
                {mustChangePassword
                  ? 'Replace default credentials with your private password'
                  : 'Update your administrative security credentials'}
              </p>
            </div>
          </div>

          {!mustChangePassword && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-[#717975] hover:bg-[#f0eee7] hover:text-[#1b1c18] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {mustChangePassword && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#ffe082] bg-[#fff8e1] p-3 text-xs text-[#6d4c41]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#f57f17] mt-0.5" />
            <div>
              <p className="font-semibold text-[#5d4037]">Default Password Active</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Your account is currently configured with the initial default password. Enter your existing default password to authorize setting your private credentials.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#ba1a1a]/30 bg-[#ba1a1a]/10 p-3 text-xs text-[#ba1a1a]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Current Password Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
              Current / Default Password <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative mt-1">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current or default password"
                className="w-full h-10 pl-3 pr-10 border border-[#deddd3] rounded-md text-xs outline-none focus:border-[#073a2d] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717975] hover:text-[#1b1c18] cursor-pointer"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                New Private Password <span className="text-[#ba1a1a]">*</span>
              </label>
              <span className={`text-[10px] ${isMinLength ? 'text-emerald-700 font-medium' : 'text-[#717975]'}`}>
                Min. 6 characters
              </span>
            </div>
            <div className="relative mt-1">
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new private password"
                className="w-full h-10 pl-3 pr-10 border border-[#deddd3] rounded-md text-xs outline-none focus:border-[#073a2d] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717975] hover:text-[#1b1c18] cursor-pointer"
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                Confirm New Password <span className="text-[#ba1a1a]">*</span>
              </label>
              {confirmPassword.length > 0 && (
                <span className={`text-[10px] flex items-center gap-1 ${isMatching ? 'text-emerald-700 font-semibold' : 'text-[#ba1a1a]'}`}>
                  {isMatching ? <><Check className="h-3 w-3" /> Matches</> : 'Does not match'}
                </span>
              )}
            </div>
            <div className="relative mt-1">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new private password"
                className="w-full h-10 pl-3 pr-10 border border-[#deddd3] rounded-md text-xs outline-none focus:border-[#073a2d] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717975] hover:text-[#1b1c18] cursor-pointer"
              >
                {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#deddd3]/60">
            {!mustChangePassword && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2 border border-[#deddd3] rounded-md text-xs font-medium text-[#404945] hover:bg-[#f0eee7] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !currentPassword || !isMinLength || !isMatching}
              className="inline-flex items-center gap-2 rounded-md bg-[#00231a] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#deddd3] hover:bg-[#073a2d] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#deddd3] border-t-[#c79a45]" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-[#c79a45]" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
