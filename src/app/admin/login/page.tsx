'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, User, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SecurityRateLimiter, sanitizeInput } from '@/lib/security';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAsAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Check lockout on mount and interval
  useEffect(() => {
    const check = () => {
      const status = SecurityRateLimiter.checkLockout('admin_login');
      if (status.locked) {
        setLockoutSeconds(status.remainingSeconds);
      } else {
        setLockoutSeconds(0);
      }
    };

    check();
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Anti-Brute-Force Lockout Guard
    const status = SecurityRateLimiter.checkLockout('admin_login');
    if (status.locked) {
      setError(`Security Lockout: Too many failed attempts. Access blocked for ${status.remainingSeconds}s.`);
      return;
    }

    const cleanUsername = sanitizeInput(username);
    const success = loginAsAdmin(cleanUsername, password);

    if (success) {
      SecurityRateLimiter.reset('admin_login');
      router.push('/admin');
    } else {
      const attemptStatus = SecurityRateLimiter.recordFailedAttempt('admin_login', cleanUsername);
      if (attemptStatus.locked) {
        setLockoutSeconds(attemptStatus.lockoutSeconds);
        setError(`Security Lockout: 5 failed attempts reached. Administration console locked for 5 minutes.`);
      } else {
        setError(
          `Invalid admin credentials. Warning: ${attemptStatus.remainingAttempts} attempt(s) remaining before security lockout.`
        );
      }
    }
  };

  const isLocked = lockoutSeconds > 0;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#0F172A] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="h-16 px-4 py-2 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-xl border border-amber-400/40 w-fit">
            <img src="/images/sec-logo.png" alt="Salem Entrepreneurs Forum" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block">
              Executive Secretariat
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              SEF Admin Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized administration portal for members, conclaves, payments, and CMS.
            </p>
          </div>
        </div>

        {/* Lockout Warning Banner */}
        {isLocked && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-300 font-semibold flex items-center gap-2 animate-pulse">
            <Clock className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Brute-Force Protection Active: Login locked for {Math.floor(lockoutSeconds / 60)}m {lockoutSeconds % 60}s.
            </span>
          </div>
        )}

        {error && !isLocked && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Admin Username / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                disabled={isLocked}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@salementrepreneursclub.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Master Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                disabled={isLocked}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
          >
            <span>{isLocked ? 'Security Lockout Active' : 'Authenticate Admin Session'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <Link href="/login" className="hover:text-slate-300 transition">
            ← Return to Member Login
          </Link>
        </div>
      </div>
    </div>
  );
}
