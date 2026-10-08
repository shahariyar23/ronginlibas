'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getWhatsAppUrl, useStorefront } from '@/context/StorefrontContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
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
  Save,
  Eye,
  EyeOff,
  Star,
  MessageSquare,
} from 'lucide-react';
import {
  getEligibleReviews,
  getCustomerReviews,
  submitProductReview,
  EligibleReviewProduct,
  CustomerSubmittedReview,
} from '@/lib/api';

export const ProfileClient: React.FC = () => {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, logout, updateProfile, changePassword } = useAuth();
  const { settings } = useStorefront();
  const whatsappUrl = getWhatsAppUrl(settings?.whatsapp || '');

  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'reviews'>('details');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState(user?.address.line1 || '');
  const [division, setDivision] = useState(user?.address.division || '');
  const [city, setCity] = useState(user?.address.city || '');
  const [postalCode, setPostalCode] = useState(user?.address.postalCode || '');

  // Tailoring profile
  const [height, setHeight] = useState(user?.tailoringProfile.height || '');
  const [chest, setChest] = useState(user?.tailoringProfile.chest || '');
  const [shoulder, setShoulder] = useState(user?.tailoringProfile.shoulder || '');
  const [panjabiLength, setPanjabiLength] = useState(user?.tailoringProfile.preferredPanjabiLength || '');
  const [fit, setFit] = useState(user?.tailoringProfile.preferredFit || '');
  const [collar, setCollar] = useState(user?.tailoringProfile.preferredCollar || '');

  // Security states
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Reviews states
  const [eligibleProducts, setEligibleProducts] = useState<EligibleReviewProduct[]>([]);
  const [myReviews, setMyReviews] = useState<CustomerSubmittedReview[]>([]);
  const [isReviewsLoading] = useState(false);
  const [reviewModalProduct, setReviewModalProduct] = useState<EligibleReviewProduct | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadProfileReviews = React.useCallback(async () => {
    if (!user) return;
    try {
      const [eligible, submitted] = await Promise.all([
        getEligibleReviews(),
        getCustomerReviews(),
      ]);
      setEligibleProducts(eligible || []);
      setMyReviews(submitted || []);
    } catch (err) {
      console.error('Could not load profile reviews', err);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    Promise.all([getEligibleReviews(), getCustomerReviews()])
      .then(([eligible, submitted]) => {
        if (!active) return;
        setEligibleProducts(eligible || []);
        setMyReviews(submitted || []);
      })
      .catch((err) => {
        console.error('Could not load profile reviews', err);
      });
    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const handleProfileSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalProduct) return;
    if (!reviewComment.trim()) {
      toast.error('Please enter your craftsmanship reflection.');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await submitProductReview(
        reviewModalProduct.product.slug || reviewModalProduct.product.id,
        reviewRating,
        reviewComment.trim(),
      );
      toast.success('Your review has been submitted for moderation. It will be displayed after atelier approval.');
      setReviewModalProduct(null);
      setReviewComment('');
      setReviewRating(5);
      await loadProfileReviews();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit your review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setPhone(user.phone ?? '');
    setAddressLine(user.address?.line1 ?? '');
    setDivision(user.address?.division ?? '');
    setCity(user.address?.city ?? '');
    setPostalCode(user.address?.postalCode ?? '');
    setHeight(user.tailoringProfile?.height ?? '');
    setChest(user.tailoringProfile?.chest ?? '');
    setShoulder(user.tailoringProfile?.shoulder ?? '');
    setPanjabiLength(user.tailoringProfile?.preferredPanjabiLength ?? '');
    setFit(user.tailoringProfile?.preferredFit ?? '');
    setCollar(user.tailoringProfile?.preferredCollar ?? '');
  }, [user]);

  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    if (!isLoading && !isLoggedIn && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      toast.error('You are not logged in. Please login first.');
    }
  }, [isLoading, isLoggedIn]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
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
        shoulder,
        preferredPanjabiLength: panjabiLength,
        preferredFit: fit,
        preferredCollar: collar,
      },
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      alert('New password and confirmation do not match.');
      return;
    }
    if (newPw.length < 10 || !/[a-z]/.test(newPw) || !/[A-Z]/.test(newPw) || !/\d/.test(newPw)) {
      alert('Password must be at least 10 characters and include uppercase, lowercase, and a number.');
      return;
    }
    if (await changePassword(oldPw, newPw)) {
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
      router.push('/login');
    }
  };

  const handleSignOut = () => {
    void logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#fbf9f2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#073a2d] border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-xs uppercase tracking-widest text-[#717975]">
            Loading your patron sanctuary...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-[#fbf9f2] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#deddd3] p-8 sm:p-10 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#fdf8ed] border border-[#e8d5aa] flex items-center justify-center text-[#073a2d]">
            <Lock className="w-8 h-8 text-[#073a2d]" />
          </div>
          <Badge className="bg-[#ba1a1a] text-white text-[10px] font-sans uppercase tracking-widest px-2.5 py-0.5 mb-3">
            Authentication Required
          </Badge>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#073a2d] mb-2 font-normal">
            You are not logged in
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#69726d] leading-relaxed mb-6">
            Please login first to view your bespoke tailoring profile, measurements, and patron privileges.
          </p>
          <div className="space-y-3">
            <Link
              href="/login?next=%2Fprofile"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest py-3.5 px-6 font-semibold shadow-md transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-[#c79a45]" />
              <span>Login First</span>
            </Link>
            <Link
              href="/register?next=%2Fprofile"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#f5f4ed] hover:bg-[#eae8e1] text-[#073a2d] font-sans text-xs uppercase tracking-wider py-3 px-6 font-semibold transition-all cursor-pointer"
            >
              <span>Join Atelier (৳500 Gift)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 sm:pt-10 pb-24 bg-[#fbf9f2]">
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
                    ID: {user?.membershipId || ''}
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                  {name}
                </h1>
                <p className="font-sans text-xs text-[#76a493] mt-1">
                  {user?.memberSince ? `Patron since ${user.memberSince}` : 'Customer account'}{user?.address.city ? ` • ${user.address.city}` : ''}
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

              {/* Product Reviews (Tab button) */}
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center justify-between p-4 font-sans text-xs uppercase tracking-wider font-semibold transition-colors text-left cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#073a2d] text-white'
                    : 'text-[#404945] hover:bg-[#fbf9f2] hover:text-[#073a2d]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star className={`w-4 h-4 ${activeTab === 'reviews' ? 'text-[#c79a45]' : 'text-[#717975]'}`} />
                  <span>Product Reviews</span>
                </div>
                {eligibleProducts.length > 0 ? (
                  <Badge className="bg-[#c79a45] text-[#073a2d] text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {eligibleProducts.length} Pending
                  </Badge>
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
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
              {settings?.whatsappOrderEnabled && whatsappUrl && (
              <div className="pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-sans text-xs uppercase tracking-wider text-[#073a2d] hover:text-[#0d4d3b] font-bold flex items-center gap-1.5 underline decoration-[#c79a45] underline-offset-4"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>Contact Master Craftsman</span>
                </a>
              </div>
              )}
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
                          Shoulder Measurement (in)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={shoulder ?? ''}
                          onChange={(e) => setShoulder(e.target.value)}
                          className="bg-[#fbf9f2] border-[#deddd3] h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                          Chest Measurement (in)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={chest ?? ''}
                          onChange={(e) => setChest(e.target.value)}
                          className="bg-[#fbf9f2] border-[#deddd3] h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                          Garment Length (in)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={panjabiLength ?? ''}
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
                          Collar Measurement (in)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={collar ?? ''}
                          onChange={(e) => setCollar(e.target.value)}
                          className="bg-[#fbf9f2] border-[#deddd3] h-11"
                        />
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

            {/* ================= TAB 3: PRODUCT REVIEWS ================= */}
            {activeTab === 'reviews' && (
              <div className="bg-white border border-[#deddd3] p-6 sm:p-10 shadow-sm space-y-10">
                <div>
                  <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold block mb-1">
                    Atelier Reflections
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal">
                    Product Reviews &amp; Reflections
                  </h2>
                  <p className="font-sans text-xs text-[#69726d] mt-1">
                    Share your experience on delivered garments to guide discerning gentlemen across Bengal and abroad.
                  </p>
                </div>

                {/* Section A: Eligible Products (Delivered & Unreviewed) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0eee7]">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#073a2d]" />
                      <h3 className="font-serif text-lg text-[#073a2d]">
                        Garments Eligible for Review
                      </h3>
                    </div>
                    <span className="font-sans text-xs text-[#717975]">
                      {eligibleProducts.length} Eligible
                    </span>
                  </div>

                  {isReviewsLoading ? (
                    <div className="p-8 text-center text-xs text-[#717975] bg-[#fbf9f2] border border-[#deddd3]">
                      Checking delivered orders...
                    </div>
                  ) : eligibleProducts.length === 0 ? (
                    <div className="p-8 text-center bg-[#fbf9f2] border border-[#deddd3] space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-[#073a2d] mx-auto opacity-70" />
                      <p className="font-serif text-base text-[#073a2d]">All caught up!</p>
                      <p className="font-sans text-xs text-[#69726d] max-w-md mx-auto">
                        You have reviewed all eligible delivered garments. When your new orders are successfully delivered, they will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#f0eee7] border border-[#deddd3]">
                      {eligibleProducts.map((item) => (
                        <div
                          key={`${item.orderId}-${item.product.id}`}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-[#fbf9f2] transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-20 bg-[#f5f4ed] border border-[#deddd3] overflow-hidden shrink-0">
                              <img
                                src={item.product.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=200&auto=format&fit=crop&q=80'}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="font-sans text-[10px] uppercase tracking-wider text-[#c79a45] font-semibold block">
                                Order #{item.orderNumber} • Delivered
                              </span>
                              <h4 className="font-serif text-base text-[#073a2d] font-semibold">
                                {item.product.name}
                              </h4>
                              <p className="font-sans text-xs text-[#717975]">
                                {item.color} · Size {item.size}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setReviewModalProduct(item);
                              setReviewRating(5);
                              setReviewComment('');
                            }}
                            className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider px-5 h-10 self-start sm:self-center cursor-pointer whitespace-nowrap"
                          >
                            <Star className="w-3.5 h-3.5 mr-1.5 text-[#c79a45]" />
                            <span>Write Review</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Submitted Reviews History */}
                <div className="space-y-4 pt-4 border-t border-[#deddd3]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0eee7]">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#073a2d]" />
                      <h3 className="font-serif text-lg text-[#073a2d]">
                        My Submitted Reviews
                      </h3>
                    </div>
                    <span className="font-sans text-xs text-[#717975]">
                      {myReviews.length} Submitted
                    </span>
                  </div>

                  {myReviews.length === 0 ? (
                    <div className="p-8 text-center bg-[#fbf9f2] border border-[#deddd3]">
                      <p className="font-sans text-xs text-[#69726d]">
                        You have not submitted any product reviews yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-5 border border-[#deddd3] bg-white shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {rev.productImage && (
                                <img
                                  src={rev.productImage}
                                  alt={rev.productName}
                                  className="w-12 h-14 object-cover border border-[#deddd3] shrink-0"
                                />
                              )}
                              <div>
                                <Link
                                  href={`/product/${rev.productSlug}`}
                                  className="font-serif text-base text-[#073a2d] font-semibold hover:text-[#c79a45] transition-colors"
                                >
                                  {rev.productName}
                                </Link>
                                <div className="flex items-center gap-1 text-[#c79a45] mt-0.5">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3.5 h-3.5 ${
                                        i < rev.rating
                                          ? 'fill-[#c79a45] text-[#c79a45]'
                                          : 'text-[#deddd3]'
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-2 font-sans text-[11px] text-[#717975]">
                                    {new Date(rev.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              {rev.status === 'APPROVED' && (
                                <Badge className="bg-[#b0ecd3]/50 text-[#073a2d] border-0 rounded-none text-[10px] uppercase font-bold">
                                  Approved &amp; Published
                                </Badge>
                              )}
                              {rev.status === 'PENDING' && (
                                <Badge className="bg-[#fdf3dc] text-[#c79a45] border border-[#deddd3] rounded-none text-[10px] uppercase font-bold">
                                  Under Atelier Moderation
                                </Badge>
                              )}
                              {rev.status === 'REJECTED' && (
                                <Badge className="bg-[#ba1a1a]/15 text-[#ba1a1a] border-0 rounded-none text-[10px] uppercase font-bold">
                                  Rejected
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="font-sans text-xs text-[#404945] leading-relaxed bg-[#fbf9f2] p-3 border border-[#f0eee7]">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Review Submission Dialog Modal */}
      <Dialog
        open={Boolean(reviewModalProduct)}
        onOpenChange={(open) => {
          if (!open) setReviewModalProduct(null);
        }}
      >
        <DialogContent className="max-w-lg bg-white p-6 sm:p-8 border border-[#deddd3] shadow-2xl">
          <DialogHeader className="pb-3 border-b border-[#deddd3]">
            <div className="flex items-center gap-2 text-[#c79a45] font-sans text-xs uppercase tracking-widest font-bold">
              <Star className="w-4 h-4 fill-[#c79a45]" />
              <span>Patron Reflection</span>
            </div>
            <DialogTitle className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal mt-1">
              Review {reviewModalProduct?.product.name}
            </DialogTitle>
            <p className="font-sans text-xs text-[#717975]">
              Order #{reviewModalProduct?.orderNumber} • Size {reviewModalProduct?.size} • Color {reviewModalProduct?.color}
            </p>
          </DialogHeader>

          <form onSubmit={handleProfileSubmitReview} className="space-y-4 pt-2">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#404945] mb-1">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= reviewRating
                          ? 'fill-[#c79a45] text-[#c79a45]'
                          : 'text-[#deddd3]'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-sans text-xs font-bold text-[#073a2d]">
                  {reviewRating} of 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#404945] mb-1">
                Craftsmanship Reflection
              </label>
              <textarea
                required
                rows={5}
                maxLength={3000}
                placeholder="Share your detailed reflection on the fabric texture, collar firmness, stitching precision, and delivery verification..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3 border border-[#deddd3] bg-[#fbf9f2] font-sans text-xs text-[#404945] focus:outline-none focus:border-[#073a2d]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReviewModalProduct(null)}
                className="font-sans text-xs uppercase tracking-wider border-[#deddd3] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingReview}
                className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider px-6 cursor-pointer"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Reflection'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
