'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Users, Calendar, Award, Info, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { NotificationItem } from '@/types';

export const NotificationCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userId = currentUser ? currentUser.id : 'visitor';

  const loadNotifs = () => {
    const list = SECStore.getNotifications(userId);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifs();
    const unsubscribe = subscribeToStore(loadNotifs);
    return () => unsubscribe();
  }, [userId]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    SECStore.markAllNotificationsAsRead(userId);
  };

  const handleNotificationClick = (id: string) => {
    SECStore.markNotificationAsRead(id);
    setIsOpen(false);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'connection':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'referral':
        return <Award className="w-4 h-4 text-emerald-400" />;
      case 'membership':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition focus:outline-none"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black ring-2 ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0F172A] border border-amber-500/25 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0A101D]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 hover:bg-slate-800/60 transition ${
                    !notif.read ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <Link
                    href={notif.link || '#'}
                    onClick={() => handleNotificationClick(notif.id)}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white truncate">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 text-center border-t border-slate-800 bg-[#0A101D]">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              View Member Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
