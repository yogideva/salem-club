'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Menu,
  X,
  CreditCard,
  Users,
  Award,
  LogOut,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Globe,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { NotificationCenter } from './NotificationCenter';
import { GlobalSearchModal } from './GlobalSearchModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { role, currentUser, adminUser, logout, switchRole, switchMember } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settings, setSettings] = useState(SECStore.getSettings());

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setSettings(SECStore.getSettings());
    });
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Directory', href: '/members' },
    { name: 'Referrals', href: '/referrals' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#070B14]/90 backdrop-blur-md">
        {/* Top Announcement Bar / Quick Demo Role Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-[#0B1528] to-slate-950 px-4 py-1.5 border-b border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-amber-400 font-semibold">{settings.clubName || 'Salem Entrepreneurs Club'}</span>
            <span className="text-slate-400 hidden md:inline">• Connect. Collaborate. Grow.</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="hidden sm:inline">Official Chapter: Salem, Tamil Nadu</span>
            <Link href="/admin/login" className="text-slate-500 hover:text-amber-400 font-medium transition flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-base tracking-wider transition-transform group-hover:scale-105">
                SEC
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-wider uppercase text-white group-hover:text-amber-400 transition">
                  {settings.clubName || 'Salem Entrepreneurs Club'}
                </span>
                <span className="text-[10px] tracking-widest text-amber-400 uppercase font-semibold">
                  Private Network
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const isGated = !currentUser && link.href !== '/';
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                      active
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isGated && <Lock className="w-3 h-3 text-amber-400/80" />}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                title="Search"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notification Center */}
              <NotificationCenter />

              {/* Role-based Profile / CTA */}
              {role === 'visitor' && (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/70 transition"
                  >
                    Member Login
                  </Link>
                  <Link
                    href="/login?tab=signup"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition shadow-lg shadow-amber-500/25 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Sign Up
                  </Link>
                  <Link
                    href="/admin/login"
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/70 transition"
                    title="Admin Portal Login"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {role === 'admin' && (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    Member Login
                  </Link>
                  <Link
                    href="/admin"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Console
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-400 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {role === 'member' && currentUser && (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition"
                  >
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-amber-400"
                    />
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-bold text-white truncate max-w-[110px]">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {currentUser.memberIdCode}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0F172A] border border-amber-500/25 shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-slate-800 bg-[#0A101D]">
                        <p className="text-xs text-slate-400">Signed in as Member</p>
                        <p className="text-sm font-bold text-white truncate">{currentUser.fullName}</p>
                        <p className="text-xs text-amber-400 font-medium truncate">
                          {currentUser.business.businessName}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80"
                        >
                          <LayoutDashboard className="w-4 h-4 text-amber-400" />
                          Member Dashboard
                        </Link>
                        <Link
                          href="/membership-card"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80"
                        >
                          <CreditCard className="w-4 h-4 text-amber-400" />
                          Digital Member Card
                        </Link>
                        <Link
                          href={`/members/${currentUser.id}`}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80"
                        >
                          <Users className="w-4 h-4 text-amber-400" />
                          My Public Profile
                        </Link>
                        <Link
                          href="/referrals"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80"
                        >
                          <Award className="w-4 h-4 text-amber-400" />
                          Referrals & Commissions
                        </Link>
                      </div>

                      {/* Demo Member Quick Switcher */}
                      <div className="px-4 py-2 border-t border-slate-800">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                          Switch Demo Member:
                        </p>
                        <div className="flex flex-col gap-1">
                          {[
                            { id: 'm1', name: 'Saravanan (IT CEO)' },
                            { id: 'm2', name: 'Dr. Priya (Food/Sago)' },
                            { id: 'm3', name: 'Rajesh (Steel)' },
                          ].map((dm) => (
                            <button
                              key={dm.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                switchMember(dm.id);
                                setUserDropdownOpen(false);
                              }}
                              className={`text-left text-[11px] px-2 py-1 rounded transition ${
                                currentUser.id === dm.id
                                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                            >
                              • {dm.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-6 bg-[#0A101D] border-b border-amber-500/20 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const isGated = !currentUser && link.href !== '/';
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-between ${
                      active
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isGated && <Lock className="w-3.5 h-3.5 text-amber-400/70" />}
                  </Link>
                );
              })}

              {role === 'visitor' ? (
                <div className="pt-3 flex flex-col space-y-2 border-t border-slate-800">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-slate-800 text-sm font-semibold text-white"
                  >
                    Member Login
                  </Link>
                  <Link
                    href="/join"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-amber-400 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20"
                  >
                    Join Salem Entrepreneurs Club
                  </Link>
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center text-xs text-slate-500 hover:text-slate-300 py-1"
                  >
                    Admin Portal Login →
                  </Link>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-400"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Member Dashboard
                  </Link>
                  <Link
                    href="/membership-card"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-300"
                  >
                    <CreditCard className="w-4 h-4" /> Digital Member Card
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-300"
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin Console
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
