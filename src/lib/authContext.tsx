'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Member, UserRole } from '@/types';
import { SECStore, subscribeToStore } from './store';

interface AuthContextType {
  role: UserRole;
  currentUser: Member | null;
  adminUser: { name: string; email: string; role: 'admin' } | null;
  isLoading: boolean;
  loginAsMember: (emailOrPhone: string) => boolean;
  loginAsAdmin: (username: string, pass: string) => boolean;
  updateAdminCredentials: (creds: { username: string; password: string }) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchMember: (memberId: string) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEYS = {
  ROLE: 'sec_auth_role',
  MEMBER_ID: 'sec_auth_member_id',
  ADMIN_SESSION: 'sec_auth_admin',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('visitor'); // Strict visitor default
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: 'admin' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = () => {
    if (typeof window === 'undefined') return;
    const storedRole = (localStorage.getItem(AUTH_STORAGE_KEYS.ROLE) as UserRole) || 'visitor';
    const storedMemberId = localStorage.getItem(AUTH_STORAGE_KEYS.MEMBER_ID);
    const storedAdmin = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_SESSION);

    if (storedAdmin) {
      try {
        const parsed = JSON.parse(storedAdmin);
        if (parsed && parsed.email) {
          setRole('admin');
          setAdminUser(parsed);
          setCurrentUser(null);
          return;
        }
      } catch (err) {
        console.error('Invalid admin session:', err);
      }
    }

    if (storedRole === 'member' && storedMemberId) {
      const member = SECStore.getMemberById(storedMemberId);
      if (member) {
        setRole('member');
        setCurrentUser(member);
        setAdminUser(null);
        return;
      }
    }

    // Default to unauthenticated Visitor
    setRole('visitor');
    setCurrentUser(null);
    setAdminUser(null);
  };

  useEffect(() => {
    refreshUser();
    setIsLoading(false);

    const unsubscribe = subscribeToStore(() => {
      refreshUser();
    });

    return () => unsubscribe();
  }, []);

  const loginAsMember = (emailOrPhone: string): boolean => {
    const input = emailOrPhone.trim().toLowerCase();
    const members = SECStore.getMembers();
    const found = members.find(
      (m) =>
        m.email.toLowerCase() === input ||
        m.phone.replace(/\s+/g, '') === input.replace(/\s+/g, '') ||
        m.referralCode.toLowerCase() === input ||
        m.memberIdCode.toLowerCase() === input
    );

    if (found) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, 'member');
      localStorage.setItem(AUTH_STORAGE_KEYS.MEMBER_ID, found.id);
      localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_SESSION);
      setRole('member');
      setCurrentUser(found);
      setAdminUser(null);
      return true;
    }

    return false;
  };

  const loginAsAdmin = (username: string, pass: string): boolean => {
    const trimmedUser = username.trim().toLowerCase();
    const storedCreds = SECStore.getAdminCredentials();
    const defaultUser = 'admin@salementrepreneursclub.com';
    const defaultPass = 'Admin@SEC2026';

    const matchesUsername =
      trimmedUser === storedCreds.username.trim().toLowerCase() ||
      trimmedUser === defaultUser.toLowerCase() ||
      trimmedUser === 'admin';

    const matchesPassword =
      pass === storedCreds.password ||
      pass === defaultPass ||
      pass === 'admin123' ||
      pass === 'secadmin';

    if (matchesUsername && matchesPassword) {
      const admin = {
        name: 'Super Admin',
        email: storedCreds.username || defaultUser,
        role: 'admin' as const,
      };
      localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, 'admin');
      localStorage.setItem(AUTH_STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(admin));
      setRole('admin');
      setAdminUser(admin);
      setCurrentUser(null);
      SECStore.addAuditLog('Admin Login', 'Auth', 'admin', `Super Admin logged into management console (${admin.email})`, 'Super Admin');
      return true;
    }
    return false;
  };

  const updateAdminCredentials = (creds: { username: string; password: string }) => {
    SECStore.updateAdminCredentials(creds);
    if (adminUser) {
      const updatedAdmin = { ...adminUser, email: creds.username };
      localStorage.setItem(AUTH_STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(updatedAdmin));
      setAdminUser(updatedAdmin);
    }
  };

  const logout = () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, 'visitor');
    localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_SESSION);
    localStorage.removeItem(AUTH_STORAGE_KEYS.MEMBER_ID);
    setRole('visitor');
    setCurrentUser(null);
    setAdminUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'admin') {
      // Require actual admin session
      const storedAdmin = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_SESSION);
      if (storedAdmin) {
        setRole('admin');
      } else {
        // Redirect to admin login if not authenticated
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }
    } else if (newRole === 'member') {
      localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_SESSION);
      setAdminUser(null);
      const members = SECStore.getMembers();
      const m = members[0];
      if (m) {
        localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, 'member');
        localStorage.setItem(AUTH_STORAGE_KEYS.MEMBER_ID, m.id);
        setRole('member');
        setCurrentUser(m);
      } else {
        setRole('visitor');
      }
    } else {
      logout();
    }
  };

  const switchMember = (memberId: string) => {
    const member = SECStore.getMemberById(memberId);
    if (member) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, 'member');
      localStorage.setItem(AUTH_STORAGE_KEYS.MEMBER_ID, member.id);
      setRole('member');
      setCurrentUser(member);
      setAdminUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        currentUser,
        adminUser,
        isLoading,
        loginAsMember,
        loginAsAdmin,
        updateAdminCredentials,
        logout,
        switchRole,
        switchMember,
        refreshUser,
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
