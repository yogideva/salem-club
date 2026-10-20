'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, Award, User } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();

  const profileHref = role === 'visitor' ? '/login' : '/dashboard';

  const items = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Referrals', href: '/referrals', icon: Award },
    { name: 'Profile', href: profileHref, icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070B14]/95 backdrop-blur-lg border-t border-amber-500/20 px-2 py-1.5 safe-area-bottom shadow-2xl"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition group relative ${
                active ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110 text-amber-400' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
              {active && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-amber-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
