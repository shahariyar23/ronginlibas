'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getWhatsAppUrl, useStorefront } from '@/context/StorefrontContext';
import { LogoLoader } from '@/components/common/LogoLoader';
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
  Loader2,
  Camera,
  X,
  ImageIcon,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';
import { SocialAccountsManager } from '@/components/profile/SocialAccountsManager';
import { AccountDeletionSection } from '@/components/profile/AccountDeletionSection';
import {
  getEligibleReviews,
  getCustomerReviews,
  submitProductReview,
  uploadReviewImage,
  EligibleReviewProduct,
  CustomerSubmittedReview,
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  setDefaultCustomerAddress,
  deleteCustomerAddress,
  CustomerAddress,
} from '@/lib/api';
import {
  BANGLADESH_DIVISIONS,
  getDistrictsByDivision,
  getThanasByDistrict,
} from '@/data/bangladeshGeo';
import { cn } from '@/lib/utils';

export const ProfileClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const orderNumberParam = searchParams.get('orderNumber');
  const productIdParam = searchParams.get('productId');
  const productNameParam = searchParams.get('productName');
  const sizeParam = searchParams.get('size');
  const colorParam = searchParams.get('color');

  const { user, isLoggedIn, isLoading, logout, updateProfile, changePassword } = useAuth();
  const { settings } = useStorefront();
  const whatsappUrl = getWhatsAppUrl(settings?.whatsapp || '');

  const [activeTab, setActiveTab] = useState<'details' | 'addresses' | 'security' | 'reviews'>(() => {
    if (tabParam === 'addresses') return 'addresses';
    if (tabParam === 'reviews') return 'reviews';
    if (tabParam === 'security') return 'security';
    return 'details';
  });

  // Saved Addresses states
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: '',
    customThana: '',
    address: '',
    postalCode: '',
    isDefault: false,
  });

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState(user?.address.line1 || '');
  const [division, setDivision] = useState(user?.address.division || 'Dhaka');
  const [district, setDistrict] = useState(user?.address.city || 'Dhaka');
  const [thana, setThana] = useState('');
  const [customThana, setCustomThana] = useState('');
  const [postalCode, setPostalCode] = useState(user?.address.postalCode || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Reviews states
  const [eligibleProducts, setEligibleProducts] = useState<EligibleReviewProduct[]>([]);
  const [myReviews, setMyReviews] = useState<CustomerSubmittedReview[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewModalProduct, setReviewModalProduct] = useState<EligibleReviewProduct | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const hasAutoOpenedModal = useRef(false);

  const handleReviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (reviewImages.length + files.length > 5) {
      toast.error('You can upload up to 5 photos per review.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
          throw new Error('Only JPEG, PNG, WEBP, and AVIF images are supported.');
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('Photo size must not exceed 10MB.');
        }
        const res = await uploadReviewImage(file);
        return res.url;
      });

      const urls = await Promise.all(uploadPromises);
      setReviewImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} photo${urls.length > 1 ? 's' : ''} attached successfully!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload photo.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveReviewImage = (indexToRemove: number) => {
    setReviewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  useEffect(() => {
    if (tabParam === 'reviews' || tabParam === 'security' || tabParam === 'details') {
      setActiveTab(tabParam);
    }
    if (tabParam === 'reviews') {
      const timer = setTimeout(() => {
        const el = document.getElementById('reviews-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [tabParam]);

  const loadProfileReviews = React.useCallback(async () => {
    if (!user) return;
    setIsReviewsLoading(true);
    try {
      const [eligible, submitted] = await Promise.all([
        getEligibleReviews(),
        getCustomerReviews(),
      ]);
      setEligibleProducts(eligible || []);
      setMyReviews(submitted || []);
    } catch (err) {
      console.error('Could not load profile reviews', err);
    } finally {
      setIsReviewsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    setIsReviewsLoading(true);
    Promise.all([getEligibleReviews(), getCustomerReviews()])
      .then(([eligible, submitted]) => {
        if (!active) return;
        setEligibleProducts(eligible || []);
        setMyReviews(submitted || []);
      })
      .catch((err) => {
        console.error('Could not load profile reviews', err);
      })
      .finally(() => {
        if (active) setIsReviewsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  // Auto-open review modal if navigated from "Write Review" button
  useEffect(() => {
    if (hasAutoOpenedModal.current) return;
    if (!productIdParam && !orderNumberParam) return;

    if (eligibleProducts.length > 0) {
      const match = eligibleProducts.find(
        (p) =>
          (productIdParam && (p.product.id === productIdParam || p.product.slug === productIdParam)) ||
          (orderNumberParam && (p.orderNumber === orderNumberParam || p.orderId === orderNumberParam)),
      );
      if (match) {
        setReviewModalProduct(match);
        setReviewRating(5);
        setReviewComment('');
        hasAutoOpenedModal.current = true;
        return;
      }
    }

    if (productIdParam && productNameParam) {
      setReviewModalProduct({
        orderId: orderNumberParam || '',
        orderNumber: orderNumberParam || '',
        deliveredAt: new Date().toISOString(),
        product: {
          id: productIdParam,
          name: productNameParam,
          slug: productIdParam,
          image: null,
        },
        size: sizeParam || '',
        color: colorParam || '',
      });
      setReviewRating(5);
      setReviewComment('');
      hasAutoOpenedModal.current = true;
    }
  }, [eligibleProducts, productIdParam, orderNumberParam, productNameParam, sizeParam, colorParam]);

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
        reviewImages,
      );
      toast.success('Your review and photos have been submitted for moderation. It will be displayed after atelier approval.');
      setReviewModalProduct(null);
      setReviewComment('');
      setReviewRating(5);
      setReviewImages([]);
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
    const userDiv = user.address?.division || 'Dhaka';
    setDivision(userDiv);
    const districts = getDistrictsByDivision(userDiv);
    const matchedDistrict = districts.find(
      (d) => d.name.toLowerCase() === (user.address?.city ?? '').toLowerCase(),
    );
    setDistrict(matchedDistrict ? matchedDistrict.name : (districts[0]?.name || 'Dhaka'));
    setPostalCode(user.address?.postalCode ?? '');
    setHeight(user.tailoringProfile?.height ?? '');
    setChest(user.tailoringProfile?.chest ?? '');
    setShoulder(user.tailoringProfile?.shoulder ?? '');
    setPanjabiLength(user.tailoringProfile?.preferredPanjabiLength ?? '');
    setFit(user.tailoringProfile?.preferredFit ?? '');
    setCollar(user.tailoringProfile?.preferredCollar ?? '');
  }, [user]);

  const availableProfileDistricts = React.useMemo(() => {
    return getDistrictsByDivision(division);
  }, [division]);

  const availableProfileThanas = React.useMemo(() => {
    return getThanasByDistrict(division, district);
  }, [division, district]);

  const handleProfileDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    const dists = getDistrictsByDivision(newDivision);
    setDistrict(dists[0]?.name || '');
    setThana('');
    setCustomThana('');
  };

  const handleProfileDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setThana('');
    setCustomThana('');
  };

  const availableModalDistricts = React.useMemo(() => {
    return getDistrictsByDivision(addressForm.division);
  }, [addressForm.division]);

  const availableModalThanas = React.useMemo(() => {
    return getThanasByDistrict(addressForm.division, addressForm.district);
  }, [addressForm.division, addressForm.district]);

  const handleModalDivisionChange = (newDivision: string) => {
    const dists = getDistrictsByDivision(newDivision);
    setAddressForm((prev) => ({
      ...prev,
      division: newDivision,
      district: dists[0]?.name || '',
      thana: '',
      customThana: '',
    }));
  };

  const handleModalDistrictChange = (newDistrict: string) => {
    setAddressForm((prev) => ({
      ...prev,
      district: newDistrict,
      thana: '',
      customThana: '',
    }));
  };

  const loadAddresses = React.useCallback(async () => {
    try {
      setIsAddressesLoading(true);
      const data = await getCustomerAddresses();
      setSavedAddresses(data);
    } catch (err: any) {
      console.warn('Failed to load customer addresses:', err);
    } finally {
      setIsAddressesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user, loadAddresses]);

  const handleOpenAddAddress = () => {
    if (savedAddresses.length >= 5) {
      toast.error('You can save a maximum of 5 delivery addresses.');
      return;
    }
    setEditingAddress(null);
    setAddressForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      division: 'Dhaka',
      district: 'Dhaka',
      thana: '',
      customThana: '',
      address: '',
      postalCode: '',
      isDefault: savedAddresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    const addrDivision = addr.division || 'Dhaka';
    const districts = getDistrictsByDivision(addrDivision);
    const matchedDistrict = districts.find(
      (d) => d.name.toLowerCase() === (addr.city || '').toLowerCase(),
    );
    const districtName = matchedDistrict ? matchedDistrict.name : (districts[0]?.name || 'Dhaka');

    setAddressForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      email: addr.email || '',
      division: addrDivision,
      district: districtName,
      thana: addr.area || '',
      customThana: '',
      address: addr.addressLine1 || '',
      postalCode: addr.postalCode || '',
      isDefault: addr.isDefault || false,
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.phone.trim()) {
      toast.error('Please enter recipient name and phone number.');
      return;
    }
    if (!addressForm.division || !addressForm.district) {
      toast.error('Please select Division and District.');
      return;
    }
    if (!addressForm.address.trim()) {
      toast.error('Please enter street address.');
      return;
    }

    const effectiveThana = addressForm.thana === 'OTHER' ? addressForm.customThana.trim() : addressForm.thana.trim();

    setIsSavingAddress(true);
    try {
      if (editingAddress) {
        await updateCustomerAddress(editingAddress.id, {
          fullName: addressForm.fullName.trim(),
          phone: addressForm.phone.replace(/\s/g, ''),
          email: addressForm.email.trim() || undefined,
          division: addressForm.division,
          city: addressForm.district,
          area: effectiveThana || undefined,
          addressLine1: addressForm.address.trim(),
          postalCode: addressForm.postalCode.trim() || undefined,
          isDefault: addressForm.isDefault,
        });
        toast.success('Address updated successfully');
      } else {
        if (savedAddresses.length >= 5) {
          toast.error('Maximum 5 addresses saved. Please delete an existing address.');
          return;
        }
        await createCustomerAddress({
          fullName: addressForm.fullName.trim(),
          phone: addressForm.phone.replace(/\s/g, ''),
          email: addressForm.email.trim() || undefined,
          division: addressForm.division,
          city: addressForm.district,
          area: effectiveThana || undefined,
          addressLine1: addressForm.address.trim(),
          postalCode: addressForm.postalCode.trim() || undefined,
          isDefault: addressForm.isDefault,
        });
        toast.success('Address added successfully');
      }
      setAddressModalOpen(false);
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await setDefaultCustomerAddress(id);
      toast.success('Default address updated');
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update default address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteCustomerAddress(id);
      toast.success('Address removed');
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove address');
    }
  };

  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    if (!isLoading && !isLoggedIn && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      toast.error('You are not logged in. Please login first.');
    }
  }, [isLoading, isLoggedIn]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    try {
      const effectiveThana = thana === 'OTHER' ? customThana.trim() : thana.trim();
      const cityValue = district
        ? (effectiveThana ? `${district}, ${effectiveThana}` : district)
        : (effectiveThana || 'Dhaka');
      await updateProfile({
        name,
        email,
        phone,
        address: {
          line1: addressLine,
          division,
          city: cityValue,
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
      toast.success('Patron details saved successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save patron details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdatingPassword) return;
    if (newPw !== confirmPw) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    if (newPw.length < 10 || !/[a-z]/.test(newPw) || !/[A-Z]/.test(newPw) || !/\d/.test(newPw)) {
      toast.error('Password must be at least 10 characters and include uppercase, lowercase, and a number.');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      if (await changePassword(oldPw, newPw)) {
        setOldPw('');
        setNewPw('');
        setConfirmPw('');
        router.push('/login');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await logout();
      router.push('/');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return <LogoLoader />;
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
              <span>Create New Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 sm:pt-10 pb-20 sm:pb-24 bg-[#fbf9f2]" data-clarity-mask="true">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Top Breadcrumb & Sanctuary Header */}
        <div>
          <nav className="mb-3 sm:mb-4 flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#717975]">
            <Link href="/" className="hover:text-[#073a2d] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#073a2d] font-semibold">Patron Sanctuary</span>
          </nav>

          {/* Patron Banner Card */}
          <div className="bg-[#073a2d] text-[#fbf9f2] p-4 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 shadow-md border-l-4 border-[#c79a45] relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-3.5 sm:gap-6">
              <div className="w-13 h-13 sm:w-20 sm:h-20 bg-[#c79a45] text-[#073a2d] font-serif text-xl sm:text-3xl font-bold flex items-center justify-center shrink-0 shadow-inner">
                {name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1">
                  <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#c79a45] font-semibold flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" />
                    {user?.tier || 'Heritage Atelier Tier'}
                  </span>
                  <span className="text-[#76a493] text-xs">•</span>
                  <span className="font-mono text-[11px] sm:text-xs text-[#deddd3]">
                    ID: {user?.membershipId || ''}
                  </span>
                </div>
                <h1 className="font-serif text-xl sm:text-3xl text-white font-normal">
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
                disabled={isSigningOut}
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ba1a1a]/20 hover:bg-[#ba1a1a]/30 text-[#fbf9f2] font-sans text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-wait"
              >
                {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <LogOut className="w-4 h-4" />}
                <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
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

              {/* Saved Addresses (Tab button) */}
              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center justify-between p-4 font-sans text-xs uppercase tracking-wider font-semibold transition-colors text-left cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-[#073a2d] text-white'
                    : 'text-[#404945] hover:bg-[#fbf9f2] hover:text-[#073a2d]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-4 h-4 ${activeTab === 'addresses' ? 'text-[#c79a45]' : 'text-[#717975]'}`} />
                  <span>Saved Addresses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${activeTab === 'addresses' ? 'bg-[#c79a45] text-[#073a2d]' : 'bg-[#f0eee7] text-[#073a2d]'} text-[10px] px-2 py-0.5 rounded-full font-bold`}>
                    {savedAddresses.length}/5
                  </Badge>
                  <ChevronRight className="w-4 h-4" />
                </div>
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

                {!user.hasPhone && (
                  <div className="p-4 bg-[#fbf5e6] border border-[#c79a45]/50 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-[#c79a45] text-[#073a2d] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      !
                    </div>
                    <div>
                      <h4 className="font-sans text-xs font-semibold text-[#073a2d] uppercase tracking-wider">
                        Action Required: Add Mobile Number
                      </h4>
                      <p className="font-sans text-xs text-[#69726d] mt-0.5 leading-relaxed">
                        Your account was registered via social authentication. Please specify your primary contact number below to enable order dispatches and courier tracking.
                      </p>
                    </div>
                  </div>
                )}

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

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                            Division
                          </Label>
                          <select
                            value={division}
                            onChange={(e) => handleProfileDivisionChange(e.target.value)}
                            className="w-full bg-[#fbf9f2] border border-[#deddd3] h-11 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
                          >
                            <option value="">Select Division</option>
                            {BANGLADESH_DIVISIONS.map((d) => (
                              <option key={d.name} value={d.name}>
                                {d.name} Division
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                            District (Zilla)
                          </Label>
                          <select
                            value={district}
                            disabled={!division}
                            onChange={(e) => handleProfileDistrictChange(e.target.value)}
                            className="w-full bg-[#fbf9f2] border border-[#deddd3] h-11 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d] disabled:opacity-50 disabled:bg-[#f0eee7] disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {division ? 'Select District (Zilla)' : 'Select Division first'}
                            </option>
                            {availableProfileDistricts.map((d) => (
                              <option key={d.name} value={d.name}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                            Thana / Upazila
                          </Label>
                          <select
                            value={thana}
                            disabled={!district}
                            onChange={(e) => setThana(e.target.value)}
                            className="w-full bg-[#fbf9f2] border border-[#deddd3] h-11 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d] disabled:opacity-50 disabled:bg-[#f0eee7] disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {district ? 'Select Thana / Upazila' : 'Select District first'}
                            </option>
                            {availableProfileThanas.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                            {Boolean(district) && (
                              <option value="OTHER">Other / Custom Area...</option>
                            )}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                            Postal Code
                          </Label>
                          <Input
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="e.g. 1212"
                            className="bg-[#fbf9f2] border-[#deddd3] h-11"
                          />
                        </div>

                        {thana === 'OTHER' && (
                          <div className="space-y-1.5 sm:col-span-2 md:col-span-4">
                            <Label className="font-sans text-xs uppercase tracking-wider text-[#404945]">
                              Specify Thana / Sub-district
                            </Label>
                            <Input
                              value={customThana}
                              onChange={(e) => setCustomThana(e.target.value)}
                              placeholder="e.g. Specific police station, cantonment, or local upazila"
                              className="bg-[#fbf9f2] border-[#deddd3] h-11"
                            />
                          </div>
                        )}
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
                          max="500"
                          step="0.01"
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
                          max="500"
                          step="0.01"
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
                          max="500"
                          step="0.01"
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
                          max="500"
                          step="0.01"
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
                      loading={isSavingProfile}
                      loadingText="Saving Details..."
                      disabled={isSavingProfile}
                      className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest px-6 h-12 shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Patron Details</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= TAB: SAVED ADDRESSES ================= */}
            {activeTab === 'addresses' && (
              <div className="bg-white border border-[#deddd3] p-6 sm:p-10 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0eee7]">
                  <div>
                    <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold block mb-1">
                      Residence Sanctuary
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal">
                      Saved Delivery Addresses ({savedAddresses.length}/5)
                    </h2>
                    <p className="font-sans text-xs text-[#69726d] mt-1">
                      Manage up to 5 verified delivery addresses. Your default address is pre-selected during checkout.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleOpenAddAddress}
                    disabled={savedAddresses.length >= 5}
                    className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider px-5 h-11 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{savedAddresses.length >= 5 ? 'Max 5 Reached' : 'Add New Address'}</span>
                  </Button>
                </div>

                {isAddressesLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-[#717975]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#073a2d]" />
                    <span>Loading saved addresses...</span>
                  </div>
                ) : savedAddresses.length === 0 ? (
                  <div className="py-12 px-4 text-center border-2 border-dashed border-[#deddd3] p-8 space-y-4">
                    <MapPin className="w-10 h-10 text-[#c79a45] mx-auto opacity-70" />
                    <h3 className="font-serif text-lg text-[#073a2d] font-semibold">
                      No Saved Addresses Yet
                    </h3>
                    <p className="text-xs text-[#717975] max-w-sm mx-auto">
                      Add your preferred delivery address now or enter it during checkout to save up to 5 locations.
                    </p>
                    <Button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white text-xs uppercase tracking-wider px-6 h-10"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add Your First Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={cn(
                          'p-5 border transition-all relative flex flex-col justify-between bg-white',
                          addr.isDefault
                            ? 'border-[#073a2d] ring-1 ring-[#073a2d] bg-[#fbf9f2]/40 shadow-xs'
                            : 'border-[#deddd3] hover:border-[#c79a45]/80',
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-serif font-bold text-[#073a2d] text-sm">
                              {addr.fullName || user?.name || 'Saved Address'}
                            </span>
                            {addr.isDefault ? (
                              <Badge className="bg-[#073a2d] text-[#fbf9f2] text-[9px] font-sans px-2 py-0.5 uppercase tracking-wider font-bold">
                                DEFAULT ADDRESS
                              </Badge>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-[11px] text-[#c79a45] hover:underline font-semibold cursor-pointer"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-[#404945] font-sans leading-relaxed">
                            {addr.addressLine1}
                            {addr.area ? `, ${addr.area}` : ''}
                            <br />
                            {addr.city}, {addr.division}
                            {addr.postalCode ? ` - ${addr.postalCode}` : ''}
                          </p>

                          <div className="mt-3 pt-3 border-t border-[#deddd3]/60 text-xs text-[#717975] space-y-0.5">
                            <p>Mobile: <strong className="text-[#1b1c18] font-medium">{addr.phone}</strong></p>
                            {addr.email && <p>Email: <span className="text-[#1b1c18]">{addr.email}</span></p>}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#deddd3]/60">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#073a2d] hover:bg-[#fbf9f2] border border-[#deddd3] font-medium cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#ba1a1a] hover:bg-[#ba1a1a]/10 border border-[#deddd3] font-medium cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    loading={isUpdatingPassword}
                    loadingText="Updating Password..."
                    disabled={isUpdatingPassword}
                    className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest px-6 h-12 shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-[#c79a45]" />
                    <span>Update Sanctuary Password</span>
                  </Button>
                </form>

                <SocialAccountsManager />

                <AccountDeletionSection />
              </div>
            )}

            {/* ================= TAB 3: PRODUCT REVIEWS ================= */}
            {activeTab === 'reviews' && (
              <div id="reviews-section" className="bg-white border border-[#deddd3] p-6 sm:p-10 shadow-sm space-y-10">
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
                                  href={`/products/${rev.productSlug}`}
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

                          {rev.images && rev.images.length > 0 && (
                            <div className="pt-2">
                              <p className="font-sans text-[11px] uppercase tracking-wider font-semibold text-[#717975] mb-1.5 flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5 text-[#c79a45]" />
                                <span>Attached Photos ({rev.images.length})</span>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {rev.images.map((img, idx) => (
                                  <a
                                    key={idx}
                                    href={img}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-16 h-20 sm:w-20 sm:h-24 rounded border border-[#deddd3] overflow-hidden hover:opacity-90 hover:border-[#c79a45] transition-all shrink-0 bg-[#fbf9f2]"
                                    title="View full photo"
                                  >
                                    <img
                                      src={img}
                                      alt={`Review photo ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Official Atelier Response */}
                          {rev.adminFeedback && (
                            <div className="mt-2 bg-[#fbf9f2] border-l-2 border-[#073a2d] p-3 text-xs space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-[#073a2d] uppercase tracking-wider flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-[#073a2d]" />
                                  <span>Official Atelier Response</span>
                                </span>
                                {rev.adminFeedbackAt && (
                                  <span className="text-[#717975] text-[10px]">
                                    {new Date(rev.adminFeedbackAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="font-sans text-xs text-[#1b1c18] italic leading-relaxed pt-0.5">
                                &ldquo;{rev.adminFeedback}&rdquo;
                              </p>
                            </div>
                          )}
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
          if (!open) {
            setReviewModalProduct(null);
            setReviewImages([]);
          }
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
                rows={4}
                maxLength={3000}
                placeholder="Share your detailed reflection on the fabric texture, collar firmness, stitching precision, and delivery verification..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3 border border-[#deddd3] bg-[#fbf9f2] font-sans text-xs text-[#404945] focus:outline-none focus:border-[#073a2d]"
              />
            </div>

            {/* Garment Photos Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#404945]">
                  Attach Garment Photos (Optional)
                </label>
                <span className="text-[11px] font-sans text-[#717975]">
                  {reviewImages.length}/5 Photos
                </span>
              </div>

              {/* Uploaded Photos Preview Grid */}
              {reviewImages.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mb-2.5">
                  {reviewImages.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded border border-[#deddd3] overflow-hidden group bg-[#fbf9f2] shrink-0"
                    >
                      <img
                        src={imgUrl}
                        alt={`Review photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveReviewImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/75 hover:bg-[#ba1a1a] text-white rounded-full flex items-center justify-center transition-colors shadow cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Photo Upload Trigger */}
              {reviewImages.length < 5 && (
                <div>
                  <input
                    type="file"
                    id="profile-review-photo-input"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={handleReviewImageUpload}
                    disabled={isUploadingImage}
                  />
                  <label
                    htmlFor="profile-review-photo-input"
                    className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#deddd3] hover:border-[#c79a45] hover:bg-[#fbf9f2] text-[#073a2d] rounded transition-colors cursor-pointer ${
                      isUploadingImage ? 'opacity-60 pointer-events-none' : ''
                    }`}
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#c79a45]" />
                        <span className="font-sans text-xs font-semibold">
                          Uploading photos to Cloudinary...
                        </span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 text-[#c79a45]" />
                        <span className="font-sans text-xs font-semibold">
                          Click to attach fabric texture, fit, or finish photos
                        </span>
                        <span className="text-[10px] text-[#717975] hidden sm:inline">
                          (Max 5)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReviewModalProduct(null);
                  setReviewImages([]);
                }}
                className="font-sans text-xs uppercase tracking-wider border-[#deddd3] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmittingReview}
                loadingText="Submitting..."
                disabled={isSubmittingReview || isUploadingImage}
                className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider px-6 cursor-pointer"
              >
                Submit Reflection
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Address Add/Edit Dialog Modal */}
      <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
        <DialogContent className="max-w-lg bg-white p-6 sm:p-8 rounded-none border border-[#deddd3] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-[#deddd3]">
            <DialogTitle className="font-serif text-xl text-[#073a2d]">
              {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-4 pt-3 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                  Recipient Name *
                </Label>
                <Input
                  required
                  placeholder="e.g. Salim Ahmed"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="bg-[#fbf9f2] border-[#deddd3] h-10 text-xs"
                />
              </div>

              <div>
                <Label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                  Mobile Number (+880) *
                </Label>
                <Input
                  required
                  placeholder="01XXXXXXXXX"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="bg-[#fbf9f2] border-[#deddd3] h-10 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                Email Address (Optional)
              </Label>
              <Input
                type="email"
                placeholder="For consignment receipts"
                value={addressForm.email}
                onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                className="bg-[#fbf9f2] border-[#deddd3] h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                  Division *
                </Label>
                <select
                  value={addressForm.division}
                  onChange={(e) => handleModalDivisionChange(e.target.value)}
                  className="w-full bg-[#fbf9f2] border border-[#deddd3] h-10 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
                >
                  {BANGLADESH_DIVISIONS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} Division
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                  District (Zilla) *
                </Label>
                <select
                  value={addressForm.district}
                  onChange={(e) => handleModalDistrictChange(e.target.value)}
                  className="w-full bg-[#fbf9f2] border border-[#deddd3] h-10 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
                >
                  {availableModalDistricts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                Thana / Upazila
              </Label>
              <select
                value={addressForm.thana}
                onChange={(e) => setAddressForm({ ...addressForm, thana: e.target.value })}
                className="w-full bg-[#fbf9f2] border border-[#deddd3] h-10 px-3 text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
              >
                <option value="">Select Thana / Upazila</option>
                {availableModalThanas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="OTHER">Other / Specify area...</option>
              </select>
            </div>

            {addressForm.thana === 'OTHER' && (
              <div>
                <Label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                  Specify Thana / Area *
                </Label>
                <Input
                  required
                  placeholder="Local police station or upazila"
                  value={addressForm.customThana}
                  onChange={(e) => setAddressForm({ ...addressForm, customThana: e.target.value })}
                  className="bg-[#fbf9f2] border-[#deddd3] h-10 text-xs"
                />
              </div>
            )}

            <div>
              <Label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                Street Address, House No & Road *
              </Label>
              <Input
                required
                placeholder="House 12, Road 4, Sector 3, Uttara"
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                className="bg-[#fbf9f2] border-[#deddd3] h-10 text-xs"
              />
            </div>

            <div>
              <Label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                Postal Code (Optional)
              </Label>
              <Input
                placeholder="e.g. 1230"
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                className="bg-[#fbf9f2] border-[#deddd3] h-10 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isDefaultAddress"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                className="accent-[#073a2d] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isDefaultAddress" className="text-xs text-[#1b1c18] font-medium cursor-pointer">
                Set as default delivery address for checkout
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#deddd3]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddressModalOpen(false)}
                className="h-10 text-xs uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingAddress}
                className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white h-10 text-xs uppercase tracking-wider px-6 flex items-center gap-2"
              >
                {isSavingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSavingAddress ? 'Saving...' : 'Save Address'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

