'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  ShieldCheck,
  Lock,
  Package,
  Clock,
  LogOut,
  Crown,
  ChevronRight,
  PhoneCall,
  CheckCircle2,
  MapPin,
  Ruler,
  Scissors,
  Save,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const ProfileClient: React.FC = () => {
  const router = useRouter();
  const { user, isLoggedIn, logout, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');

  // Form states
  const [name, setName] = useState(user?.name || 'Mahfuzur Rahman Chowdhury');
  const [email, setEmail] = useState(user?.email || 'mahfuz@bangladesh.com');
  const [phone, setPhone] = useState(user?.phone || '+880 1712-345678');
  const [addressLine, setAddressLine] = useState(user?.address.line1 || 'House 42, Road 11, Block D, Banani');
  const [division, setDivision] = useState(user?.address.division || 'Dhaka');
  const [city, setCity] = useState(user?.address.city || 'Dhaka Metro');
  const [postalCode, setPostalCode] = useState(user?.address.postalCode || '1213');

  // Tailoring profile
  const [height, setHeight] = useState(user?.tailoringProfile.height || "5' 11\"");
  const [chest, setChest] = useState(user?.tailoringProfile.chest || '40 Inches (Medium)');
  const [panjabiLength, setPanjabiLength] = useState(user?.tailoringProfile.preferredPanjabiLength || '42 Inches');
  const [fit, setFit] = useState(user?.tailoringProfile.preferredFit || 'Slim Heritage Cut');
  const [collar, setCollar] = useState(user?.tailoringProfile.preferredCollar || 'High Mandarin Collar');

  // Security states
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      address: {
        line1: addressLine,
        division,
        city,
        postalCode,
      },
      tailoringProfile: {
        height,
        chest,
        preferredPanjabiLength: panjabiLength,
        preferredFit: fit,
        preferredCollar: collar,
      },
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      alert('New password and confirmation do not match.');
      return;
    }
    if (newPw.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
    changePassword(oldPw, newPw);
    setOldPw('');
    setNewPw('');
    setConfirmPw('');
  };

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen pt-36 sm:pt-40 pb-24 bg-[#fbf9f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb & Sanctuary Header */}
        <div>
          <nav className="mb-4 flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#717975]">
            <Link href="/" className="hover:text-[#073a2d] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#073a2d] font-semibold">Patron Sanctuary</span>
          </nav>

          {/* Patron Banner Card */}
          <div className="bg-[#073a2d] text-[#fbf9f2] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border-l-4 border-[#c79a45] relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#c79a45] text-[#073a2d] font-serif text-2xl sm:text-3xl font-bold flex items-center justify-center shrink-0 shadow-inner">
                {name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    {user?.tier || 'Heritage Atelier Tier'}
                  </span>
                  <span className="text-[#76a493] text-xs">•</span>
                  <span className="font-mono text-xs text-[#deddd3]">
                    ID: {user?.membershipId || 'RL-882049'}
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                  {name}
                </h1>
                <p className="font-sans text-xs text-[#76a493] mt-1">
                  Patron since {user?.memberSince || 'September 2024'} • Dhaka Metro Residence
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-3 self-start md:self-center">
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-sans text-xs uppercase tracking-wider transition-colors"
              >
                <Package className="w-4 h-4 text-[#c79a45]" />
                <span>Track Consignment</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ba1a1a]/20 hover:bg-[#ba1a1a]/30 text-[#fbf9f2] font-sans text-xs uppercase tracking-wider transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Two-Column Patron Sanctuary Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Navigation Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-[#deddd3] shadow-xs divide-y divide-[#f0eee7]">
              {/* Active Orders / Track Order */}
              <Link
                href="/track-order"
                className="flex items-center justify-between p-4 text-[#404945] hover:bg-[#fbf9f2] hover:text-[#073a2d] font-sans text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-[#c79a45]" />
                  <span>Active Consignment</span>
                </div>
                <Badge className="bg-[#073a2d] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  1 In Transit
                </Badge>
              </Link>

              {/* Personal Details (Tab button) */}
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`w-full flex items-center justify-between p-4 font-sans text-xs uppercase tracking-wider font-semibold transition-colors text-left ${
                  activeTab === 'details'
                    ? 'bg-[#073a2d] text-white'
                    : 'text-[#404945] hover:bg-[#fbf9f2] hover:text-[#073a2d]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className={`w-4 h-4 ${activeTab === 'details' ? 'text-[#c79a45]' : 'text-[#717975]'}`} />
                  <span>Personal Details</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Security / Password (Tab button) */}
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center justify-between p-4 font-sans text-xs uppercase tracking-wider font-semibold transition-colors text-left ${
                  activeTab === 'security'
                    ? 'bg-[#073a2d] text-white'
                    : 'text-[#404945] hover:bg-[#fbf9f2] hover:text-[#073a2d]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className={`w-4 h-4 ${activeTab === 'security' ? 'text-[#c79a45]' : 'text-[#717975]'}`} />
                  <span>Change Password</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Order History */}
              <Link
                href="/orders"
                className="flex items-center justify-between p-4 text-[#404945] hover:bg-[#fbf9f2] hover:text-[#073a2d] font-sans text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#717975]" />
                  <span>Order History</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#717975]" />
              </Link>
            </div>

            {/* Bespoke Membership Micro-Card */}
            <div className="bg-[#f5f4ed] border border-[#deddd3] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#073a2d] font-sans text-xs uppercase tracking-widest font-bold">
                <Crown className="w-4 h-4 text-[#c79a45]" />
                <span>Heritage Atelier Privileges</span>
              </div>
              <p className="font-sans text-xs text-[#69726d] leading-relaxed">
                Patron status unlocks complimentary home alteration trials across Dhaka Metro, VIP festival loom reservations, and dedicated master tailor advisory.
              </p>
              <div className="pt-1">
                <a
                  href="https://wa.me/8801916664011"
                  target="_blank"
                  rel="noreferrer"
                  className="font-sans text-xs uppercase tracking-wider text-[#073a2d] hover:text-[#0d4d3b] font-bold flex items-center gap-1.5 underline decoration-[#c79a45] underline-offset-4"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>Contact Master Craftsman</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Tab Panels (8 Cols) */}
          <main className="lg:col-span-8">
            {/* ================= TAB 1: PERSONAL DETAILS ================= */}
            {activeTab === 'details' && (
              <div className="bg-white border border-[#deddd3] p-6 sm:p-10 shadow-sm space-y-8">
                <div>
                  <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold block mb-1">
                    Patron Credentials
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal">
                    Personal Details & Sartorial Identity
                  </h2>
                  <p className="font-sans text-xs text-[#69726d] mt-1">
                    Manage your contact information, delivery residence, and tailored fit profile.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-8">
                  {/* Section 1: Contact Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#f0eee7]">
                      <User className="w-4 h-4 text-[#073a2d]" />
                      <h3 className="font-serif text-lg text-[#073a2d]">Contact Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                          Full Legal Name
                        </Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="bg-[#fbf9f2] border-[#deddd3] h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                            Email Address
                          </Label>
                          <span className="text-[10px] text-[#073a2d] font-bold uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#073a2d]" /> Verified
                          </span>
                        </div>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-[#fbf9f2] border-[#deddd3] h-11"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                          Primary WhatsApp / Mobile Number
                        </Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="bg-[#fbf9f2] border-[#deddd3] h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Delivery Residence */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#f0eee7]">
                      <MapPin className="w-4 h-4 text-[#073a2d]" />
                      <h3 className="font-serif text-lg text-[#073a2d]">Delivery Residence</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                          Street Address / House / Road
                        </Label>
                        <Input
                          value={addressLine}
                          onChange={(e) => setAddressLine(e.target.value)}
                          required
                          className="bg-[#fbf9f2] border-[#deddd3] h-11"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                            Division
                          </Label>
                          <select
                            value={division}
                            onChange={(e) => setDivision(e.target.value)}
                            className="w-full bg-[#fbf9f2] border border-[#deddd3] h-11 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
                          >
                            <option value="Dhaka">Dhaka</option>
                            <option value="Chattogram">Chattogram</option>
                            <option value="Sylhet">Sylhet</option>
                            <option value="Rajshahi">Rajshahi</option>
                            <option value="Khulna">Khulna</option>
                            <option value="Barishal">Barishal</option>
                            <option value="Rangpur">Rangpur</option>
                            <option value="Mymensingh">Mymensingh</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                            City / Area
                          </Label>
                          <Input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            className="bg-[#fbf9f2] border-[#deddd3] h-11"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                            Postal Code
                          </Label>
                          <Input
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                            className="bg-[#fbf9f2] border-[#deddd3] h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Sartorial Bespoke Dimensions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#f0eee7]">
                      <Ruler className="w-4 h-4 text-[#073a2d]" />
                      <h3 className="font-serif text-lg text-[#073a2d]">
                        Bespoke Measurements & Cut Profile
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                          Patron Height
                        </Label>
                        <Input
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="bg-[#fbf9f2] border-[#deddd3] h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                          Chest Profile
                        </Label>
                        <Input
                          value={chest}
                          onChange={(e) => setChest(e.target.value)}
                          className="bg-[#fbf9f2] border-[#deddd3] h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                          Preferred Panjabi Length
                        </Label>
                        <Input
                          value={panjabiLength}
                          onChange={(e) => setPanjabiLength(e.target.value)}
                          className="bg-[#fbf9f2] border-[#deddd3] h-11"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                        <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                          Preferred Fit
                        </Label>
                        <select
                          value={fit}
                          onChange={(e) => setFit(e.target.value)}
                          className="w-full bg-[#fbf9f2] border border-[#deddd3] h-11 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
                        >
                          <option value="Slim Heritage Cut">Slim Heritage Cut</option>
                          <option value="Classic Aristocratic Cut">Classic Aristocratic Cut</option>
                          <option value="Modern Relaxed Drape">Modern Relaxed Drape</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                          Signature Collar
                        </Label>
                        <select
                          value={collar}
                          onChange={(e) => setCollar(e.target.value)}
                          className="w-full bg-[#fbf9f2] border border-[#deddd3] h-11 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
                        >
                          <option value="High Mandarin Collar">High Mandarin Collar</option>
                          <option value="Classic Band Collar">Classic Band Collar</option>
                          <option value="Royal Embroidered Collar">Royal Embroidered Collar</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#f0eee7]">
                    <span className="font-sans text-xs text-[#717975]">
                      All updates sync directly with your master tailoring record.
                    </span>
                    <Button
                      type="submit"
                      className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest px-6 h-12 shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Patron Details</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= TAB 2: CHANGE PASSWORD ================= */}
            {activeTab === 'security' && (
              <div className="bg-white border border-[#deddd3] p-6 sm:p-10 shadow-sm space-y-8">
                <div>
                  <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold block mb-1">
                    Sanctuary Security
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal">
                    Change Password & Access Credentials
                  </h2>
                  <p className="font-sans text-xs text-[#69726d] mt-1">
                    Ensure your patron portal key is distinct and fortified.
                  </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                  <div className="space-y-1.5">
                    <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                      Current Secret Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showOldPw ? 'text' : 'password'}
                        value={oldPw}
                        onChange={(e) => setOldPw(e.target.value)}
                        required
                        placeholder="Enter current password"
                        className="bg-[#fbf9f2] border-[#deddd3] h-11 pr-10 focus:border-[#073a2d]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPw(!showOldPw)}
                        className="absolute right-3 top-3.5 text-[#717975] hover:text-[#073a2d]"
                      >
                        {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                      New Sanctuary Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        required
                        placeholder="Minimum 8 characters"
                        className="bg-[#fbf9f2] border-[#deddd3] h-11 pr-10 focus:border-[#073a2d]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-3.5 text-[#717975] hover:text-[#073a2d]"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                      Confirm New Password
                    </Label>
                    <Input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      required
                      placeholder="Repeat new password"
                      className="bg-[#fbf9f2] border-[#deddd3] h-11 focus:border-[#073a2d]"
                    />
                  </div>

                  <div className="p-4 bg-[#f5f4ed] border border-[#deddd3] space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#073a2d]">
                      <ShieldCheck className="w-4 h-4 text-[#c79a45]" />
                      <span>Two-Factor Courier Verification</span>
                    </div>
                    <p className="font-sans text-[11px] text-[#69726d]">
                      All consignments undergo SMS OTP dispatch confirmation to your primary mobile (+880 1712-345678) before delivery rider release.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest px-6 h-12 shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-[#c79a45]" />
                    <span>Update Sanctuary Password</span>
                  </Button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
