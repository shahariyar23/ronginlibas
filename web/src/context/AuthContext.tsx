'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface PatronUser {
  id: string;
  membershipId: string;
  name: string;
  email: string;
  phone: string;
  tier: 'Heritage Atelier Tier' | 'Royal Bespoke Patron' | 'Member';
  memberSince: string;
  address: {
    line1: string;
    division: string;
    city: string;
    postalCode: string;
  };
  tailoringProfile: {
    height: string;
    chest: string;
    preferredPanjabiLength: string;
    preferredFit: string;
    preferredCollar: string;
  };
}

const defaultPatron: PatronUser = {
  id: 'usr_mahfuz_01',
  membershipId: 'RL-882049',
  name: 'Mahfuzur Rahman Chowdhury',
  email: 'mahfuz@bangladesh.com',
  phone: '+880 1712-345678',
  tier: 'Heritage Atelier Tier',
  memberSince: 'September 2024',
  address: {
    line1: 'House 42, Road 11, Block D, Banani',
    division: 'Dhaka',
    city: 'Dhaka Metro',
    postalCode: '1213',
  },
  tailoringProfile: {
    height: "5' 11\"",
    chest: '40 Inches (Medium)',
    preferredPanjabiLength: '42 Inches',
    preferredFit: 'Slim Heritage Cut',
    preferredCollar: 'High Mandarin Collar',
  },
};

interface AuthContextType {
  user: PatronUser | null;
  isLoggedIn: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: Partial<PatronUser>, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<PatronUser>) => void;
  changePassword: (oldPw: string, newPw: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PatronUser | null>(defaultPatron);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Load from local storage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rongin_patron_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setIsLoggedIn(parsed.isLoggedIn);
      }
    } catch {
      // fallback to default
    }
  }, []);

  const saveState = (updatedUser: PatronUser | null, loggedIn: boolean) => {
    setUser(updatedUser);
    setIsLoggedIn(loggedIn);
    try {
      localStorage.setItem(
        'rongin_patron_auth',
        JSON.stringify({ user: updatedUser, isLoggedIn: loggedIn })
      );
    } catch {
      // localStorage may fail in some environments
    }
  };

  const login = async (email: string, _password?: string): Promise<boolean> => {
    // Authenticate patron
    const authedUser: PatronUser = {
      ...defaultPatron,
      email: email.trim() || defaultPatron.email,
    };
    saveState(authedUser, true);
    toast.success('Welcome back to the Patron Sanctuary', {
      description: `Logged in as ${authedUser.name} (${authedUser.membershipId})`,
    });
    return true;
  };

  const register = async (data: Partial<PatronUser>, _password?: string): Promise<boolean> => {
    const newUser: PatronUser = {
      ...defaultPatron,
      id: `usr_${Date.now()}`,
      membershipId: `RL-${Math.floor(100000 + Math.random() * 900000)}`,
      name: data.name || 'Honored Patron',
      email: data.email || defaultPatron.email,
      phone: data.phone || defaultPatron.phone,
      tier: 'Heritage Atelier Tier',
      memberSince: 'October 2026',
      tailoringProfile: {
        ...defaultPatron.tailoringProfile,
        preferredFit: data.tailoringProfile?.preferredFit || 'Slim Heritage Cut',
        preferredCollar: data.tailoringProfile?.preferredCollar || 'High Mandarin Collar',
      },
    };
    saveState(newUser, true);
    toast.success('Atelier Membership Conferred', {
      description: '৳500 Inaugural Patron Privilege has been credited to your account.',
    });
    return true;
  };

  const logout = () => {
    saveState(null, false);
    toast.info('Signed out of Patron Portal', {
      description: 'Have a dignified day.',
    });
  };

  const updateProfile = (data: Partial<PatronUser>) => {
    if (!user) return;
    const updated: PatronUser = {
      ...user,
      ...data,
      address: {
        ...user.address,
        ...(data.address || {}),
      },
      tailoringProfile: {
        ...user.tailoringProfile,
        ...(data.tailoringProfile || {}),
      },
    };
    saveState(updated, true);
    toast.success('Patron Details Saved', {
      description: 'Your tailoring profile & contact credentials have been updated.',
    });
  };

  const changePassword = (_oldPw: string, _newPw: string) => {
    toast.success('Password Successfully Updated', {
      description: 'Your sanctuary security key has been refreshed.',
    });
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
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
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
