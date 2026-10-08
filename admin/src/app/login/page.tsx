'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const result = await adminApi.auth.login(email.trim(), password);
      if (result?.data?.accessToken) {
        window.location.href = '/';
        return;
      }

      const message = result?.message || result?.error;
      setErrorMessage(
        Array.isArray(message)
          ? message.join(' ')
          : message || 'The email or password you entered is incorrect.'
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf9f2] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#00231a] px-12 py-10 text-[#fbf9f2] lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-48 -top-40 h-[34rem] w-[34rem] rounded-full border border-[#c79a45]/20" />
          <div className="absolute -right-24 -top-16 h-[26rem] w-[26rem] rounded-full border border-[#c79a45]/15" />
          <div className="absolute -bottom-40 -left-32 h-[38rem] w-[38rem] rounded-full bg-[#0d4d3b]/40 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(135deg,transparent_0,transparent_12px,#c79a45_13px,transparent_14px)]" />
        </div>

        <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center border border-[#c79a45]/50 bg-[#073a2d] p-2.5">
            <Image
              src="/logo.svg"
              alt="Rongin Libas"
              width={32}
              height={32}
              className="h-full w-full object-contain brightness-200"
              priority
            />
          </span>
          <span>
            <span className="font-logo block text-sm font-bold tracking-[0.18em] text-white">
              RONGIN LIBAS
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c79a45]">
              Atelier administration
            </span>
          </span>
        </Link>

        <div className="relative z-10 max-w-xl pb-4">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c79a45]">
            The atelier, in your hands
          </p>
          <h1 className="max-w-lg font-serif text-5xl font-normal leading-[1.12] tracking-tight xl:text-6xl">
            Every detail, thoughtfully in order.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#a1c3b5]">
            A considered space to care for every collection, every order, and
            every customer of Rongin Libas.
          </p>
          <div className="mt-12 flex items-center gap-3 border-t border-white/10 pt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#a1c3b5]">
            <span className="h-1.5 w-1.5 bg-[#c79a45]" />
            Dhaka atelier · Est. with intention
          </div>
        </div>

        <p className="relative z-10 text-[10px] tracking-wide text-[#76a493]">
          © {new Date().getFullYear()} Rongin Libas. Private staff portal.
        </p>
      </section>

      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-10 lg:items-center lg:justify-center lg:px-12 lg:py-12">
        <Link
          href="/"
          className="mb-12 inline-flex w-fit items-center gap-2 lg:hidden"
        >
          <span className="flex h-10 w-10 items-center justify-center border border-[#c79a45]/50 bg-[#073a2d] p-2">
            <Image
              src="/logo.svg"
              alt=""
              width={26}
              height={26}
              className="h-full w-full object-contain brightness-200"
              priority
            />
          </span>
          <span className="font-logo text-xs font-bold tracking-[0.15em] text-[#073a2d]">
            RONGIN LIBAS
          </span>
        </Link>

        <div className="mx-auto w-full max-w-[430px]">
          <div className="mb-10">
            <div className="mb-5 flex h-11 w-11 items-center justify-center border border-[#deddd3] bg-white text-[#c79a45]">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#8c6722]">
              Staff access
            </p>
            <h2 className="font-serif text-4xl font-normal tracking-tight text-[#1b1c18]">
              Welcome back.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#69726d]">
              Sign in to continue to your atelier dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#404945]"
              >
                Work email
              </label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717975]"
                  strokeWidth={1.7}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@ronginlibas.com"
                  className="h-12 w-full border border-[#deddd3] bg-white pl-11 pr-4 text-sm text-[#1b1c18] outline-none transition-colors placeholder:text-[#a3aaa6] focus:border-[#073a2d] focus:ring-1 focus:ring-[#073a2d]"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#404945]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717975]"
                  strokeWidth={1.7}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full border border-[#deddd3] bg-white pl-11 pr-12 text-sm text-[#1b1c18] outline-none transition-colors placeholder:text-[#a3aaa6] focus:border-[#073a2d] focus:ring-1 focus:ring-[#073a2d]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-[#717975] transition-colors hover:text-[#073a2d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#073a2d]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.7} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.7} />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="border border-[#ba1a1a]/20 bg-[#ba1a1a]/5 px-4 py-3 text-sm leading-5 text-[#9b1c1c]"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 bg-[#073a2d] px-5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#0d4d3b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#073a2d] disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in to dashboard'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-8 flex items-start gap-3 border-t border-[#deddd3] pt-5">
            <LockKeyhole
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-[#8c6722]"
              strokeWidth={1.7}
            />
            <p className="text-xs leading-5 text-[#69726d]">
              This portal is reserved for authorized Rongin Libas staff. Your
              sign-in is protected by encrypted authentication.
            </p>
          </div>

          <p className="mt-10 text-center text-[10px] uppercase tracking-[0.14em] text-[#929a95] lg:hidden">
            © {new Date().getFullYear()} Rongin Libas · Dhaka, Bangladesh
          </p>
        </div>
      </section>
    </main>
  );
}
