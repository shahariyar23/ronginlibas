'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '@/lib/api';

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  status: string;
  type: 'order' | 'shipping' | 'delivery' | 'review' | 'general';
  timestamp: number;
  link: string;
}

interface NotificationContextType {
  notifications: CustomerNotification[];
  unreadCount: number;
  isNotificationUnread: (notif: CustomerNotification) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isNotificationUnread: () => false,
  markAsRead: () => {},
  markAllAsRead: () => {},
  refreshNotifications: async () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [readTimestamp, setReadTimestamp] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedIds = localStorage.getItem('rongin_customer_read_notification_ids');
      if (savedIds) setReadIds(JSON.parse(savedIds));
    } catch {
      // ignore
    }
    try {
      const savedTs = localStorage.getItem('rongin_customer_notifications_read_at');
      if (savedTs) setReadTimestamp(Number(savedTs));
    } catch {
      // ignore
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

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

      notifs.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(notifs);
    } catch (err) {
      console.error('Error loading patron notifications', err);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    let active = true;
    if (isLoggedIn) {
      loadNotifications();
      const interval = window.setInterval(() => {
        if (active) loadNotifications();
      }, 60_000);
      return () => {
        active = false;
        window.clearInterval(interval);
      };
    } else {
      setNotifications([]);
    }
  }, [isLoggedIn, user?.id, loadNotifications]);

  const isNotificationUnread = useCallback(
    (notif: CustomerNotification) => {
      if (readIds.includes(notif.id)) return false;
      if (readTimestamp !== null && notif.timestamp <= readTimestamp) return false;
      return true;
    },
    [readIds, readTimestamp],
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [id, ...prev].slice(0, 200);
      try {
        localStorage.setItem('rongin_customer_read_notification_ids', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const now = Date.now();
    setReadTimestamp(now);
    setReadIds((prev) => {
      const allIds = Array.from(new Set([...prev, ...notifications.map((n) => n.id)])).slice(0, 200);
      try {
        localStorage.setItem('rongin_customer_read_notification_ids', JSON.stringify(allIds));
        localStorage.setItem('rongin_customer_notifications_read_at', String(now));
      } catch {
        // ignore
      }
      return allIds;
    });
  }, [notifications]);

  const unreadCount = notifications.filter(isNotificationUnread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isNotificationUnread,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
