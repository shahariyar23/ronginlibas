'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/common/Logo';
import { LogoLoader } from '@/components/common/LogoLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Sparkles,
  Scissors,
  Truck,
  Gift,
  ArrowRight,
  ShieldCheck,
  Crown,
  Lock,
  Mail,
  User,
  Phone,
} from 'lucide-react';

export const LoginClient: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRegisterRoute = pathname?.includes('/register') || searchParams.get('tab') === 'register';
  const initialTab = isRegisterRoute ? 'register' : 'signin';
  const { login, register, isLoggedIn, isLoading, user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialTab);

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPw, setShowSignInPw] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [preferredFit, setPreferredFit] = useState('Slim Heritage Cut');
  const [preferredCollar, setPreferredCollar] = useState('High Mandarin Collar');
  const [termsAccepted, setTermsAccepted] = useState(true);

  useEffect(() => {
    if (pathname?.includes('/register') || searchParams.get('tab') === 'register') {
      setActiveTab('register');
    }
  }, [pathname, searchParams]);

  // If user is already logged in, redirect them away from login & register
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      const nextParam = searchParams.get('next');
      const target =
        nextParam &&
        !nextParam.startsWith('/login') &&
        !nextParam.startsWith('/register')
          ? nextParam
          : '/profile';
      router.replace(target);
    }
  }, [isLoading, isLoggedIn, router, searchParams]);

  // Password strength calculation: simple & fail-free (at least 6 characters)
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: 'Minimum 6 characters', color: 'bg-[#deddd3]' };
    if (pw.length < 6) {
      const remaining = 6 - pw.length;
      return {
        score: Math.round((pw.length / 6) * 70),
        label: `${remaining} more character${remaining > 1 ? 's' : ''}`,
        color: 'bg-[#ba1a1a]',
      };
    }
    return { score: 100, label: 'Password Ready', color: 'bg-[#073a2d]' };
  };

  const pwStrength = getPasswordStrength(regPassword);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (await login(signInEmail, signInPassword)) {
        const nextParam = searchParams.get('next');
        const target =
          nextParam &&
          !nextParam.startsWith('/login') &&
          !nextParam.startsWith('/register')
            ? nextParam
            : '/profile';
        router.push(target);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!termsAccepted) {
      toast.error('Please accept the terms and privacy policy.');
      return;
    }

    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    // Clean phone number: accept '017XXXXXXXX', '17XXXXXXXX', '+880...', or '880...'
    let digits = regMobile.replace(/[\s()\-]/g, '');
    if (digits.startsWith('+')) digits = digits.slice(1);
    if (digits.startsWith('880')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);

    if (!/^1[3-9]\d{8}$/.test(digits)) {
      toast.error('Please enter a valid mobile number (e.g. 017XXXXXXXX or 17XXXXXXXX)');
      return;
    }

    const formattedPhone = `+880${digits}`;

    setIsSubmitting(true);
    try {
      const registered = await register(
        {
          name: regName,
          email: regEmail,
          phone: formattedPhone,
          tailoringProfile: {
            height: '',
            chest: '',
            shoulder: '',
            preferredPanjabiLength: '',
            preferredFit,
            preferredCollar,
          },
        },
        regPassword,
        termsAccepted,
      );
      if (registered) {
        const nextParam = searchParams.get('next');
        const target =
          nextParam &&
          !nextParam.startsWith('/login') &&
          !nextParam.startsWith('/register')
            ? nextParam
            : '/profile';
        router.push(target);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LogoLoader />;
  }

  // Logged-in user cannot view or access login or register forms
  if (isLoggedIn) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-[#fbf9f2] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#deddd3] p-8 sm:p-10 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#073a2d]/10 text-[#073a2d] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-[#073a2d]" />
          </div>
          <Badge className="bg-[#073a2d] text-white text-[10px] font-sans uppercase tracking-widest px-2.5 py-0.5 mb-3">
            Active Patron Session
          </Badge>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#073a2d] mb-2 font-normal">
            Already Signed In
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#69726d] leading-relaxed mb-6">
            You are currently signed in as <span className="font-semibold text-[#073a2d]">{user?.name || user?.email || 'Patron'}</span>. You cannot visit the login or register page while signed in.
          </p>
          <div className="space-y-3">
            <Link
              href="/profile"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest py-3.5 px-6 font-semibold shadow-md transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-[#c79a45]" />
              <span>Go to Patron Sanctuary</span>
            </Link>
            <Link
              href="/shop"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#f5f4ed] hover:bg-[#eae8e1] text-[#073a2d] font-sans text-xs uppercase tracking-wider py-3 px-6 font-semibold transition-all cursor-pointer"
            >
              <span>Explore Collection</span>
            </Link>
            <button
              type="button"
              disabled={isSigningOut}
              onClick={async () => {
                if (isSigningOut) return;
                setIsSigningOut(true);
                try {
                  await logout();
                  toast.info('You have signed out.');
                } finally {
                  setIsSigningOut(false);
                }
              }}
              className="w-full text-xs text-[#ba1a1a] hover:underline font-sans pt-2 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out to use another account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 sm:pt-10 pb-16 sm:pb-20 bg-[#fbf9f2]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#717975]">
          <Link href="/" className="hover:text-[#073a2d] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#073a2d] font-semibold">Patron Sanctuary Portal</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white shadow-xl overflow-hidden">
          {/* Left Editorial Privilege Sanctuary (5 Cols) */}
          <div className="lg:col-span-5 bg-[#073a2d] text-[#fbf9f2] p-5 sm:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Background geometric motif */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0d4d3b]/40 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#c79a45]/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <div>
                <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#c79a45] font-semibold block mb-2">
                  Atelier Sanctuary
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal leading-tight">
                  Cloth Your Identity
                </h1>
                <p className="font-sans text-xs sm:text-sm text-[#76a493] mt-3 leading-relaxed">
                  Enter the portal reserved for patrons of bespoke Bengal panjabis, mercerized knitwear, and aristocratic tailoring.
                </p>
              </div>

              {/* Privilege Features List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 p-3.5 bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                  <div className="w-8 h-8 rounded-full bg-[#c79a45] text-[#073a2d] flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-white">
                      ৳500 Inaugural Welcome Privilege
                    </h4>
                    <p className="font-sans text-xs text-[#76a493] mt-0.5">
                      Complimentary honorarium credited immediately to your inaugural cart checkout.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                  <div className="w-8 h-8 rounded-full bg-[#0d4d3b] text-[#c79a45] flex items-center justify-center shrink-0 mt-0.5">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-white">
                      Dhaka Doorstep Master Tailoring
                    </h4>
                    <p className="font-sans text-xs text-[#76a493] mt-0.5">
                      Complimentary fitting adjustments & bespoke measurement archiving across Dhaka Metro.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                  <div className="w-8 h-8 rounded-full bg-[#0d4d3b] text-[#c79a45] flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-white">
                      Automated 64-District Courier Sync
                    </h4>
                    <p className="font-sans text-xs text-[#76a493] mt-0.5">
                      Real-time Pathao & Steadfast live dispatch with open-box verification guarantee.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Quote Footnote */}
            <div className="relative z-10 pt-8 border-t border-[#0d4d3b] mt-8">
              <p className="font-serif text-xs italic text-[#deddd3]/90 leading-relaxed">
                &ldquo;A garment of distinction is not merely worn; it is inherited dignity crafted thread by single thread.&rdquo;
              </p>
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#c79a45] block mt-1.5 font-semibold">
                — Rongin Libas Atelier Charter
              </span>
            </div>
          </div>

          {/* Right Dual-Tabbed Auth Sanctuary (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
            {/* Crest & Title */}
            <div className="text-center pb-5 sm:pb-6">
              <div className="flex justify-center mb-3 sm:mb-4">
                <Logo className="h-9 sm:h-11 w-auto" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] mt-1 font-normal">
                Welcome Back!
              </h2>
            </div>

            {/* Unauthenticated Alert Banner */}
            <div className="max-w-md mx-auto w-full mb-5 sm:mb-6 p-3 sm:p-4 bg-[#fdf8ed] border border-[#e8d5aa] text-[#073a2d] flex items-start gap-3 shadow-xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#c79a45]/20 text-[#073a2d] flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#073a2d]" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#073a2d]">
                  You are not logged in. Please login first.
                </h3>
                <p className="font-sans text-xs text-[#69726d] mt-0.5">
                  {searchParams.get('next')
                    ? 'Please sign in or join the atelier to continue to your requested page.'
                    : 'Sign in to access your bespoke orders, doorstep tailoring records, and patron privileges.'}
                </p>
              </div>
            </div>

            {/* Dual Tab Switcher */}
            <div className="flex max-w-md mx-auto w-full mb-6 sm:mb-8 bg-[#f5f4ed] p-1">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 font-sans text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeTab === 'signin'
                    ? 'bg-[#073a2d] text-white shadow-xs'
                    : 'text-[#69726d] hover:text-[#073a2d]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 px-4 font-sans text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-[#073a2d] text-white shadow-xs'
                    : 'text-[#69726d] hover:text-[#073a2d]'
                }`}
              >
                <span>Create New Account</span>
                {/* <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-normal bg-[#c79a45] text-[#073a2d] border-0 px-1.5 py-0 font-bold"
                >
                  ৳500 Gift
                </Badge> */}
              </button>
            </div>

            {/* ================= TAB 1: SIGN IN ================= */}
            {activeTab === 'signin' && (
              <div className="max-w-md mx-auto w-full space-y-6">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="name@domain.com"
                        required
                        className="bg-[#fbf9f2] border-[#deddd3] h-12 pl-10 focus:border-[#073a2d]"
                      />
                      <Mail className="w-4 h-4 text-[#717975] absolute left-3.5 top-4 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                        Password
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="font-sans text-xs text-[#c79a45] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        type={showSignInPw ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter your sanctuary password"
                        required
                        className="bg-[#fbf9f2] border-[#deddd3] h-12 pl-10 pr-10 focus:border-[#073a2d]"
                      />
                      <Lock className="w-4 h-4 text-[#717975] absolute left-3.5 top-4 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowSignInPw(!showSignInPw)}
                        className="absolute right-3.5 top-4 text-[#717975] hover:text-[#073a2d]"
                        aria-label="Toggle password visibility"
                      >
                        {showSignInPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-[#404945]">
                      <Checkbox
                        checked={keepSignedIn}
                        onCheckedChange={(c) => setKeepSignedIn(!!c)}
                      />
                      <span>Keep me signed in on this device</span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    loadingText="Authenticating..."
                    disabled={isSubmitting}
                    className="w-full bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-[0.16em] h-13 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                {/* Quick Demo Pre-fill for reviewer */}
                {/* <div className="pt-4 border-t border-[#f0eee7] text-center">
                  <p className="font-sans text-xs text-[#717975] mb-2">
                    Reviewing the atelier experience?
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSignInEmail('mahfuz@bangladesh.com');
                      setSignInPassword('RonginLibas@2026');
                    }}
                    className="font-sans text-[11px] uppercase tracking-wider text-[#073a2d] border-[#deddd3] hover:bg-[#f5f4ed]"
                  >
                    Fill Demo Patron Credentials (Mahfuzur Rahman)
                  </Button>
                </div> */}
              </div>
            )}

            {/* ================= TAB 2: REGISTER (JOIN ATELIER) ================= */}
            {activeTab === 'register' && (
              <div className="max-w-md mx-auto w-full space-y-5">
                {/* ৳500 Privilege Banner */}
                <div className="bg-[#f5f4ed] border border-[#deddd3] p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#c79a45] text-[#073a2d] flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <p className="font-sans text-xs text-[#073a2d] leading-tight">
                    Create an account to manage your profile, saved addresses, and order history.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                      Full Name
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Mahfuzur Rahman Chowdhury"
                        required
                        className="bg-[#fbf9f2] border-[#deddd3] h-11 pl-10 focus:border-[#073a2d]"
                      />
                      <User className="w-4 h-4 text-[#717975] absolute left-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                        BD Mobile 
                      </Label>
                      <div className="flex items-center">
                        <span className="bg-[#eae8e1] border border-r-0 border-[#deddd3] px-2.5 h-11 text-xs font-semibold flex items-center text-[#404945]">
                          +880
                        </span>
                        <Input
                          type="tel"
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value)}
                          placeholder="017XXXXXXXX or 17XXXXXXXX"
                          required
                          className="bg-[#fbf9f2] border-[#deddd3] h-11 rounded-none focus:border-[#073a2d]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                        Email (SMS Alerts)
                      </Label>
                      <Input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@domain.com"
                        required
                        className="bg-[#fbf9f2] border-[#deddd3] h-11 focus:border-[#073a2d]"
                      />
                    </div>
                  </div>

                  {/* Password with Strength Indicator */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                        Create Password
                      </Label>
                      <span className="font-sans text-[11px] font-semibold text-[#073a2d]">
                        {pwStrength.label}
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type={showRegPw ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        minLength={6}
                        required
                        className="bg-[#fbf9f2] border-[#deddd3] h-11 pr-10 focus:border-[#073a2d]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPw(!showRegPw)}
                        className="absolute right-3.5 top-3.5 text-[#717975] hover:text-[#073a2d]"
                      >
                        {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength Progress Track */}
                    <div className="w-full h-1 bg-[#eae8e1] overflow-hidden mt-1">
                      <div
                        className={`h-full ${pwStrength.color} transition-all duration-300`}
                        style={{ width: `${pwStrength.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Curated Sizing & Cut Preference */}
                  {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                        Preferred Cut & Fit
                      </Label>
                      <select
                        value={preferredFit}
                        onChange={(e) => setPreferredFit(e.target.value)}
                        className="w-full bg-[#fbf9f2] border border-[#deddd3] h-11 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
                      >
                        <option value="Slim Heritage Cut">Slim Heritage Cut</option>
                        <option value="Classic Aristocratic Cut">Classic Aristocratic Cut</option>
                        <option value="Modern Relaxed Drape">Modern Relaxed Drape</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                        Preferred Collar Type
                      </Label>
                      <select
                        value={preferredCollar}
                        onChange={(e) => setPreferredCollar(e.target.value)}
                        className="w-full bg-[#fbf9f2] border border-[#deddd3] h-11 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
                      >
                        <option value="High Mandarin Collar">High Mandarin Collar</option>
                        <option value="Classic Band Collar">Classic Band Collar</option>
                        <option value="Royal Embroidered Collar">Royal Embroidered Collar</option>
                      </select>
                    </div>
                  </div> */}

                  <label className="flex items-start gap-2 text-xs text-[#69726d] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      className="mt-0.5 accent-[#073a2d] w-4 h-4 cursor-pointer"
                    />
                    <span>I accept the terms and privacy policy for creating a customer account.</span>
                  </label>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      loadingText="Creating Account..."
                      disabled={isSubmitting || !termsAccepted}
                      className="w-full bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-[0.16em] h-13 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Crown className="w-4 h-4 text-[#c79a45]" />
                      <span>Create Customer Account</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
