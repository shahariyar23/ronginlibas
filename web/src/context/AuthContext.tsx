'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiRequest, getAccessToken, setAccessToken } from '@/lib/api';

export interface PatronUser {
  id: string;
  membershipId: string;
  name: string;
  email: string;
  phone: string;
  tier: 'Heritage Atelier Tier' | 'Royal Bespoke Patron' | 'Member';
  memberSince: string;
  address: {
    id?: string;
    line1: string;
    division: string;
    city: string;
    postalCode: string;
  };
  tailoringProfile: {
    height: string;
    chest: string;
    shoulder: string;
    preferredPanjabiLength: string;
    preferredFit: string;
    preferredCollar: string;
  };
}

interface CustomerProfile {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone: string;
  preferredSize?: string | null;
  preferredFit?: string | null;
  createdAt: string;
  addresses?: Array<{
    id: string;
    addressLine1: string;
    division: string;
    city: string;
    postalCode?: string | null;
    isDefault: boolean;
  }>;
  measurements?: {
    chest?: number | string | null;
    shoulder?: number | string | null;
    sleeveLength?: number | string | null;
    collar?: number | string | null;
    waist?: number | string | null;
    trouserLength?: number | string | null;
    garmentLength?: number | string | null;
  } | Array<{
    chest?: number | string | null;
    shoulder?: number | string | null;
    sleeveLength?: number | string | null;
    collar?: number | string | null;
    waist?: number | string | null;
    trouserLength?: number | string | null;
    garmentLength?: number | string | null;
  }> | null;
}

interface AuthContextType {
  user: PatronUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: Partial<PatronUser>, password?: string, termsAccepted?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<PatronUser>) => Promise<boolean>;
  changePassword: (oldPw: string, newPw: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function formatMeasurement(value: number | string | null | undefined) {
  return value == null ? '' : String(value);
}

function mapCustomer(customer: CustomerProfile): PatronUser {
  const address = customer.addresses?.find((item) => item.isDefault) ?? customer.addresses?.[0];
  const measurement = Array.isArray(customer.measurements)
    ? customer.measurements[0]
    : customer.measurements;
  const createdAt = new Date(customer.createdAt);
  return {
    id: customer.id,
    membershipId: `RL-${customer.id.slice(0, 8).toUpperCase()}`,
    name: [customer.firstName, customer.lastName].filter(Boolean).join(' '),
    email: customer.email,
    phone: customer.phone,
    tier: 'Member',
    memberSince: Number.isNaN(createdAt.valueOf())
      ? ''
      : createdAt.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    address: {
      id: address?.id,
      line1: address?.addressLine1 ?? '',
      division: address?.division ?? '',
      city: address?.city ?? '',
      postalCode: address?.postalCode ?? '',
    },
    tailoringProfile: {
      height: '',
      chest: formatMeasurement(measurement?.chest),
      shoulder: formatMeasurement(measurement?.shoulder),
      preferredPanjabiLength: formatMeasurement(measurement?.garmentLength),
      preferredFit: customer.preferredFit ?? '',
      preferredCollar: formatMeasurement(measurement?.collar),
    },
  };
}

async function loadCustomerProfile() {
  const data = await apiRequest<CustomerProfile>('/customers/me');
  return mapCustomer(data);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PatronUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        const session = await apiRequest<{ accessToken: string }>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({}),
        });
        setAccessToken(session.accessToken);
        const profile = await loadCustomerProfile();
        if (active) setUser(profile);
      } catch (error) {
        setAccessToken(null);
        if (active && error instanceof Error && 'status' in error && error.status === 0) {
          toast.error(error.message);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password = '') => {
    try {
      const session = await apiRequest<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(session.accessToken);
      setUser(await loadCustomerProfile());
      toast.success('Welcome back to the Patron Sanctuary');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign in failed.');
      return false;
    }
  };

  const register = async (data: Partial<PatronUser>, password = '', termsAccepted = false) => {
    try {
      const [firstName, ...lastNameParts] = (data.name ?? '').trim().split(/\s+/);
      const session = await apiRequest<{ accessToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName: lastNameParts.join(' ') || undefined,
          email: data.email,
          phone: data.phone?.replace(/\s/g, ''),
          password,
          confirmPassword: password,
          preferredFit: data.tailoringProfile?.preferredFit,
          termsAccepted,
        }),
      });
      setAccessToken(session.accessToken);
      setUser(await loadCustomerProfile());
      toast.success('Your Rongin Libas account is ready.');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Account registration failed.');
      return false;
    }
  };

  const logout = async () => {
    try {
      if (getAccessToken()) {
        await apiRequest('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not revoke the server session.');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<PatronUser>) => {
    if (!user) return false;
    try {
      let savedAddressId = user.address.id;
      const [firstName, ...lastNameParts] = (data.name ?? user.name).trim().split(/\s+/);
      await apiRequest('/customers/me', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName,
          lastName: lastNameParts.join(' '),
          email: data.email ?? user.email,
          phone: (data.phone ?? user.phone).replace(/\s/g, ''),
          preferredFit: data.tailoringProfile?.preferredFit,
        }),
      });

      if (data.address) {
        const addressPayload = {
          fullName: data.name ?? user.name,
          email: data.email ?? user.email,
          phone: (data.phone ?? user.phone).replace(/\s/g, ''),
          addressLine1: data.address.line1,
          city: data.address.city,
          division: data.address.division,
          postalCode: data.address.postalCode || undefined,
        };
        const updatedAddress = user.address.id
          ? await apiRequest(`/customers/me/addresses/${user.address.id}`, {
              method: 'PATCH',
              body: JSON.stringify(addressPayload),
            })
          : await apiRequest('/customers/me/addresses', {
              method: 'POST',
              body: JSON.stringify({ ...addressPayload, isDefault: true }),
            });
        savedAddressId =
          updatedAddress && typeof updatedAddress === 'object' && 'id' in updatedAddress
            ? String(updatedAddress.id)
            : savedAddressId;
      }

      if (data.tailoringProfile) {
        const numeric = (value: string | undefined) => {
          if (!value) return undefined;
          const parsed = Number.parseFloat(value);
          return Number.isFinite(parsed) ? parsed : undefined;
        };
        const chest = numeric(data.tailoringProfile.chest);
        const shoulder = numeric(data.tailoringProfile.shoulder);
        const garmentLength = numeric(data.tailoringProfile.preferredPanjabiLength);
        const collar = numeric(data.tailoringProfile.preferredCollar);
        await apiRequest('/customers/me/measurements', {
          method: 'PUT',
          body: JSON.stringify({
            ...(chest !== undefined ? { chest } : {}),
            ...(shoulder !== undefined ? { shoulder } : {}),
            ...(garmentLength !== undefined ? { garmentLength } : {}),
            ...(collar !== undefined ? { collar } : {}),
          }),
        });
      }

      setUser({
        ...user,
        ...data,
        name: data.name ?? user.name,
        email: data.email ?? user.email,
        phone: data.phone ?? user.phone,
        address: {
          ...user.address,
          ...data.address,
          id: savedAddressId,
          line1: data.address?.line1 ?? user.address.line1,
          division: data.address?.division ?? user.address.division,
          city: data.address?.city ?? user.address.city,
          postalCode: data.address?.postalCode ?? user.address.postalCode,
        },
        tailoringProfile: {
          ...user.tailoringProfile,
          ...data.tailoringProfile,
          height: data.tailoringProfile?.height ?? user.tailoringProfile.height,
          chest: data.tailoringProfile?.chest ?? user.tailoringProfile.chest,
          shoulder: data.tailoringProfile?.shoulder ?? user.tailoringProfile.shoulder,
          preferredPanjabiLength:
            data.tailoringProfile?.preferredPanjabiLength ??
            user.tailoringProfile.preferredPanjabiLength,
          preferredFit: data.tailoringProfile?.preferredFit ?? user.tailoringProfile.preferredFit,
          preferredCollar:
            data.tailoringProfile?.preferredCollar ?? user.tailoringProfile.preferredCollar,
        },
      });
      toast.success('Your account details have been saved.');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update your profile.');
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
      });
      setAccessToken(null);
      setUser(null);
      toast.success('Password updated. Please sign in again.');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not change your password.');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
