'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { getWhatsAppUrl, useStorefront } from '@/context/StorefrontContext';
import { apiRequest } from '@/lib/api';
import { Logo } from './Logo';
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Package,
  Truck,
  Clock,
  Bell,
  CheckCheck,
  Star,
  LogOut,
  LogIn,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  status: string;
  type: 'order' | 'shipping' | 'delivery' | 'review' | 'general';
  timestamp: number;
  link: string;
}

function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function NavigationLinks({
  visibleCategories,
  womenAvailable,
}: {
  visibleCategories: Array<{ id: string; name: string; slug: string }>;
  womenAvailable: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isShop = pathname === '/shop';
  const gender = searchParams?.get('gender')?.toUpperCase();
  const isNewArrival = searchParams?.get('newArrival') === 'true';
  const isBestSeller = searchParams?.get('bestSeller') === 'true';
  const isOffers =
    searchParams?.get('offers') === 'true' || searchParams?.get('hasDiscount') === 'true';

  const isMenActive = isShop && gender === 'MEN';
  const isWomanActive = isShop && gender === 'WOMEN';
  const isNewArrivalActive = isShop && isNewArrival;
  const isBestSellerActive = pathname === '/collections/bestsellers' || (isShop && isBestSeller);
  const isOffersActive = pathname === '/offers' || (isShop && isOffers);
  const isCollectionsActive =
    isShop &&
    !isMenActive &&
    !isWomanActive &&
    !isNewArrivalActive &&
    !isBestSellerActive &&
    !isOffersActive;

  return (
    <nav className="hidden lg:flex items-center gap-7 xl:gap-8 font-sans text-[13.5px] tracking-[0.12em] uppercase font-semibold">
      {/* MEN */}
      <Link
        href="/shop?gender=MEN"
        className={`transition-colors py-2 relative group font-semibold ${
          isMenActive ? 'text-[#073a2d] font-bold' : 'text-[#404945] hover:text-[#073a2d]'
        }`}
      >
        <span>MEN</span>
        <span
          className={`absolute bottom-0 left-0 h-0.5 bg-[#073a2d] transition-all ${
            isMenActive ? 'w-full' : 'w-0 group-hover:w-full'
          }`}
        />
      </Link>

      {/* NEW ARRIVALS */}
      <Link
        href="/collections/new-arrivals"
        className={`transition-colors py-2 relative group font-semibold ${
          isNewArrivalActive ? 'text-[#073a2d] font-bold' : 'text-[#404945] hover:text-[#073a2d]'
        }`}
      >
        <span>NEW ARRIVALS</span>
        <span
          className={`absolute bottom-0 left-0 h-0.5 bg-[#073a2d] transition-all ${
            isNewArrivalActive ? 'w-full' : 'w-0 group-hover:w-full'
          }`}
        />
      </Link>

      {/* COLLECTIONS */}
      <div className="relative group">
        <Link
          href="/shop"
          className={`transition-colors py-2 relative group font-semibold ${
            isCollectionsActive ? 'text-[#073a2d] font-bold' : 'text-[#404945] hover:text-[#073a2d]'
          }`}
        >
          <span>COLLECTIONS</span>
          <span
            className={`absolute bottom-0 left-0 h-0.5 bg-[#073a2d] transition-all ${
              isCollectionsActive ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </Link>
        {visibleCategories.length > 0 && (
          <div className="absolute left-0 top-full hidden min-w-48 border border-[#deddd3] bg-[#fbf9f2] py-2 shadow-lg group-hover:block group-focus-within:block z-50">
            {visibleCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${encodeURIComponent(category.slug)}`}
                className="block px-4 py-2 text-xs tracking-normal text-[#404945] hover:bg-white hover:text-[#073a2d]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* BEST SELLERS */}
      <Link
        href="/collections/bestsellers"
        className={`transition-colors py-2 relative group font-semibold ${
          isBestSellerActive ? 'text-[#073a2d] font-bold' : 'text-[#404945] hover:text-[#073a2d]'
        }`}
      >
        <span>BEST SELLERS</span>
        <span
          className={`absolute bottom-0 left-0 h-0.5 bg-[#073a2d] transition-all ${
            isBestSellerActive ? 'w-full' : 'w-0 group-hover:w-full'
          }`}
        />
      </Link>

      {/* OFFERS */}
      <Link
        href="/offers"
        className={`transition-colors py-2 relative group font-semibold ${
          isOffersActive ? 'text-[#c79a45] font-bold' : 'text-[#404945] hover:text-[#c79a45]'
        }`}
      >
        <span>OFFERS</span>
        <span
          className={`absolute bottom-0 left-0 h-0.5 bg-[#c79a45] transition-all ${
            isOffersActive ? 'w-full' : 'w-0 group-hover:w-full'
          }`}
        />
      </Link>

      {/* WOMAN */}
      {womenAvailable ? (
        <Link
          href="/shop?gender=WOMEN"
          className={`transition-colors py-2 relative group font-semibold ${
            isWomanActive ? 'text-[#073a2d] font-bold' : 'text-[#404945] hover:text-[#073a2d]'
          }`}
        >
          <span>WOMAN</span>
          <span
            className={`absolute bottom-0 left-0 h-0.5 bg-[#073a2d] transition-all ${
              isWomanActive ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </Link>
      ) : (
        <div className="relative flex items-center font-semibold">
          <span className="text-[#404945]/60 cursor-not-allowed">WOMAN</span>
          <span className="ml-1.5 bg-[#eae8e1] text-[#073a2d] text-[9.5px] px-1.5 py-0.5 font-semibold uppercase tracking-wider rounded-xs">
            Soon
          </span>
        </div>
      )}
    </nav>
  );
}

function NavigationFallback({
  visibleCategories,
  womenAvailable,
}: {
  visibleCategories: Array<{ id: string; name: string; slug: string }>;
  womenAvailable: boolean;
}) {
  return (
    <nav className="hidden lg:flex items-center gap-7 xl:gap-8 font-sans text-[13.5px] tracking-[0.12em] uppercase font-semibold text-[#404945]">
      <Link href="/shop?gender=MEN" className="hover:text-[#073a2d] transition-colors py-2 relative group font-semibold">
        <span>MEN</span>
      </Link>
      <Link href="/shop?newArrival=true" className="hover:text-[#073a2d] transition-colors py-2 relative group font-semibold">
        <span>NEW ARRIVALS</span>
      </Link>
      <div className="relative group">
        <Link href="/shop" className="hover:text-[#073a2d] transition-colors py-2 relative group font-semibold">
          <span>COLLECTIONS</span>
        </Link>
        {visibleCategories.length > 0 && (
          <div className="absolute left-0 top-full hidden min-w-48 border border-[#deddd3] bg-[#fbf9f2] py-2 shadow-lg group-hover:block group-focus-within:block z-50">
            {visibleCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${encodeURIComponent(category.slug)}`}
                className="block px-4 py-2 text-xs tracking-normal text-[#404945] hover:bg-white hover:text-[#073a2d]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Link href="/shop?bestSeller=true" className="hover:text-[#073a2d] transition-colors py-2 relative group font-semibold">
        <span>BEST SELLERS</span>
      </Link>
      <Link href="/shop?offers=true" className="hover:text-[#073a2d] transition-colors py-2 relative group font-semibold">
        <span>OFFERS</span>
      </Link>
      {womenAvailable ? (
        <Link href="/shop?gender=WOMEN" className="hover:text-[#073a2d] transition-colors py-2 font-semibold">
          WOMAN
        </Link>
      ) : (
        <div className="relative flex items-center font-semibold">
          <span className="text-[#404945]/60 cursor-not-allowed">WOMAN</span>
          <span className="ml-1.5 bg-[#eae8e1] text-[#073a2d] text-[9.5px] px-1.5 py-0.5 font-semibold uppercase tracking-wider rounded-xs">
            Soon
          </span>
        </div>
      )}
    </nav>
  );
}

function MobileNavLinks({
  visibleCategories,
  womenAvailable,
  onClose,
}: {
  visibleCategories: Array<{ id: string; name: string; slug: string }>;
  womenAvailable: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isShop = pathname === '/shop';
  const gender = searchParams?.get('gender')?.toUpperCase();
  const isNewArrival = searchParams?.get('newArrival') === 'true';
  const isBestSeller = searchParams?.get('bestSeller') === 'true';
  const isOffers =
    searchParams?.get('offers') === 'true' || searchParams?.get('hasDiscount') === 'true';

  const isMenActive = isShop && gender === 'MEN';
  const isWomanActive = isShop && gender === 'WOMEN';
  const isNewArrivalActive = isShop && isNewArrival;
  const isBestSellerActive = pathname === '/collections/bestsellers' || (isShop && isBestSeller);
  const isOffersActive = pathname === '/offers' || (isShop && isOffers);
  const isCollectionsActive =
    isShop &&
    !isMenActive &&
    !isWomanActive &&
    !isNewArrivalActive &&
    !isBestSellerActive &&
    !isOffersActive;

  return (
    <>
      <Link
        href="/shop?gender=MEN"
        onClick={onClose}
        className={`flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold transition-colors ${
          isMenActive ? 'text-[#073a2d] font-bold pl-2 border-l-2 border-l-[#073a2d] bg-[#eae8e1]/40' : 'text-[#404945]'
        }`}
      >
        <span>MEN</span>
        <ArrowRight className={`w-4 h-4 ${isMenActive ? 'text-[#073a2d]' : 'text-[#c79a45]'}`} />
      </Link>
      <Link
        href="/shop?newArrival=true"
        onClick={onClose}
        className={`flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold transition-colors ${
          isNewArrivalActive ? 'text-[#073a2d] font-bold pl-2 border-l-2 border-l-[#073a2d] bg-[#eae8e1]/40' : 'text-[#404945]'
        }`}
      >
        <span>NEW ARRIVALS</span>
        <ArrowRight className={`w-4 h-4 ${isNewArrivalActive ? 'text-[#073a2d]' : 'text-[#c79a45]'}`} />
      </Link>
      <Link
        href="/shop"
        onClick={onClose}
        className={`flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold transition-colors ${
          isCollectionsActive ? 'text-[#073a2d] font-bold pl-2 border-l-2 border-l-[#073a2d] bg-[#eae8e1]/40' : 'text-[#404945]'
        }`}
      >
        <span>COLLECTIONS</span>
        <ArrowRight className={`w-4 h-4 ${isCollectionsActive ? 'text-[#073a2d]' : 'text-[#c79a45]'}`} />
      </Link>
      {visibleCategories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${encodeURIComponent(category.slug)}`}
          onClick={onClose}
          className="flex items-center justify-between py-2 pl-4 border-b border-[#f0eee7] text-sm font-medium text-[#404945] hover:text-[#073a2d]"
        >
          <span>{category.name}</span>
          <ArrowRight className="w-4 h-4 text-[#c79a45]" />
        </Link>
      ))}
      <Link
        href="/shop?bestSeller=true"
        onClick={onClose}
        className={`flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold transition-colors ${
          isBestSellerActive ? 'text-[#073a2d] font-bold pl-2 border-l-2 border-l-[#073a2d] bg-[#eae8e1]/40' : 'text-[#404945]'
        }`}
      >
        <span>BEST SELLERS</span>
        <ArrowRight className={`w-4 h-4 ${isBestSellerActive ? 'text-[#073a2d]' : 'text-[#c79a45]'}`} />
      </Link>
      <Link
        href="/offers"
        onClick={onClose}
        className={`flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold transition-colors ${
          isOffersActive ? 'text-[#c79a45] font-bold pl-2 border-l-2 border-l-[#c79a45] bg-[#eae8e1]/40' : 'text-[#404945] hover:text-[#c79a45]'
        }`}
      >
        <span>OFFERS</span>
        <ArrowRight className={`w-4 h-4 ${isOffersActive ? 'text-[#c79a45]' : 'text-[#c79a45]'}`} />
      </Link>
      {womenAvailable ? (
        <Link
          href="/shop?gender=WOMEN"
          onClick={onClose}
          className={`flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold transition-colors ${
            isWomanActive ? 'text-[#073a2d] font-bold pl-2 border-l-2 border-l-[#073a2d] bg-[#eae8e1]/40' : 'text-[#404945]'
          }`}
        >
          <span>WOMAN</span>
          <ArrowRight className={`w-4 h-4 ${isWomanActive ? 'text-[#073a2d]' : 'text-[#c79a45]'}`} />
        </Link>
      ) : (
        <div className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold">
          <span className="text-[#404945]/60 font-semibold">WOMAN</span>
          <span className="bg-[#eae8e1] text-[#073a2d] text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wider rounded-xs">
            Soon
          </span>
        </div>
      )}
    </>
  );
}

export const Header: React.FC = () => {
  const { totalCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user, isLoggedIn, logout } = useAuth();
  const { settings, categories, womenAvailable } = useStorefront();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('rongin_customer_read_notification_ids') : null;
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [readTimestamp, setReadTimestamp] = useState<number | null>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('rongin_customer_notifications_read_at') : null;
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const visibleCategories = categories.filter((category) => (category._count?.products ?? 1) > 0);
  const whatsappUrl = getWhatsAppUrl(settings?.whatsapp || '');
  const freeShippingMessage =
    settings?.freeShippingEnabled && Number.isFinite(Number(settings.freeDeliveryThreshold))
      ? `FREE DELIVERY ON ORDERS OVER ৳${Number(settings.freeDeliveryThreshold).toLocaleString()}`
      : '';
  const promotionMessage =
    settings?.promoEnabled && settings.promoCode.trim()
      ? `CODE: ${settings.promoCode.trim()}${settings.promoDiscountText.trim() ? ` (${settings.promoDiscountText.trim()})` : ''}`
      : '';
  const showWhatsAppAnnouncement =
    settings?.whatsappOrderEnabled && Boolean(whatsappUrl);

  // Fetch notifications for logged-in user
  useEffect(() => {
    if (!isLoggedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications([]);
      return;
    }

    let active = true;

    async function loadNotifications() {
      try {
        const [ordersRes, reviewsRes] = await Promise.allSettled([
          apiRequest<{
            items: Array<{
              orderNumber: string;
              status: string;
              createdAt: string;
              courierName?: string | null;
            }>;
          }>('/orders/my-orders?limit=10'),
          apiRequest<
            Array<{
              id: string;
              productName: string;
              status: string;
              createdAt: string;
              adminFeedback?: string | null;
              adminFeedbackAt?: string | null;
            }>
          >('/reviews/mine'),
        ]);

        if (!active) return;

        const notifs: CustomerNotification[] = [];

        if (ordersRes.status === 'fulfilled' && ordersRes.value?.items) {
          for (const order of ordersRes.value.items) {
            const time = new Date(order.createdAt).getTime();
            if (['CONFIRMED', 'PROCESSING'].includes(order.status)) {
              notifs.push({
                id: `order-${order.orderNumber}-${order.status}`,
                title: `Order ${order.orderNumber} ${order.status === 'CONFIRMED' ? 'Confirmed' : 'in Tailoring'}`,
                message: `Your bespoke commission is ${order.status.toLowerCase()} and being prepared in the atelier.`,
                status: order.status,
                type: 'order',
                timestamp: time,
                link: '/orders',
              });
            } else if (['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status)) {
              notifs.push({
                id: `order-${order.orderNumber}-${order.status}`,
                title:
                  order.status === 'OUT_FOR_DELIVERY'
                    ? `Out for Delivery: ${order.orderNumber}`
                    : `Dispatched: ${order.orderNumber}`,
                message:
                  order.status === 'OUT_FOR_DELIVERY'
                    ? 'Your parcel is scheduled for doorstep delivery today!'
                    : `Consignment dispatched with ${order.courierName || 'premium courier'}.`,
                status: order.status,
                type: 'shipping',
                timestamp: time,
                link: '/orders',
              });
            } else if (order.status === 'DELIVERED') {
              notifs.push({
                id: `order-${order.orderNumber}-DELIVERED`,
                title: `Delivered: ${order.orderNumber}`,
                message: 'Your parcel has arrived. Review your garments to share your feedback.',
                status: 'DELIVERED',
                type: 'delivery',
                timestamp: time,
                link: `/profile?tab=reviews&orderNumber=${encodeURIComponent(order.orderNumber)}`,
              });
            } else if (order.status === 'PENDING') {
              notifs.push({
                id: `order-${order.orderNumber}-PENDING`,
                title: `Order ${order.orderNumber} Placed`,
                message: 'Awaiting atelier review & confirmation.',
                status: 'PENDING',
                type: 'order',
                timestamp: time,
                link: '/orders',
              });
            }
          }
        }

        if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value)) {
          for (const rev of reviewsRes.value) {
            if (rev.status === 'PENDING') {
              notifs.push({
                id: `review-${rev.id}-PENDING`,
                title: 'Review Under Moderation',
                message: `Your review for ${rev.productName} is being verified.`,
                status: 'PENDING',
                type: 'review',
                timestamp: new Date(rev.createdAt).getTime(),
                link: '/profile?tab=reviews',
              });
            }
            if (rev.adminFeedback && rev.adminFeedbackAt) {
              notifs.push({
                id: `review-${rev.id}-ADMIN_FEEDBACK-${rev.adminFeedbackAt}`,
                title: `Atelier replied to your review for ${rev.productName}`,
                message: rev.adminFeedback,
                status: 'REPLIED',
                type: 'review',
                timestamp: new Date(rev.adminFeedbackAt).getTime(),
                link: '/profile?tab=reviews',
              });
            }
          }
        }

        // Sort latest first
        notifs.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(notifs);
      } catch (err) {
        console.error('Error loading patron notifications', err);
      }
    }

    loadNotifications();
    const refreshInterval = window.setInterval(loadNotifications, 60_000);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, [isLoggedIn, user?.id]);

  const isNotificationUnread = (notif: CustomerNotification) => {
    if (readIds.includes(notif.id)) return false;
    if (readTimestamp !== null && notif.timestamp <= readTimestamp) return false;
    return true;
  };

  const unreadCount = notifications.filter(isNotificationUnread).length;

  const handleNotificationClick = (notif: CustomerNotification) => {
    setIsUserMenuOpen(false);
    if (!isNotificationUnread(notif)) return;

    setReadIds((prev) => {
      if (prev.includes(notif.id)) return prev;
      const updated = [notif.id, ...prev].slice(0, 200);
      try {
        localStorage.setItem('rongin_customer_read_notification_ids', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    setReadTimestamp(now);
    const allIds = Array.from(new Set([...readIds, ...notifications.map((n) => n.id)])).slice(0, 200);
    setReadIds(allIds);
    try {
      localStorage.setItem('rongin_customer_notifications_read_at', String(now));
      localStorage.setItem('rongin_customer_read_notification_ids', JSON.stringify(allIds));
    } catch {
      // ignore
    }
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#fbf9f2]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all">
        {/* Top Announcement Bar */}
        <div className="bg-[#073a2d] text-[#ffffff] py-1.5 text-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between font-sans text-[10.5px] tracking-[0.16em] uppercase">
            <span className="hidden md:inline-flex items-center gap-2 text-[#76a493]">
              <Sparkles className="w-3 h-3 text-[#c79a45]" />
              Haute Couture & Bespoke Menswear
            </span>
            <div className="flex-1 text-center truncate">
              {freeShippingMessage && (
                <span className="font-semibold text-[#c79a45]">{freeShippingMessage}</span>
              )}
              {promotionMessage && (
                <>
                  {freeShippingMessage && <span className="mx-2 text-[#76a493] hidden sm:inline">|</span>}
                  <span className="text-[#c79a45] font-semibold hidden sm:inline">{promotionMessage}</span>
                </>
              )}
              {showWhatsAppAnnouncement && (
                <>
                  {(freeShippingMessage || promotionMessage) && (
                    <span className="mx-2 text-[#76a493] hidden md:inline">|</span>
                  )}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#c79a45] transition-colors hidden md:inline font-bold"
                  >
                    WHATSAPP ORDER: {settings?.whatsapp}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="lg:hidden text-[#1b1c18] hover:text-[#073a2d] p-1.5 focus:outline-none cursor-pointer"
            >
              <Menu className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
            </button>
            <Logo className="h-8 sm:h-10 w-auto" />
          </div>

          {/* Desktop Navigation Links with Active State Highlighting */}
          <Suspense
            fallback={
              <NavigationFallback
                visibleCategories={visibleCategories}
                womenAvailable={womenAvailable}
              />
            }
          >
            <NavigationLinks
              visibleCategories={visibleCategories}
              womenAvailable={womenAvailable}
            />
          </Suspense>

          {/* Right Action Icons: Wishlist, Cart, and Luxury User Sanctuary Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Wishlist & Cart Container */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* 1. Wishlist Icon Button */}
              <Link
                href="/shop?wishlist=true"
                className="hidden sm:flex relative w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-[#fbf9f2] border border-[#deddd3] hover:border-[#c79a45] transition-all duration-300 shadow-xs hover:shadow-md items-center justify-center text-[#1b1c18] hover:text-[#073a2d] group cursor-pointer"
                aria-label="Wishlist"
                title="Saved Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#c79a45] via-[#dfb76c] to-[#c79a45] text-[#073a2d] text-[9px] sm:text-[10px] font-sans font-black min-w-4.5 sm:min-w-5 h-4.5 sm:h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {wishlist.length}
                </span>
              </Link>

              {/* 2. Shopping Cart Trigger Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-[#fbf9f2] border border-[#deddd3] hover:border-[#c79a45] transition-all duration-300 shadow-xs hover:shadow-md flex items-center justify-center text-[#1b1c18] hover:text-[#073a2d] cursor-pointer group"
                aria-label="Shopping Cart"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#c79a45] via-[#dfb76c] to-[#c79a45] text-[#073a2d] text-[9px] sm:text-[10px] font-sans font-black min-w-4.5 sm:min-w-5 h-4.5 sm:h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCount}
                </span>
              </button>
            </div>

            {/* 3. Luxury Patron User Button with Dropdown & Notifications */}
            <div className="relative" ref={userMenuRef}>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="inline-flex items-center justify-center gap-2 w-8.5 h-8.5 sm:w-auto p-0 sm:px-4.5 sm:py-2.5 bg-[#073a2d] hover:bg-[#0c4e3b] text-[#fbf9f2] rounded-full sm:rounded-md border-0 transition-colors duration-300 group cursor-pointer relative shrink-0"
                  aria-label="Patron Sanctuary Menu"
                  aria-expanded={isUserMenuOpen}
                  title={`Patron Sanctuary: ${user?.name}`}
                >
                  <div className="relative flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#c79a45] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="hidden sm:inline font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#fbf9f2] group-hover:text-white transition-colors">
                    {user?.name?.split(' ')[0] || 'Patron'}
                  </span>
                  {unreadCount > 0 && (
                    <span
                      key={unreadCount}
                      className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-[#ba1a1a] text-white text-[9px] sm:text-[10px] font-bold min-w-4.5 sm:min-w-5 h-4.5 sm:h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4.5 py-1.5 sm:py-2.5 bg-[#073a2d] hover:bg-[#0c4e3b] text-[#fbf9f2] rounded-md border-0 transition-colors duration-300 group cursor-pointer shrink-0 shadow-xs"
                  aria-label="Sign In to Patron Sanctuary"
                  title="Sign In to Patron Sanctuary"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c79a45] transition-transform duration-300 group-hover:translate-x-0.5" />
                  <span className="font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#fbf9f2] group-hover:text-white transition-colors">
                    Login
                  </span>
                </Link>
              )}

              {/* Patron Menu & Notifications Dropdown */}
              {isLoggedIn && isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 bg-white border border-[#deddd3] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Patron Profile Header */}
                  <div className="bg-[#073a2d] text-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#c79a45]/20 border border-[#c79a45]/40 flex items-center justify-center text-[#c79a45] font-serif font-bold text-base">
                          {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-bold text-sm text-[#fbf9f2] leading-tight truncate">
                            {user?.name || 'Patron'}
                          </p>
                          <p className="text-[11px] text-[#c79a45] tracking-wider uppercase font-semibold">
                            {user?.membershipId || user?.tier || 'Member'}
                          </p>
                          <p className="text-[10px] text-[#a4b5ad] truncate max-w-[170px]">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="text-[11px] uppercase tracking-wider text-[#dfb76c] hover:text-white underline underline-offset-2 transition-colors font-semibold shrink-0"
                      >
                        Profile →
                      </Link>
                    </div>
                  </div>

                  {/* Notifications Section Header */}
                  <div className="px-4 py-2.5 bg-[#fbf9f2] border-b border-[#deddd3] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-[#073a2d]" />
                      <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#073a2d]">
                        Notifications
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          unreadCount > 0
                            ? 'bg-[#ba1a1a] text-white'
                            : 'bg-[#deddd3] text-[#555e5a]'
                        }`}
                      >
                        {unreadCount}
                      </span>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                        className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${
                          unreadCount === 0
                            ? 'text-[#a1a8a4] cursor-default'
                            : 'text-[#c79a45] hover:text-[#073a2d] cursor-pointer font-semibold'
                        }`}
                        title="Mark all notifications as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>

                  {/* Notifications Feed */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#f0eee7]">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => {
                        const isUnread = isNotificationUnread(notif);
                        return (
                          <Link
                            key={notif.id}
                            href={notif.link}
                            onClick={() => handleNotificationClick(notif)}
                            className={`block p-3.5 hover:bg-[#fbf9f2] transition-colors relative ${
                              isUnread ? 'bg-[#fcfaf4]' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 p-1.5 rounded-full shrink-0 ${
                                  notif.type === 'shipping' ||
                                  notif.type === 'delivery'
                                    ? 'bg-amber-50 text-[#c79a45]'
                                    : notif.type === 'review'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-emerald-50 text-[#073a2d]'
                                }`}
                              >
                                {notif.type === 'shipping' ? (
                                  <Truck className="w-3.5 h-3.5" />
                                ) : notif.type === 'review' ? (
                                  <Star className="w-3.5 h-3.5" />
                                ) : (
                                  <Package className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <p
                                    className={`text-xs font-semibold truncate ${
                                      isUnread
                                        ? 'text-[#073a2d] font-bold'
                                        : 'text-[#404945]'
                                    }`}
                                  >
                                    {notif.title}
                                  </p>
                                  <span className="text-[10px] text-[#717975] whitespace-nowrap">
                                    {formatRelativeTime(notif.timestamp)}
                                  </span>
                                </div>
                                <p className="text-[11.5px] text-[#555e5a] line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>
                                {notif.status && (
                                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#f0eee7] text-[#073a2d]">
                                    {notif.status}
                                  </span>
                                )}
                              </div>
                              {isUnread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] mt-1.5 shrink-0" />
                              )}
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-[#717975]">
                        <Bell className="w-8 h-8 text-[#deddd3] mx-auto mb-2" />
                        <p className="text-xs font-medium text-[#404945]">
                          No notifications
                        </p>
                        <p className="text-[11px] text-[#717975] mt-0.5">
                          Consignment updates & atelier alerts will appear here.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Patron Links & Logout */}
                  <div className="p-2 bg-[#fbf9f2] border-t border-[#deddd3] space-y-1">
                    <Link
                      href="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#404945] hover:text-[#073a2d] hover:bg-white rounded transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-[#073a2d]" />
                        <span>My Orders </span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#c79a45]" />
                    </Link>
                    <Link
                      href="/shop?wishlist=true"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#404945] hover:text-[#073a2d] hover:bg-white rounded transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-[#073a2d]" />
                        <span>Saved Wishlist ({wishlist.length})</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#c79a45]" />
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#404945] hover:text-[#073a2d] hover:bg-white rounded transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#073a2d]" />
                        <span>My Profile</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#c79a45]" />
                    </Link>
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={async () => {
                        if (isLoggingOut) return;
                        setIsLoggingOut(true);
                        try {
                          await logout();
                          setIsUserMenuOpen(false);
                          toast.info('You have signed out.');
                        } finally {
                          setIsLoggingOut(false);
                        }
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-white rounded transition-colors cursor-pointer text-left disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        {isLoggingOut ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ba1a1a]" />
                        ) : (
                          <LogOut className="w-3.5 h-3.5 text-[#ba1a1a]" />
                        )}
                        <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex h-dvh max-h-dvh w-4/5 max-w-sm flex-col overflow-hidden border-r border-[#deddd3] bg-[#fbf9f2] p-6 z-10 shadow-2xl">
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between pb-6 border-b border-[#deddd3]">
                <Logo className="h-9 w-auto" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#717975] hover:text-[#1b1c18]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 font-serif text-lg font-bold text-[#073a2d]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-left w-full cursor-pointer font-bold"
                >
                  <span className="flex items-center gap-2.5 font-sans text-sm font-bold uppercase tracking-wider">
                    <ShoppingCart className="w-4 h-4 text-[#073a2d]" />
                    <span>Shopping Cart</span>
                  </span>
                  <Badge variant="outline" className="text-xs bg-[#f5f4ed] text-[#073a2d] rounded-full px-2.5 py-0.5 border-[#deddd3] font-bold">
                    {totalCount} items
                  </Badge>
                </button>
                <Link
                  href="/shop?wishlist=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-left w-full cursor-pointer font-bold"
                >
                  <span className="flex items-center gap-2.5 font-sans text-sm font-bold uppercase tracking-wider">
                    <Heart className="w-4 h-4 text-[#073a2d]" />
                    <span>Saved Wishlist</span>
                  </span>
                  <Badge variant="outline" className="text-xs bg-[#f5f4ed] text-[#073a2d] rounded-full px-2.5 py-0.5 border-[#deddd3] font-bold">
                    {wishlist.length} saved
                  </Badge>
                </Link>
                {isLoggedIn && (
                  <>
                    <Link
                      href="/track-order"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between border-b border-[#f0eee7] py-2 text-sm font-sans font-bold uppercase tracking-wider text-[#073a2d]"
                    >
                      <span className="flex items-center gap-2 font-bold">
                        <Truck className="h-4 w-4 text-[#c79a45]" />
                        <span>Track Consignment</span>
                      </span>
                      <Badge className="bg-[#073a2d] text-[10px] font-bold text-white">Active</Badge>
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between border-b border-[#f0eee7] py-2 text-sm font-sans font-bold uppercase tracking-wider text-[#073a2d]"
                    >
                      <span className="flex items-center gap-2 font-bold">
                        <Clock className="h-4 w-4 text-[#717975]" />
                        <span>Order History</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#c79a45]" />
                    </Link>
                  </>
                )}

                {/* Dynamic Mobile Nav Links */}
                <Suspense
                  fallback={
                    <>
                      <Link
                        href="/shop?gender=MEN"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold"
                      >
                        <span className="font-semibold">MEN</span>
                        <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                      </Link>
                      <Link
                        href="/shop?newArrival=true"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold"
                      >
                        <span className="font-semibold">NEW ARRIVALS</span>
                        <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                      </Link>
                      <Link
                        href="/shop"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold"
                      >
                        <span className="font-semibold">COLLECTIONS</span>
                        <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                      </Link>
                      <Link
                        href="/shop?bestSeller=true"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold"
                      >
                        <span className="font-semibold">BEST SELLERS</span>
                        <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                      </Link>
                      <Link
                        href="/offers"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold"
                      >
                        <span className="font-semibold">OFFERS</span>
                        <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                      </Link>
                    </>
                  }
                >
                  <MobileNavLinks
                    visibleCategories={visibleCategories}
                    womenAvailable={womenAvailable}
                    onClose={() => setMobileMenuOpen(false)}
                  />
                </Suspense>
              </nav>
            </div>

            <div className="shrink-0 space-y-3 border-t border-[#deddd3] pt-4">
              {settings?.whatsappOrderEnabled && whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#073a2d] text-[#fbf9f2] text-xs font-sans uppercase tracking-widest font-bold hover:bg-[#0d4d3b] transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-[#c79a45]" />
                  <span>WhatsApp Atelier ({settings.whatsapp})</span>
                </a>
              )}
              <p className="text-[11px] text-center text-[#69726d] font-sans">
                Complimentary sizing advice & custom orders
              </p>
              <Link
                href={isLoggedIn ? "/profile" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between border-t border-[#deddd3] pt-3 text-sm font-sans font-bold uppercase tracking-wider text-[#073a2d]"
              >
                <span className="flex items-center gap-2">
                  {isLoggedIn ? (
                    <User className="h-4 w-4 text-[#717975]" />
                  ) : (
                    <LogIn className="h-4 w-4 text-[#c79a45]" />
                  )}
                  <span>{isLoggedIn ? (user?.name || 'Patron Profile') : 'Sign In / Join Atelier'}</span>
                </span>
                <span className="flex items-center gap-2">
                  {isLoggedIn && unreadCount > 0 && (
                    <span className="rounded-full bg-[#ba1a1a] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-[#c79a45]" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
