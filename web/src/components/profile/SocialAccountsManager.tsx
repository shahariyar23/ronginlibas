'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Link2, Loader2, Unlink } from 'lucide-react';
import { toast } from 'sonner';

export const SocialAccountsManager: React.FC = () => {
  const { socialIdentities, linkSocial, unlinkSocial } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const googleIdentity = socialIdentities.find((i) => i.provider === 'GOOGLE');

  const handleLink = async () => {
    if (loadingProvider) return;
    setLoadingProvider('link-google');
    try {
      await linkSocial('google');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleUnlink = async () => {
    if (loadingProvider) return;
    setLoadingProvider('unlink-google');
    try {
      await unlinkSocial('GOOGLE');
    } finally {
      setLoadingProvider(null);
    }
  };

  const providers = [
    {
      key: 'google' as const,
      enumKey: 'GOOGLE' as const,
      name: 'Google',
      identity: googleIdentity,
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="pt-8 border-t border-[#deddd3] space-y-5">
      <div>
        <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold block mb-1">
          Single Sign-On & Identities
        </span>
        <h3 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal">
          Connected Social Accounts
        </h3>
        <p className="font-sans text-xs text-[#69726d] mt-1">
          Link your Google account to log in instantly without passwords.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 max-w-xl">
        {providers.map((p) => {
          const isConnected = Boolean(p.identity);
          const isLinking = loadingProvider === `link-${p.key}`;
          const isUnlinking = loadingProvider === `unlink-${p.enumKey}`;
          const isLoading = isLinking || isUnlinking;

          return (
            <div
              key={p.key}
              className={`p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isConnected
                  ? 'bg-[#fbf9f2] border-[#deddd3]'
                  : 'bg-white border-[#e5e3d8] hover:border-[#c79a45]/40'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white border border-[#deddd3] flex items-center justify-center shrink-0 shadow-xs">
                  {p.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#1b1c18]">
                      {p.name}
                    </span>
                    {isConnected ? (
                      <Badge className="bg-[#073a2d] text-white text-[10px] uppercase tracking-wider px-1.5 py-0">
                        Linked
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase tracking-wider text-[#717975] border-[#deddd3] px-1.5 py-0"
                      >
                        Not Linked
                      </Badge>
                    )}
                  </div>
                  <p className="font-sans text-[11px] text-[#69726d] mt-0.5">
                    {isConnected
                      ? p.identity?.providerEmail
                        ? `Connected with ${p.identity.providerEmail}`
                        : 'Connected via social account'
                      : `Sign in quickly with your verified ${p.name} account`}
                  </p>
                </div>
              </div>

              <div className="sm:shrink-0 flex items-center justify-end">
                {isConnected ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleUnlink()}
                    className="font-sans text-[11px] uppercase tracking-wider text-[#ba1a1a] border-[#deddd3] hover:bg-[#ba1a1a]/10 hover:border-[#ba1a1a]/30 h-9 px-3 gap-1.5 cursor-pointer"
                  >
                    {isUnlinking ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Unlink className="w-3.5 h-3.5" />
                    )}
                    <span>Disconnect</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleLink()}
                    className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-[11px] uppercase tracking-wider h-9 px-3 gap-1.5 cursor-pointer"
                  >
                    {isLinking ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5" />
                    )}
                    <span>Connect</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
