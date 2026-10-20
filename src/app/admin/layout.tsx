'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Award,
  MessageSquare,
  FileText,
  Settings,
  BarChart3,
  LogOut,
  ShieldAlert,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, adminUser, logout, switchRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If user is accessing /admin/login, don't show the dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Role Gate check:
  if (role !== 'admin' || !adminUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#0F172A] border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Admin Authentication Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This management console is restricted to authorized club board administrators only. Please sign in with your verified administrative credentials.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/admin/login"
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 block transition"
            >
              Sign In to Admin Portal
            </Link>

            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 pt-2 block transition"
            >
              ← Return to Public Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Member Management', href: '/admin/members', icon: Users },
    { name: 'Events & Attendance', href: '/admin/events', icon: Calendar },
    { name: 'Payments & UTR', href: '/admin/payments', icon: CreditCard },
    { name: 'Referral Commissions', href: '/admin/referrals', icon: Award },
    { name: 'Website Content CMS', href: '/admin/content', icon: FileText },
    { name: 'Settings & Audit Logs', href: '/admin/settings', icon: Settings },
    { name: 'Analytics & Reports', href: '/admin/analytics', icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col md:flex-row">
      {/* Mobile Admin Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A101D] border-b border-amber-500/20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs">
            SEC
          </div>
          <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
            Admin Console
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#0A101D] border-r border-amber-500/20 flex flex-col justify-between transition-transform duration-300 shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Logo & Admin Status */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20">
              SEC
            </div>
            <div>
              <span className="text-xs font-black tracking-widest uppercase text-white block">
                Executive Admin
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {adminUser?.email || 'admin@sec.com'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-[#070B14]">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              Public Portal
            </span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
        {children}
      </main>
    </div>
  );
}
