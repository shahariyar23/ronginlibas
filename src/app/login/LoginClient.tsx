'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'signin';
  const { login, register, isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialTab);

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('mahfuz@bangladesh.com');
  const [signInPassword, setSignInPassword] = useState('RonginLibas@2026');
  const [showSignInPw, setShowSignInPw] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [preferredFit, setPreferredFit] = useState('Slim Heritage Cut');
  const [preferredCollar, setPreferredCollar] = useState('High Mandarin Collar');

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  // Password strength calculation
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: 'Enter Password', color: 'bg-[#deddd3]' };
    if (pw.length < 6) return { score: 25, label: 'Weak', color: 'bg-[#ba1a1a]' };
    if (pw.length < 8) return { score: 50, label: 'Moderate', color: 'bg-[#c79a45]' };
    return { score: 100, label: 'Aristocratic & Secure', color: 'bg-[#073a2d]' };
  };

  const pwStrength = getPasswordStrength(regPassword);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(signInEmail, signInPassword);
      router.push('/profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(
        {
          name: regName || 'Mahfuzur Rahman',
          email: regEmail || 'patron@ronginlibas.com',
          phone: regMobile ? `+880 ${regMobile}` : '+880 1712-345678',
          tailoringProfile: {
            height: "5' 11\"",
            chest: '40 Inches',
            preferredPanjabiLength: '42 Inches',
            preferredFit,
            preferredCollar,
          },
        },
        regPassword
      );
      router.push('/profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-36 sm:pt-40 pb-20 bg-[#fbf9f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#717975]">
          <Link href="/" className="hover:text-[#073a2d] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#073a2d] font-semibold">Patron Sanctuary Portal</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#deddd3] bg-white shadow-xl overflow-hidden">
          {/* Left Editorial Privilege Sanctuary (5 Cols) */}
          <div className="lg:col-span-5 bg-[#073a2d] text-[#fbf9f2] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
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
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
            {/* Crest & Title */}
            <div className="text-center pb-8">
              <div className="flex justify-center mb-3">
                <Logo className="h-12 w-auto" />
              </div>
              <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#c79a45] font-bold">
                Cloth Your Identity
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] mt-1 font-normal">
                Patron Sanctuary Portal
              </h2>
            </div>

            {/* Dual Tab Switcher */}
            <div className="flex max-w-md mx-auto w-full mb-8 bg-[#f5f4ed] p-1 border border-[#deddd3]">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-3 px-4 font-sans text-xs uppercase tracking-wider font-semibold transition-all ${
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
                <span>Join Atelier</span>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-normal bg-[#c79a45] text-[#073a2d] border-0 px-1.5 py-0 font-bold"
                >
                  ৳500 Gift
                </Badge>
              </button>
            </div>

            {/* ================= TAB 1: SIGN IN ================= */}
            {activeTab === 'signin' && (
              <div className="max-w-md mx-auto w-full space-y-6">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                      Patron Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="e.g. mahfuz@bangladesh.com"
                        required
                        className="bg-[#fbf9f2] border-[#deddd3] h-12 pl-10 focus:border-[#073a2d]"
                      />
                      <Mail className="w-4 h-4 text-[#717975] absolute left-3.5 top-4 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                        Secret Key / Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset instructions will be sent to your registered email.')}
                        className="font-sans text-xs text-[#c79a45] hover:underline"
                      >
                        Forgot Password?
                      </button>
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
                    disabled={isSubmitting}
                    className="w-full bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-[0.16em] h-13 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Enter Patron Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                {/* Quick Demo Pre-fill for reviewer */}
                <div className="pt-4 border-t border-[#f0eee7] text-center">
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
                </div>
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
                    <strong className="font-semibold text-[#073a2d]">Inaugural Privilege:</strong>{' '}
                    <span className="text-[#c79a45] font-bold">৳500 Welcome Honorarium</span> will be auto-credited to your account.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                      Full Sartorial Name
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
                        BD Mobile (SMS Alerts)
                      </Label>
                      <div className="flex items-center">
                        <span className="bg-[#eae8e1] border border-r-0 border-[#deddd3] px-2.5 h-11 text-xs font-semibold flex items-center text-[#404945]">
                          +880
                        </span>
                        <Input
                          type="tel"
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value)}
                          placeholder="17XXXXXXXX"
                          required
                          className="bg-[#fbf9f2] border-[#deddd3] h-11 rounded-none focus:border-[#073a2d]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                        Patron Email
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
                        Create Atelier Password
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
                        placeholder="Minimum 8 characters"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-[0.16em] h-13 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Crown className="w-4 h-4 text-[#c79a45]" />
                      <span>{isSubmitting ? 'Enrolling...' : 'Join Atelier & Claim ৳500 Key'}</span>
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
