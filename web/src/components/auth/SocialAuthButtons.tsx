'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { renderGisButton, getGoogleClientId } from '@/lib/gis';

interface SocialAuthButtonsProps {
  onSuccess?: () => void;
  disabled?: boolean;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onSuccess,
  disabled = false,
}) => {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const lastRenderedWidthRef = useRef<number | null>(null);

  const handleCredentialResponse = async (credential: string) => {
    if (isSubmittingRef.current || disabled) return;
    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      const ok = await loginWithGoogle(credential);
      if (ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          const nextParam = searchParams?.get('next');
          const target =
            nextParam &&
            !nextParam.startsWith('/login') &&
            !nextParam.startsWith('/register')
              ? nextParam
              : '/profile';
          router.push(target);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const clientId = getGoogleClientId();

    if (!clientId) {
      setInitError('Google Client ID is not configured.');
      return;
    }

    const initButton = async (explicitWidth?: number) => {
      try {
        if (!buttonContainerRef.current) return;
        const parentW = buttonContainerRef.current.parentElement?.clientWidth;
        const measured =
          explicitWidth ||
          buttonContainerRef.current.clientWidth ||
          parentW ||
          380;
        const buttonWidth = Math.min(Math.max(Math.round(measured), 240), 380);

        buttonContainerRef.current.innerHTML = '';
        lastRenderedWidthRef.current = buttonWidth;

        await renderGisButton(buttonContainerRef.current, {
          onSuccess: (credential) => {
            if (isMounted) {
              void handleCredentialResponse(credential);
            }
          },
          onError: (err) => {
            if (isMounted) {
              toast.error(err.message || 'Google Sign-In failed.');
            }
          },
          text: 'continue_with',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          width: buttonWidth,
          logoAlignment: 'left',
        });

        if (isMounted) {
          setGisReady(true);
        }
      } catch (err: any) {
        if (isMounted) {
          setInitError(err?.message || 'Could not load Google Sign-In.');
        }
      }
    };

    void initButton();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!isMounted || !buttonContainerRef.current) return;
        const parentW = buttonContainerRef.current.parentElement?.clientWidth;
        const measured =
          buttonContainerRef.current.clientWidth ||
          parentW ||
          380;
        const currentWidth = Math.min(Math.max(Math.round(measured), 240), 380);
        if (currentWidth !== lastRenderedWidthRef.current) {
          void initButton(currentWidth);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [disabled]);

  const isAnyLoading = isLoading || disabled;

  return (
    <div className="w-full">
      {initError ? (
        <div className="p-3 mb-2.5 text-xs text-[#ba1a1a] bg-[#ba1a1a]/5 border border-[#ba1a1a]/20 rounded-xs text-center font-sans">
          {initError}
        </div>
      ) : null}

      <div className="relative w-full min-h-[44px] flex items-center justify-center">
        {/* Loading overlay / feedback state */}
        {isLoading && (
          <div className="absolute inset-0 z-20 w-full h-[44px] px-4 bg-white border border-[#073a2d]/40 text-[#1b1c18] font-sans text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-3 shadow-xs rounded-[4px]">
            <Loader2 className="w-4 h-4 animate-spin text-[#073a2d]" />
            <span>Authenticating with Google...</span>
          </div>
        )}

        {/* Placeholder while GIS is initializing */}
        {!gisReady && !initError && !isLoading && (
          <div className="w-full h-[44px] px-4 bg-white border border-[#dadce0] text-[#3c4043] font-sans text-xs tracking-wider font-semibold flex items-center justify-center gap-3 shadow-xs rounded-[4px] opacity-75">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </div>
        )}

        {/* Official GIS container */}
        <div
          id="social-login-google"
          ref={buttonContainerRef}
          className={`w-full flex justify-center ${
            gisReady && !isLoading ? 'visible' : 'invisible absolute'
          } ${isAnyLoading ? 'pointer-events-none opacity-60' : ''}`}
        />
      </div>
    </div>
  );
};
